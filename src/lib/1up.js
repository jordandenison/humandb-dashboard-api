const superagent = require('superagent')

const { delay } = require('lib/util')

const url = process.env.ONE_UP_API_URL
const clientId = process.env.ONE_UP_CLIENT_ID
const clientSecret = process.env.ONE_UP_CLIENT_SECRET
const accessTokenLifespan = process.env.ACCESS_TOKEN_LIFESPAN || 7000000

const getAuthCode = async userId => {
  console.log('getting auth code ', clientId, clientSecret, userId)
  console.log(`auth code URL ${url}/user-management/v1/user`)
  const newUserResult = await superagent.post(`${url}/user-management/v1/user`).send({ client_id: clientId, client_secret: clientSecret, app_user_id: userId })
  .timeout({
    response: 120000,
    deadline: 120000
  })
console.log('new user resuukt ', newUserResult)
  if (newUserResult.body.success) {
    console.log('getting auth code new')
    return newUserResult.body.code
  }
console.log('getting auth code exisiting')
  const existingUserResult = await superagent.post(`${url}/user-management/v1/user/auth-code`).send({ client_id: clientId, client_secret: clientSecret, app_user_id: userId })
  .timeout({
    response: 120000,
    deadline: 120000
  })
console.log('getting auth code existing done')
  return existingUserResult.body.code
}

const getTokensWithCode = async code => {
  const result = await superagent.post(`${url}/fhir/oauth2/token`).send({ client_id: clientId, client_secret: clientSecret, grant_type: 'authorization_code', code })

  return { accessToken: result.body.access_token, refreshToken: result.body.refresh_token }
}

const getTokensWithRefreshToken = async refreshToken => {
  const result = await superagent.post(`${url}/fhir/oauth2/token`).send({ client_id: clientId, client_secret: clientSecret, grant_type: 'refresh_token', refresh_token: refreshToken })

  return { accessToken: result.body.access_token, refreshToken: result.body.refresh_token }
}

const storeUserTokens = (app, accessToken, refreshToken) =>
  app.service('user').patch(null, { oneUpAccessToken: accessToken, oneUpRefreshToken: refreshToken, oneUpClientId: clientId }, { query: { role: 'owner' } })

const watchRefreshTokens = async (app, originalRefreshToken) => {
  await delay(accessTokenLifespan)

  let newRefreshToken

  try {
    const { accessToken, refreshToken } = await getTokensWithRefreshToken(originalRefreshToken)
    newRefreshToken = refreshToken
    await storeUserTokens(app, accessToken, refreshToken)  
  } catch(e) {
    console.log(`Error refreshing 1up tokens ${e.message}`)
  }

  return watchRefreshTokens(app, newRefreshToken || originalRefreshToken)
}

module.exports = {
  async init (app) {
    console.log('1up init ', url, clientId, clientSecret)
    const ownerResults = await app.service('user').find({ query: { role: 'owner' } })
    const [owner] = ownerResults.data
console.log('owner ', owner)
    const code = await getAuthCode(owner.id)
    const { accessToken, refreshToken } = await getTokensWithCode(code)
    console.log('storing tokens ', accessToken, refreshToken)
    await storeUserTokens(app, accessToken, refreshToken)

    watchRefreshTokens(app, refreshToken)
  }
}
