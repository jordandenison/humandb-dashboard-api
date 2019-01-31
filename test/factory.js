const faker = require('faker')

const models = {
  user () {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()

    return {
      firstName,
      lastName,
      addressLine: faker.address.streetAddress(),
      city: faker.address.city(),
      postal: faker.address.zipCode(),
      state: faker.address.state(),
      stateCode: faker.address.stateAbbr(),
      country: faker.address.country(),
      countryCode: faker.address.countryCode(),
      role: 'user'
    }
  }
}

module.exports = {
  build (model) {
    return models[model]()
  }
}
