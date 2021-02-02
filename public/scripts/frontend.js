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
      roomUI = document.body.querySelector('#roomUI'),
      warningUI = document.body.querySelector('#warningUI'),
      falseBetUI = document.body.querySelector('#falseBetUI'),
      trueBetUI = document.body.querySelector('#trueBetUI'),
      betDisplay = document.body.querySelector('#betDisplay');
      diceQuantity = document.body.querySelector('#diceQuantity');
      faceValue = document.body.querySelector('#faceValue'),
      form = document.getElementById('form'),
      roomInput = document.getElementById('input'),
      nameInput = document.getElementById('username');

//   GameState stuff

const socket = io();
const isGameActive = false;
// Make variable "isGameActive" to hide or show setup
    // Use field values to set parameters for starting game

let isYourTurn = true;
// Make variable "isYourTurn" to show or hide dice controls, check isGameActive
    // (roll button, betting fields for number and value of dice)


// Get / Set Default Values

let dicePerPlayer = 5;
let playersPerGame = 3;
let betQuantity = 3;
let betValue = 1;
let currentDiceValues = [];

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

const generateRoomID = () => {
    const roomCode = [];
    var result           = '';
     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
     for ( var i = 0; i < 4; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 26));
     }
     return result;
  }

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
    const newDie = rollDie();
    die.classList.add('btn', 'btn-dark');
    die.append(newDie);
    currentDiceValues.push(newDie);
    diceCup.append(die);
}

// TODO: Somehow need to catch values of all dice in array that can be used for checking truth
// Write function to only allow player to call bluff if max bet is placed???

// make function that creates new rollDice button and fields for each
// player, as they roll, pushes their dice values to array for checking.


const rollAllDice = () => {
    diceCup.innerHTML = '';
    //  Delete old dice from last round, create new dice
    for(i = 0; i < totalNumberOfDice; i++){
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
    const betAmount = [];
    const actualAmount = [];
    for(i = 0; i < betQuantity; i++){
        betAmount.push(betValue);
    }
    console.log(`betAmount is "${betAmount}"`)
    currentDiceValues.forEach(function(die){
        if(die == betValue){
            actualAmount.push(die);
        }
    })
    console.log(`actualAmount is "${actualAmount}"`)
    
    if(betAmount.length > actualAmount.length){
        falseBetUI.classList.remove('d-none');
    } else {
        trueBetUI.classList.remove('d-none');
    }
    callUI.classList.add('d-none');
}
const makeBet = () => {
    if(betQuantity > currentBet[0] || betValue > currentBet[1]){
        currentBet = [betQuantity, betValue];
        betUI.classList.add('d-none');
        updateBetDisplay();
        isYourTurn = false;
        checkTurn();
        warningUI.innerHTML = '';
    } else {
        warningUI.innerHTML = '<p>Please place a bet higher than the previous one.</p>';
    }
    
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


form.addEventListener('submit', function(e) {
    e.preventDefault();
    let username, roomID;
    if (roomInput.value) {
        roomID = roomInput.value.toUpperCase();
        username = nameInput.value;
        socket.emit('join or create room', roomID, username);
    } else {
        roomID = generateRoomID();
        roomInput.value = roomID;
        username = nameInput.value;
        socket.emit('join or create room', roomID, username);
    }
    roomUI.classList.add('d-none');
    setupUI.classList.remove('d-none');
})    

socket.on('message', (rooms, users) => {
    console.log(rooms, users);
})
socket.on('HUD', (roomID, username) => {
    const roomCode = `<span id='roomcode'>Room Code: <b>${roomID}</b></span>`
    const nameDisplay = `<span id='nameDisplay'>Username: <b>${username}</b></span>`
    const roomSpan = document.createElement('span');
    roomSpan.innerHTML = roomCode;
    const nameSpan = document.createElement('span');
    nameSpan.innerHTML = nameDisplay;
document.body.prepend(roomSpan, nameSpan);
})




startButton.addEventListener('click', startGame)
rollButton.addEventListener('click', rollAllDice)
betButton.addEventListener('click', makeBet)
raiseButton.addEventListener('click', raise)
callButton.addEventListener('click', callBluff)



// TODO: add UI to show who needs to roll before betting can start
// pseudoAI? Use Math.Random with threshold to decide if will callBluff or makeBet
        // ^This is only if I can't get websocket workign and need to make this single player


