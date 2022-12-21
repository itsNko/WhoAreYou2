var express = require('express');
var router = express.Router();
const mongojs = require('mongojs')
const {unlink} = require("fs");
const db = mongojs('mongodb://127.0.0.1:27017/footballdata', ['users'])

router.get('/', (req, res, next) => {
    res.render('register')
})

router.post('/', function(req, res, next) {
    db.users.findOne({"username": req.body.username}, (err, doc) => {
        if (err) {
            res.send(err);
        } else {
            console.log(doc)
            if(doc != null){
                res.render('message', {message: 'Username already in use.',accept: '/register'})
            }
            else{
                db.users.insert(
                    {
                        "username": req.body.username,
                        "password": req.body.password,
                        "name": req.body.name,
                        "surname": req.body.surname,
                        "email": req.body.email,
                        "type": "user"
                    },
                    (err, result) => {
                        if (err) {
                            res.send(err);
                        } else {
                            res.render('message', {message: 'You\'ve been successfully registered!', accept: '/login'})
                        }
                    });
            }
        }
    })
});
module.exports = router;