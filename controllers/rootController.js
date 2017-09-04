// const rootController = require('../controllers/rootController')
// app.route('/verify')
//   .get(rootController.getVerify)
//   .post(rootController.postVerify)
//
// app.get('/features', rootController.getFeatures)
//
// app.route('/contact')
//   .get(rootController.getContact)
//   .post(rootController.postContact)

function getVerify (req, res) {
  res.render('verify')
}

function postVerify (req, res) {
  // [AXN] NEED TO FIGURE OUT VERIFICATION LOGIC
  res.send('TO BE UPDATED')
}

function getFeatures (req, res) {
  res.render('features')
}

function getContact (req, res) {
  res.render('contact')
}

module.exports = {
  getVerify,
  postVerify,
  getFeatures,
  getContact
}
