import {stringToHTML, higher, lower, headless, stats, toggle} from './fragments.js'
import {getSolution, differenceInDays} from './main.js'
import {initState, updateStats} from './stats.js'
export {setupRows}

// From: https://stackoverflow.com/a/7254108/243532
function pad(a, b){
    return(1e15 + a + '').slice(-b);
}

const delay = 350;
const attribs = ['nationality', 'leagueId', 'teamId', 'position', 'birthdate']
let players = await fetch('../json/fullplayers.json').then(res => res.json())
let solutionArray = await fetch('../json/solution.json').then(res => res.json())
let timeLeftInterval

let setupRows = function (game) {


    let [state, updateState] = initState('WAYgameState', game.solution.id)
    
    let leagueToFlagJSON = [
        {
            "league" : "564",
            "flag" : "es1"
        },
        {
            "league" : "8",
            "flag" : "en1"
        },
        {
            "league" : "82",
            "flag" : "de1"
        },
        {
            "league" : "384",
            "flag" : "it1"
        },
        {
            "league" : "301",
            "flag" : "fr1"
        }
    ]

    function leagueToFlag(leagueId) {
        return leagueToFlagJSON.filter(league => league.league == leagueId)[0].flag
    }

    function getAge(dateString) {
        var birthDate = new Date(dateString);
        var today = new Date();
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    let check = function (theKey, theValue) {
        let result = 'incorrect'
        let solution = getSolution(players, solutionArray, differenceInDays(new Date('08/18/2022')))
        if(theKey == 'birthdate')
            if(getAge(solution.birthdate) > getAge(theValue))
                result = 'higher'
            else if(getAge(solution.birthdate) < getAge(theValue))
                result = 'lower'
            else
                result = 'correct'
        else
        if(solution[theKey] == theValue)
            result = 'correct'
        return result
    }

        function unblur(outcome) {
        return new Promise( (resolve, reject) =>  {
            setTimeout(() => {
                document.getElementById("mistery").classList.remove("hue-rotate-180", "blur")
                document.getElementById("combobox").remove()
                let color, text
                if (outcome=='success'){
                    color =  "bg-blue-500"
                    text = "Awesome"
                } else {
                    color =  "bg-rose-500"
                    text = "The player was " + game.solution.name
                }
                document.getElementById("picbox").innerHTML += `<div class="animate-pulse fixed z-20 top-14 left-1/2 transform -translate-x-1/2 max-w-sm shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${color} text-white"><div class="p-4"><p class="text-sm text-center font-medium">${text}</p></div></div>`
                resolve();
            }, "2000")
        })
    }


    function showStats(timeout) {
        return new Promise( (resolve, reject) =>  {
            setTimeout(() => {
                document.body.appendChild(stringToHTML(headless(stats())));
                document.getElementById("showHide").onclick = toggle;
                bindClose();
                resolve();
            }, timeout)
        })
    }

    function bindClose() {
        document.getElementById("closedialog").onclick = function () {
            clearInterval(timeLeftInterval)
            document.body.removeChild(document.body.lastChild)
            document.getElementById("mistery").classList.remove("hue-rotate-180", "blur")
        }
    }


    function setContent(guess) {
        let birthdateSymbol = ''
        if(check('birthdate', guess.birthdate) == 'lower')
            birthdateSymbol = lower
        else if(check('birthdate', guess.birthdate) == 'higher')
            birthdateSymbol = higher

        return [
            `<img src="https://playfootball.games/who-are-ya/media/nations/${guess.nationality.toLowerCase()}.svg" alt="" style="width: 60%;">`,
            `<img src="https://playfootball.games/media/competitions/${leagueToFlag(guess.leagueId)}.png" alt="" style="width: 60%;">`,
            `<img src="https://cdn.sportmonks.com/images/soccer/teams/${guess.teamId % 32}/${guess.teamId}.png" alt="" style="width: 60%;">`,
            `${guess.position}`,
            `${getAge(guess.birthdate)}${birthdateSymbol}`
        ]
    }

    function showContent(content, guess) {
        let fragments = '', s = '';
        for (let j = 0; j < content.length; j++) {
            s = "".concat(((j + 1) * delay).toString(), "ms")
            fragments += `<div class="w-1/5 shrink-0 flex justify-center ">
                            <div class="mx-1 overflow-hidden w-full max-w-2 shadowed font-bold text-xl flex aspect-square rounded-full justify-center items-center bg-slate-400 text-white ${check(attribs[j], guess[attribs[j]]) == 'correct' ? 'bg-green-500' : ''} opacity-0 fadeInDown" style="max-width: 60px; animation-delay: ${s};">
                                ${content[j]}
                            </div>
                         </div>`
        }

        let child = `<div class="flex w-full flex-wrap text-l py-2">
                        <div class=" w-full grow text-center pb-2">
                            <div class="mx-1 overflow-hidden h-full flex items-center justify-center sm:text-right px-4 uppercase font-bold text-lg opacity-0 fadeInDown " style="animation-delay: 0ms;">
                                ${guess.name}
                            </div>
                        </div>
                        ${fragments}`

        let playersNode = document.getElementById('players')
        playersNode.prepend(stringToHTML(child))
    }

    function getPlayer(playerId){
        return players.filter(player => player.id == playerId)[0]
    }

    function resetInput(){
        let myInput = document.getElementById('myInput')
        let guessCount = JSON.parse(localStorage.getItem('WAYgameState')).guesses.length
        myInput.value = `Guess ${guessCount} of 8`
    }


    function gameEnded(lastGuess){
        let guessCount = JSON.parse(localStorage.getItem('WAYgameState')).guesses.length
        let result = false
        if(lastGuess == game.solution.id || guessCount >= 8)
            result = true
        return result
    }

    function success(){
        unblur('success')
        showStats(12)
    }

    function gameOver(){
        unblur('gameOver')
        showStats(12)
    }
    
    resetInput();

    return /* addRow */ function (playerId) {

        let guess = getPlayer(playerId)
        console.log(guess)

        let content = setContent(guess)

        game.guesses.push(playerId)
        updateState(playerId)

        resetInput();

         if (gameEnded(playerId)) {
            updateStats(game.guesses.length, playerId == game.solution.id);

            if (playerId == game.solution.id) {
                success();
            }

            if (game.guesses.length == 8) {
                gameOver();
            }

             timeLeftInterval = setInterval(() => {
                 let textField = document.getElementById('newPlayer')
                 let today = new Date()
                 textField.innerHTML = `${('0' + ((24 - today.getHours()) % 24)).slice(-2)}:${('0' + ((60 - today.getMinutes()) % 60)).slice(-2)}:${('0' + ((60 - today.getSeconds()) % 60)).slice(-2)}`
             }, 1000);

            let interval = timeLeftInterval


         }


        showContent(content, guess)
    }
}
