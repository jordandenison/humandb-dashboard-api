const superagent = require('superagent')
const { URLSearchParams } = require('url')

const discourse = require('./discourse')

module.exports = function () {
  const app = this

  discourse.init(app)

  app.post(/(\/auth)?\/discussion\/post\/message/, async (req, res) => {
    const { title, raw } = req.body

    const data = new URLSearchParams({
      raw,
      title,
      api_key: 'd757e112ab624d50f8ad4dde9b2df67f08b9980fedd7608a91edaadd087cc614', // process.env.DISCOURSE_API_KEY,
      api_username: 'humandb'
    })

    const { body: json } = await superagent
      .post(`http://discourse-web/discussion/posts`)
      .set({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      })
      .send(data)

    res.json(json)
  })
}
