// DOM stuff

const startButton = document.body.querySelector('#startButton'),
      rollButton = document.body.querySelector('#rollAllDice'),
      betButton = document.body.querySelector('#makeBet'),
      callButton = document.body.querySelector('#callButton'),
      raiseButton = document.body.querySelector('#raiseButton'),
      playersPerGameField = document.body.querySelector('#playersPerGame'),
      dicePerPlayerField = document.body.querySelector('#dicePerPlayer'),
      setupUI = document.body.querySelector('#setupUI'),
      gameUI = document.body.querySelector('#gameUI'),
      diceCup = document.body.querySelector('#diceCup'),
      rollUI = document.body.querySelector('#rollUI'),
      callUI = document.body.querySelector('#callUI'),
      betUI = document.body.querySelector('#betUI'),
      betDisplay = document.body.querySelector('#betDisplay');
      diceQuantity = document.body.querySelector('#diceQuantity');
      faceValue = document.body.querySelector('#faceValue');

//   GameState stuff

const isGameActive = false;
// Make variable "isGameActive" to hide or show setup
    // Use field values to set parameters for starting game

let isYourTurn = true;
// Make variable "isYourTurn" to show or hide dice controls, check isGameActive
    // (roll button, betting fields for number and value of dice)


// Get / Set Default Values

let dicePerPlayer = 5;
let playersPerGame = 3;
let betQuantity = 2;
let betValue = 2;

// 'change' sucks, fix this

dicePerPlayerField.addEventListener('change', function(){
    dicePerPlayer = parseInt(this.value);
})
playersPerGameField.addEventListener('change', function(){
    playersPerGame = parseInt(this.value);
})
diceQuantity.addEventListener('change', function(){
    betQuantity = parseInt(this.value);
})
faceValue.addEventListener('change', function(){
    betValue = parseInt(this.value);
})

let totalNumberOfDice = dicePerPlayer * playersPerGame;
   // get initial value for this from input, reduce when loses
let currentBet = [betQuantity, betValue];
    // rules: higher quantity of any face, or the same quantity of a higher face.
    // Need to write code to check this, product of allowable bet will not always be higher


// Functions:

const updateBetDisplay = () => {
    if(betQuantity && betValue){
        betDisplay.innerText = `I bid ${betQuantity} ${betValue}s.`;
    } else {
        betDisplay.innerText = ``;
    }
}
const checkTurn = () => {
    if(!isYourTurn){
        const message = document.createElement('p');
        message.innerText = 'Now we wait.';
        gameUI.lastChild.remove();
        gameUI.append(message);
    }
}
const calculateQuantity = () => {
    totalNumberOfDice = dicePerPlayer * playersPerGame;
    diceQuantity.innerHTML = '';
    for(i = 1; i <= totalNumberOfDice; i++){
        const newOption = document.createElement('option');
        newOption.innerText = i;
        newOption.setAttribute('value', i);
        diceQuantity.append(newOption);
    }
}
const startGame = () => {
    calculateQuantity();
    if(currentBet){
        updateBetDisplay();
    }
    setupUI.classList.add('d-none');
    diceCup.classList.remove('d-none');
    rollUI.classList.remove('d-none');
    betDisplay.classList.remove('d-none');
    // grab values, set game active, disappear setup div
} 
const rollDie = () => {
    // math.random for 1-6. run this for each die player has. 
    return Math.floor(Math.random() * 6 + 1)
}
const newDice = () => {
    const die = document.createElement('span');
    die.classList.add('btn', 'btn-dark');
    die.append(rollDie());
    diceCup.append(die);
}

// TODO: Somehow need to catch values of all dice in array that can be used for checking truth
// Write function to only allow player to call bluff if max bet is placed???


const rollAllDice = () => {
    diceCup.innerHTML = '';
    //  Delete old dice from last round, create new dice
    for(i = 0; i < dicePerPlayer; i++){
        newDice();
    }
    rollUI.classList.add('d-none');
    if(!isYourTurn){
        checkTurn();
        // const message = document.createElement('p');
        // message.innerText = 'Now we wait.';
        // gameUI.append(message);
    } else {
        if(currentBet){
            callUI.classList.remove('d-none');
        } else {
            betUI.classList.remove('d-none');
        }
    }
}
const callBluff = () => {

    // Run checks to see if previous bet was true or false
}
const makeBet = () => {
    currentBet = [betQuantity, betValue];
    betUI.classList.add('d-none');
    updateBetDisplay();
    isYourTurn = false;
    checkTurn();
    // delete stored value of previous bet
}
const raise = () => {
    betUI.classList.remove('d-none');
    callUI.classList.add('d-none');
    // delete stored value of previous bet
}
const allReady = () => {
    // check if all players have rolled
}


startButton.addEventListener('click', startGame)
rollButton.addEventListener('click', rollAllDice)
betButton.addEventListener('click', makeBet)
raiseButton.addEventListener('click', raise)
callButton.addEventListener('click', callBluff)



// TODO: add UI to show who needs to roll before betting can start
// pseudoAI? Use Math.Random with threshold to decide if will callBluff or makeBet
        // ^This is only if I can't get websocket workign and need to make this single player


