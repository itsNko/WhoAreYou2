const express = require('express');
var router = express.Router();
const fs = require('fs')
const fetch = require('cross-fetch')

const mongojs = require('mongojs')
const {unlink} = require("fs");
const db = mongojs('mongodb://127.0.0.1:27017/footballdata', ['teams', 'leagues', 'players'])

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('players');
});

/* Search player by ID. */
router.post('/', function(req, res, next) {
    console.log(req.body.playerid)
    res.redirect('players/read/' + parseInt(req.body.playerid));
});

/* Single player information. */
router.get('/read/:id', (req,res, next) => {
    console.log("id = " + req.params.id)
    db.players.findOne({id: parseInt(req.params.id)}, (err, doc) => {
        if (err) {
            res.send(err);
        } else {
            if(doc == null){
                res.render('message', {message: "The player doesn't exist.", accept: '/api/v1/players'})
            }
            else{
                console.log(doc)
                res.render('player', {element: doc})
            }
        }
    })
})

/* Player add page. */
router.get('/add', (req,res, next) => {
    if(req.session.user.type === 'admin')
        res.render('add')
    else
        res.render('message', {message: 'You must be admin to do this operation.',accept: '/api/v1/players'})
})

/* Add Player */
router.post('/add', (req, res, next) => {
    if(req.session.user.type === 'admin'){
        newPlayer = req.body

        db.players.insert(
            {
                "id": parseInt(newPlayer.id),
                "name": newPlayer.name,
                "birthdate": newPlayer.birthdate,
                "nationality": newPlayer.nationality,
                "teamId": parseInt(newPlayer.teamId),
                "position": newPlayer.position,
                "number": parseInt(newPlayer.number),
                "leagueId": parseInt(newPlayer.leagueId)
            },
            (err, result) => {
                if (err) {
                    res.send(err);
                } else {
                    console.log(result)
                    res.render('message', {message: 'Player successfully added.', accept: '/api/v1/players'})
                }
            }
        );
    }
    else
        res.render('message', {message: 'You must be admin to do this operation.',accept: '/api/v1/players'})
})

/* Player edit page. */
router.get('/edit/:id', (req,res, next) => {
    if(req.session.user.type === 'admin') {
        db.players.findOne({id: parseInt(req.params.id)}, (err, doc) => {
            if (err) {
                res.send(err);
            } else {
                if (doc == null) {
                    res.render('message', {message: "The player doesn't exist.", accept: '/api/v1/players'})
                } else {
                    console.log(doc)
                    res.render('edit', {elem: doc})
                }
            }
        })
    }
    else
        res.render('message', {message: 'You must be admin to do this operation.',accept: '/api/v1/players'})
})

/* Edit Player */
router.post('/edit/', (req, res, next) => {
    if(req.session.user.type === 'admin') {
        newPlayer = req.body
        db.players.findAndModify({
                query: {id: parseInt(req.body.id)},
                update: {
                    $set:
                        {
                            "id": parseInt(newPlayer.id),
                            "name": newPlayer.name,
                            "birthdate": newPlayer.birthdate,
                            "nationality": newPlayer.nationality,
                            "teamId": parseInt(newPlayer.teamId),
                            "position": newPlayer.position,
                            "number": parseInt(newPlayer.number),
                            "leagueId": parseInt(newPlayer.leagueId)
                        }
                }
            },
            (err, result) => {
                if (err) {
                    res.send(err)
                } else {
                    console.log(result)
                    res.render('message', {message: 'Player successfully edited.', accept: '/api/v1/players'})
                }
            })
    }
    else
        res.render('message', {message: 'You must be admin to do this operation.',accept: '/api/v1/players'})
})

/* Delete player. */
router.get('/remove/:id', (req, res, next) => {
    if(req.session.user.type === 'admin') {
        db.players.remove({id: parseInt(req.params.id)}, (err, result) => {
            if (err) {
                res.send(err);
            } else {
                console.log(result)
                if (result.n < 1) {
                    res.render('message', {message: 'The player doesn\'t exist.', accept: '/api/v1/players'})
                } else {
                    res.render('message', {message: 'Player has been successfully removed.', accept: '/api/v1/players'})
                }
            }
        });
    }
    else
        res.render('message', {message: 'You must be admin to do this operation.',accept: '/api/v1/players'})
})

/* Reset/Update DB. */
/*
router.get('/update', function(req, res, next) {
    //Delete documents:
    db.leagues.count(function (err, count) {
        if (!err && count !== 0) {
            db.leagues.drop()
        }
    })

    db.teams.count(function (err, count) {
        if (!err && count !== 0) {
            db.teams.drop()
        }
    })

    db.players.count(function (err, count) {
        if (!err && count !== 0) {
            db.players.drop()
        }
    })

    //Insert leagues information:
    leagueIDs = [82, 564, 384, 8, 301]
    leagueIDs.forEach((elem) => {
        const url = `https://v3.football.api-sports.io/leagues?id=${elem}`
        fetch(url, {
            method: 'GET',
            headers: {
                "x-rapidapi-host": "v3.football.api-sports.io",
                "x-rapidapi-key": "ab2350a903c16ae1d62dcd829a83341c"
            }
        }).then(r => r.json())
            .then(res => {
                console.log(res)
                console.log(res['response'][0])
                db.leagues.insert(res['response'][0])
            })
            .catch(err => console.log(err))
    })

        //Insert teams from league 564:
        let players = {};
        // Read leagues file into an array of league IDs.
        players = JSON.parse(fs.readFileSync('./json/players.json', 'utf8'))
        let repeatedTeamIDs = players.filter(player => player.leagueId == 564).map(ident => ident.teamId)
        let teamIDs = repeatedTeamIDs.filter(function (item, pos) {
            return repeatedTeamIDs.indexOf(item) == pos;
        })

        console.log("ids:kdkd" + teamIDs)
        //Fetch teams' information:
        teamIDs.forEach((elem) => {
            const url = `https://v3.football.api-sports.io/teams?id=${elem}`
            fetch(url, {
                method: 'GET',
                headers: {
                    "x-rapidapi-host": "v3.football.api-sports.io",
                    "x-rapidapi-key": "ab2350a903c16ae1d62dcd829a83341c"
                }
            }).then(r => r.json())
                .then(res => {
                    db.teams.insert(res['response'][0])
                    console.log(`TeamID: ${elem} saved.`)
                })
                .catch(err => console.log(err))
        })

    //Insert players (from players.json) (API could be used to but it has limited calls):
    fs.readFile('json/players.json', 'utf8', function (err, data) {
        if (err) throw err;
        console.log(data);
        var json = JSON.parse(data);

        db.players.insert(json, function(err, doc) {
            console.log(data);
            if(err) throw err;
        });
    });
    res.redirect('/api/v1/players')
});
*/

module.exports = router;