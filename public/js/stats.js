import {game} from './main.js'
export {initState, updateStats, getStats, gamestats}


let initState = function(what, solutionId) {
    let WAYgameState = JSON.parse(localStorage.getItem('WAYgameState'))
    if(WAYgameState == null){
        localStorage.setItem('WAYgameState', JSON.stringify({
            "guesses" : [],
            "solution" : solutionId
        }))
        WAYgameState = JSON.parse(localStorage.getItem('WAYgameState'))
    }
    if(game.guesses.length < 1)
        WAYgameState.guesses.map(playerID => game.guesses.push(playerID))

    let state = WAYgameState.guesses.find(player => player == what)
    let anonymousFunction = function(guess){
        WAYgameState.guesses.push(guess)
        localStorage.setItem('WAYgameState', JSON.stringify(WAYgameState))
    }
    return [state, anonymousFunction]
}

function successRate (e){
    let stats = JSON.parse(localStorage.getItem(e))
    return stats.successRate
}

let getStats = function(what) {
    let stats = JSON.parse(localStorage.getItem(what))
    if(stats == null)
        stats = {   "winDistribution": [],
                    "gamesFailed": 0,
                    "currentStreak": 0,
                    "bestStreak": 0,
                    "totalGames": 0,
                    "successRate": 0
                }
    return stats
};


function updateStats(t, won){
    let gameStats = getStats("gameStats")
    if(won){
        gameStats.winDistribution.push(1)
        gameStats.currentStreak += 1
    }
    else
    {
        gameStats.winDistribution.push(0)
        gameStats.gamesFailed += 1
        gameStats.currentStreak = 0
    }

    if(gameStats.currentStreak > gameStats.bestStreak)
        gameStats.bestStreak = gameStats.currentStreak

    gameStats.totalGames += 1
    gameStats.successRate = ((gameStats.totalGames - gameStats.gamesFailed) / gameStats.totalGames) * 100

    //Save to localStorage:
    localStorage.setItem('gameStats', JSON.stringify(gameStats))
};


let gamestats = getStats('gameStats');

