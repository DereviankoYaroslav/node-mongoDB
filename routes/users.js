var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
/*
When an Admin sends a GET request to http://localhost:3000/users you will return the details of all the users. 
Ordinary users are forbidden from performing this operation.
*/
router.get('/', authenticate.verifyUser, function(req, res, next) {
  var err = authenticate.verifyAdmin(req.user.admin);
    if (err){
        next(err);
    } 
    else {
      User.find({})
        .then((user) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
});

router.post('/signup', function(req, res, next){
  User.register(new User ({username: req.body.username}), 
  req.body.password, (err, user) => {
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      });
    }
  });
});

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'Login Successful!'});
});

router.get('/logout', (req, res, next) => {
  if (req.headers.authorization != null){
    res.clearCookie("jwt");
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in');
    err.status = 401;
    next(err);
  }
});

module.exports = router;
