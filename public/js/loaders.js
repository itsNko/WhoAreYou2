export { fetchJSON };
let fullplayers = '../json/fullplayers.json'
let solution = '../json/solution.json'

async function fetchJSON(what) {
    if(what === "fullplayers")
        what = fullplayers
    else
        what = solution
    return await fetch(what).then(res => res.json())
}