// this file is required by app.js, where it is connected to sessions
// in this file, we want to set up the authentication strategies, in this case just local strategy (i.e. pwd saved in mongodb), no oauth strategies e.g. facebook oauth.
// we set up one local strategy for login, and one local strategy for signup
// importantly, this file first determines what data from user is stored in session documents (.serializeUser), and then uses that data to find the user (document), and assigns it to the req.user object (.deserializeUser)

// require the necessary module(s)
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

// require the user model, which passport has to filter through to find the right document
const User = require('../models/User')

module.exports = function (passport) {
  // creates the object, req.session.passport.user = {id: ‘xyz’}. You shd be able to see this in the DB! [AXN: CHECK OUT THIS OBJECT IN CONSOLE AND IN THE DB]. Note: I can replace done with next here, i think
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  // opens the session for the user that is [logged in]. Looks up id stored in the open session document, creates a req.user object which is the current user's document stored in the users collection
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user)
    })
  })

  // configure the local strategy for sign up
  passport.use('local-signup', new LocalStrategy ({
    firstnameField: 'firstname',
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  }, function (req, firstname, email, password, done) {
    // find a user with this email
    // console.log('gets to local-signup strategy in passport.js file')
    User.findOne({ 'email': email }, function (err, user) {
      // console.log('gets to exec in local-signup strategy in passport.js file')
      if (err) return done(err)
      // if there is a user with this email
      if (user) {
        return done(null, false, req.flash('errorMessage', 'This email is already taken'))
      } else {
        // create a new user
        // console.log('starts creating new User in local-signup strategy in passport.js file')
        var newUser = new User()
        newUser.firstname = firstname
        newUser.email = email
        // note that the password is set as the plaintext pwd here, but it is hashed before being saved to the DB because of a pre save hook (see User model file)
        newUser.password = password

        newUser.save(function (err, user) {
          if (err) return done(err)
          return done(null, user)
        })
      }})
  }))

  // configure the local strategy for login
    // assign the name attributes of the form fields (e.g. <label for="authEmail">Email</label> <input id="authEmail" class="form-control" type="email" name="user[email]">), and reference the callback function through which to pass the inputs
  passport.use('local-login', new LocalStrategy ({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
      }, function (req, email, password, done) {
    // form submission data is passed into this function to perform the authentication logic
    User.findOne({
      email: email
    })
    .exec(function (err, foundUser) {
      if (err) return done(err)
      // if no user is found
      if(!foundUser) return done(null, false, req.flash('errorMessage', 'No user found'))
      // check if the password is correct
      if (!foundUser.validPassword(password)) return done(null, false, req.flash('errorMessage', 'Wrong password'))
      return done(null, foundUser)
    })
  }))
}
