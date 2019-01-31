// const superagent = require('superagent')
// const mkFhir = require('fhir.js')

// const oneUp = require('./1up')

// const client = mkFhir({
//   baseUrl: 'http://192.168.100.135:4001/v/r3/fhir'
// })

// const create = resourceType => {
//   const resource = {
//     resourceType,
//     // active: true,
//     name: [{
//       use: 'official',
//       family: ['Denison'],
//       given: ['Jordan', 'P.']
//     }],
//     gender: 'female',
//     birthDate: '1948-04-14'
//   }

//   var entry = {
//     category: [{
//       term: 'term',
//       schema: 'schema',
//       label: 'label'
//     }],
//     resource
//   }

//   client.create(entry)
//     .then(res => console.log('create res ', res))
//     .catch(e => console.log('create e ', e))
// }

const syncData = async app => {
  // const { accessToken, clientId, clientSecret, url } = await oneUp.getCredentials()

  // const result = await superagent.get(`${url}/fhir/dstu2/Patient`).set({ Authorization: `Bearer ${accessToken}` })
  // console.log('result ', result.body)

  // console.log('at ', accessToken)
}

module.exports = {
  syncData
}

// oneUp.getCredentials().then(async ({ accessToken, clientId, clientSecret, url }) => {

//   // const result = await superagent.get(`${url}/user-management/v1/user`).send({ client_id: clientId, client_secret: clientSecret })
//   // console.log('result ', result.body)

//   const result = await superagent.post(`${url}/fhir/dstu2/Patient`)
//                                 // .set({ Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' })
//                                 .send({
//                                   resourceType: 'Patient',
//                                   // id: '135375',
//                                   meta: { versionId: '1', lastUpdated: '2017-05-26T12:00:41.233-04:00' },
//                                   name: [ { use: 'official', text: 'biolbo', family: 'baggins', given: [ 'bilbo' ] } ],
//                                   gender: 'male',
//                                   birthDate: '1993-06-20'
//                                 })
//   console.log('result ', result.body)
// })

// curl -X GET "https://api.1up.health/user-management/v1/user" \
//   -d "client_id=clientidclientidclientid" \
//   -d "client_secret=clientsecretclientsecret" \
