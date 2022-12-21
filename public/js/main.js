import { folder, leftArrow } from "./fragments.js";
import { fetchJSON } from "./loaders.js";
import {setupRows} from './rows.js'
export {getSolution, differenceInDays, game}
import {autocomplete} from './autocomplete.js'

let solution

function differenceInDays(date1) {
    let today = new Date()
    let diffTime = Math.abs(today - date1)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

let difference_In_Days = differenceInDays(new Date("2022-08-18"))

window.onload = function () {
  document.getElementById(
    "gamenumber"
  ).innerText = difference_In_Days.toString();
  document.getElementById("back-icon").innerHTML = folder + leftArrow;
};

let game = {
  guesses: [],
  solution: {},
  players: [],
  leagues: []
};

function getSolution(players, solutionArray, difference_In_Days) {
    let solutionArraySize = Object.keys(solutionArray).length
    let index = (difference_In_Days === 0)? 0 : ((difference_In_Days - 1) % solutionArraySize)
    let key = solutionArray[index].id
    return players.filter(player => player.id == key)[0]
}

Promise.all([fetchJSON("fullplayers"), fetchJSON("solution")]).then(
  (values) => {

    let solution;
    
    [game.players, solution] = values;

    game.solution = getSolution(game.players, solution, difference_In_Days);

    console.log(game.solution);

    document.getElementById(
      "mistery"
    ).src = `https://playfootball.games/media/players/${
      game.solution.id % 32
    }/${game.solution.id}.png`;

    autocomplete(document.getElementById('myInput'), game)
  }
);

//Reset combo-box if GUESS x OF 8 text appears:
let myInput = document.getElementById('myInput')
myInput.addEventListener('focus', e => {
    if(myInput.value.toUpperCase().startsWith('GUESS'))
        myInput.value = ''
})
