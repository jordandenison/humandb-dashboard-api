const DiscourseSSO = require('discourse-sso')

const discourseHostname = process.env.DISCOURSE_HOSTNAME

const sso = new DiscourseSSO(process.env.DISCOURSE_SSO_SECRET)

const getRedirectString = (nonce, external_id, email) => { // eslint-disable-line
  const userparams = {
    nonce,
    external_id,
    email,
    username: email
  }

  const queryString = sso.buildLoginString(userparams)

  return `https://${discourseHostname}/discussion/session/sso_login?${queryString}`
}

const verifyPayload = (payload, sig) => sso.validate(payload, sig)

module.exports = {
  getNonce: sso.getNonce,
  getRedirectString,
  verifyPayload
}
