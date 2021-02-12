// DOM stuff
const startButton = document.body.querySelector('#startButton'),
      rollButton = document.body.querySelector('#rollAllDice'),
      betButton = document.body.querySelector('#makeBet'),
      callButton = document.body.querySelector('#callButton'),
      raiseButton = document.body.querySelector('#raiseButton'),
      submitButton = document.body.querySelector('#submitButton'),
      randomizeButton = document.body.querySelector('#randomizeButton'),
      playersList = document.body.querySelector('#playersList'),
      dicePerPlayerField = document.body.querySelector('#dicePerPlayer'),
      setupUI = document.body.querySelector('#setupUI'),
      userColor = document.body.querySelector('#userColor'),
      fontColor = document.body.querySelector('#numberColor'),
      gameUI = document.body.querySelector('#gameUI'),
      diceCup = document.body.querySelector('#diceCup'),
      myDice = document.body.querySelector('#myDice'),
      otherDice = document.body.querySelector('#otherDice'),
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
let dicePerPlayer = 5;
let playersPerGame = 3;
let betQuantity = 3;
let betValue = 1;
let currentDiceValues = [];
let isYourTurn = false;
let roomID = undefined;
let myID = undefined;

dicePerPlayerField.addEventListener('change', function(){
    dicePerPlayer = parseInt(this.value);
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

const dieFaces = (user) => { return {1:`<svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="${user.numberColor}" class="bi bi-dice-1" viewBox="0 0 16 16">
<circle cx="8" cy="8" r="1.5"/></svg>`,
2: `<svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="${user.numberColor}" class="bi bi-dice-2" viewBox="0 0 16 16">
<path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`,
3:`<svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="${user.numberColor}" class="bi bi-dice-3" viewBox="0 0 16 16">
<path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-4-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`,
4: `<svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="${user.numberColor}" class="bi bi-dice-4" viewBox="0 0 16 16">
<path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`,
5: `<svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="${user.numberColor}" class="bi bi-dice-5" viewBox="0 0 16 16">
<path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm4-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`,
6:`<svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" fill="${user.numberColor}" class="bi bi-dice-6" viewBox="0 0 16 16">
<path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-8 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`}}


const randomColor = () => {
    const color = () => {return Math.floor(Math.random()*16777215).toString(16);}
    userColor.value = `#${color()}`
    fontColor.value = `#${color()}`
}

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
const checkTurn = (users, rooms) => {
        if(rooms[roomID].currentTurn === users[myID].number){
            isYourTurn = true;
        }
}
// const calculateQuantity = () => {
//     totalNumberOfDice = dicePerPlayer * playersPerGame;
//     diceQuantity.innerHTML = '';
//     for(i = 1; i <= totalNumberOfDice; i++){
//         const newOption = document.createElement('option');
//         newOption.innerText = i;
//         newOption.setAttribute('value', i);
//         diceQuantity.append(newOption);
//     }
// }
const startGame = () => {
    if(currentBet){
        updateBetDisplay();
    }
    setupUI.classList.add('d-none');
    diceCup.classList.remove('d-none');
    rollUI.classList.remove('d-none');
    betDisplay.classList.remove('d-none');
    playersList.classList.add('d-none');
} 
class Die {
    constructor(user){
        this.user = user;
        this.value = Math.floor(Math.random() * 6 + 1);
        this.color = user.color;
    }
}
const rollDice = (user, users, rooms) => {
    diceCup.firstElementChild.innerHTML = '';
    const hand = {};
    for(i = 0; i < user.numberOfDice; i++){
        const die = new Die(user);
        hand[i] = die;
    }
    for(die in hand){
        const dieHTML = ` <span class='dice' style='background-color:${hand[die].color}'>
                            <span class='dieFace'>${dieFaces(user)[hand[die].value]}</span>
                          </span>`
       
        myDice.innerHTML += dieHTML;
    }
    // console.log(hand);
    socket.emit('addingDice', hand);
    rollUI.classList.add('d-none');
    checkTurn(users, rooms);
    if (isYourTurn === true){
        warningUI.innerText = `It's your turn!`
    } else {
        warningUI.innerText = `It's not your turn yet.`
    }
}

const revealDice = () => {
    const faces = document.body.querySelector('#otherDice').querySelectorAll('.dieFace');
    for(el in faces){
        el.classList.remove('d-none');
    }
}
const displayDice = (dice, users) => {
    otherDice.innerHTML = '';
    for(hand in dice){
        const faces = dieFaces(users[hand]);
        if(myID !== hand){
            const diceRow = document.createElement('div');
            diceRow.classList.add('row', 'justify-content-center');
            for(die in dice[hand]){
                console.log(dice[hand][die].user.numberColor)
                const dieHTML = ` <span class='dice' style='background-color:${dice[hand][die].color}'>
                                    <span class='dieFace d-none'>${faces[dice[hand][die].value]}</span>
                                  </span>`
                diceRow.innerHTML += dieHTML;
            }
            otherDice.append(diceRow);
        }
    }
    // for each dice set that isn't yours, append it to the otherDice element
    // console.log(`NEW DICE!!!!`)
    // console.log(dice);
}
// const rollDie = () => {
//     return Math.floor(Math.random() * 6 + 1)
// }
// const newDice = () => {
//     const die = document.createElement('span');
//     const newDie = rollDie();
//     die.classList.add('btn', 'btn-dark');
//     die.append(newDie);
//     currentDiceValues.push(newDie);
//     diceCup.append(die);
// }

// const rollAllDice = () => {
//     diceCup.innerHTML = '';
//     //  Delete old dice from last round, create new dice
//     for(i = 0; i < totalNumberOfDice; i++){
//         newDice();
//     }
//     rollUI.classList.add('d-none');
//     if(!isYourTurn){
//         checkTurn();
//     } else {
//         if(currentBet){
//             callUI.classList.remove('d-none');
//         } else {
//             betUI.classList.remove('d-none');
//         }
//     }
// }
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
const HUD = (username, id) => {
    myID = id;
    const roomCode = `<span id='roomcode'>Room Code: <b>${roomID}</b></span>`
    const nameDisplay = `<span id='nameDisplay'>Username: <b>${username}</b></span>`
    const roomSpan = document.createElement('span');
    roomSpan.innerHTML = roomCode;
    const nameSpan = document.createElement('span');
    nameSpan.innerHTML = nameDisplay;
    document.body.prepend(roomSpan, nameSpan);
}

form.addEventListener('submit', e => {
    e.preventDefault();
    let username, diceColor, numberColor;
    username = nameInput.value;
    diceColor = userColor.value;
    numberColor = fontColor.value;
    if (roomInput.value) {
        roomID = roomInput.value.toUpperCase()
    } else {
        roomID = generateRoomID();
    }
    socket.emit('join or create room', roomID, username, diceColor, numberColor);
    socket.on('isHost', (user) => {
        if(user.isHost === true)
        setupUI.classList.remove('d-none');
    })
    roomUI.classList.add('d-none');
    playersList.classList.remove('d-none');
});    


//====== Receiving broadcast events ================


socket.on('HUD', (username, id) => {
    HUD(username, id);
});
socket.on('startGame', (users, rooms) => {
    startGame(users, rooms)
});
socket.on('addingDice', (dice, users) => {
    displayDice(dice, users);
});
socket.on('rollAllDice', rollAllDice);
socket.on('makeBet', makeBet);
socket.on('raise', raise);
socket.on('callBluff', callBluff);
socket.on('playerJoined', (users) => {
    playersList.innerHTML = `<h2>Players:</h2>`;

    for(id in users){
        if(users[id].currentRoom === roomID){
            playersList.innerHTML += `<h4>${users[id].username}</h4>`
        }
    }
})
socket.on('rollDice', (user, users, rooms) => {
    rollDice(user, users, rooms);
})


const emitStartGame = () => {
    socket.emit('startGame', socket.id, dicePerPlayer);
}
const emitRollDice = () => {
    socket.emit('rollDice');
}
const emitMakeBet = () => {
    socket.emit('makeBet', socket.id);
}
const emitRaise = () => {
    socket.emit('raise', socket.id);
}
const emitCallBluff = () => {
    socket.emit('callBluff', socket.id);
}
const emitPlayerJoined = () => {
    socket.emit('playerJoined', socket.id);
}


startButton.addEventListener('click', emitStartGame)
rollButton.addEventListener('click', emitRollDice)
betButton.addEventListener('click', emitMakeBet)
raiseButton.addEventListener('click', emitRaise)
callButton.addEventListener('click', emitCallBluff)
randomizeButton.addEventListener('click', randomColor)