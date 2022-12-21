var express = require('express');
var router = express.Router();
const mongojs = require('mongojs')
const db = mongojs('mongodb://127.0.0.1:27017/footballdata', ['users'])
/*
//Loaded users:
{
  "username": "admin",
  "password": "admin",
  "name": "admin",
  "surname": "admin",
  "email": "admin@admin.admin",
  "type": "admin"
},
{
  "username": "user",
  "password": "pass",
  "name": "User",
  "surname": "User",
  "email": "user@user.user",
  "type": "user"
}
 */

/* Users login */
router.get('/', function(req, res, next) {
  res.render('login');
});

router.post('/', function(req, res, next) {
  db.users.findOne({"username": req.body.username}, (err, doc) => {
    if (err) {
      res.send(err);
    } else {
      console.log(doc)
      if(doc == null){
        res.render('message', {message: 'Incorrect username.',accept: '/login'})
      }
      else{
        if(req.body.password !== doc.password){
          res.render('message', {message: 'Incorrect password.',accept: '/login'})
        }
        else{
          req.session.user = doc
          res.redirect('/api/v1/players');
        }
      }
    }
  })
});

module.exports = router;
