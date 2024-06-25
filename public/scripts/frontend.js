// DOM stuff
const // Buttons
  startButton = document.body.querySelector('#startButton'),
  rollButton = document.body.querySelector('#rollAllDice'),
  betButton = document.body.querySelector('#makeBet'),
  callButton = document.body.querySelector('#callButton'),
  raiseButton = document.body.querySelector('#raiseButton'),
  submitButton = document.body.querySelector('#submitButton'),
  reconnectButton = document.body.querySelector('#reconnectButton'),
  randomizeButton = document.body.querySelector('#randomizeButton'),
  nextRoundButton = document.body.querySelector('#nextRound'),
  playAgainButton = document.body.querySelector('#playAgain'),
  skipPlayerButton = document.body.querySelector('#skipPlayerButton'),
  kickPlayerButton = document.body.querySelector('#kickPlayerButton'),
  //  UI elements
  setupUI = document.body.querySelector('#setupUI'),
  rollUI = document.body.querySelector('#rollUI'),
  callUI = document.body.querySelector('#callUI'),
  betUI = document.body.querySelector('#betUI'),
  roomUI = document.body.querySelector('#roomUI'),
  warningUI = document.body.querySelector('#warningUI'),
  playersList = document.body.querySelector('#playersList'),
  hostControls = document.body.querySelector('#hostControls'),
  //   Inputs
  dicePerPlayerField = document.body.querySelector('#dicePerPlayer'),
  userColor = document.body.querySelector('#userColor'),
  fontColor = document.body.querySelector('#numberColor'),
  form = document.getElementById('form'),
  roomInput = document.getElementById('input'),
  nameInput = document.getElementById('username'),
  betQuantity = document.body.querySelector('#betQuantity');
(betValue = document.body.querySelector('#betValue')),
  //   Displays
  (diceCup = document.body.querySelector('#diceCup')),
  (myDice = document.body.querySelector('#myDice')),
  (otherDice = document.body.querySelector('#otherDice')),
  (betDisplay = document.body.querySelector('#betDisplay'));
sampleDie = document.body.querySelector('#sampleDie');
sampleDieFace = document.body.querySelector('#sampleDieFace');
(hudDisplay = document.body.querySelector('#HUD')),
  (roomDisplay = document.body.querySelector('#roomDisplay')),
  (nameDisplay = document.body.querySelector('#nameDisplay'));
rangeValue = document.body.querySelector('#rangeValue');

//   GameState stuff

const socket = io();
let dicePerPlayer = 5;
let isYourTurn = false;
let roomID = undefined;
let isBetOkay = false;
let isOut = false;
let dieWidth = '44px';
// let state = {lobby: true,
//              rolling: false,
//              waiting: false,
//              calling: false,
//              raising: false,
//              roundEnd: false,
// };
let displays = {
  betDisplay,
  betUI,
  callUI,
  diceCup,
  hudDisplay,
  kickPlayerButton,
  nextRoundButton,
  otherDice,
  playAgainButton,
  playersList,
  rollUI,
  roomUI,
  setupUI,
  skipPlayerButton,
  warningUI,
};

dicePerPlayerField.addEventListener('input', function () {
  updateRangeValue();
  dicePerPlayer = parseInt(this.value);
});

//================== Functions: ===========================

const dieFaces = (user, dieWidth) => {
  return {
    1: `<svg xmlns="http://www.w3.org/2000/svg" width='${dieWidth}' height='${dieWidth}' fill="${user.numberColor}" class="bi bi-dice-1" viewBox="0 0 16 16">
<circle cx="8" cy="8" r="1.5"/></svg>`,
    2: `<svg xmlns="http://www.w3.org/2000/svg" width='${dieWidth}' height='${dieWidth}' fill="${user.numberColor}" class="bi bi-dice-2" viewBox="0 0 16 16">
<path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`,
    3: `<svg xmlns="http://www.w3.org/2000/svg" width='${dieWidth}' height='${dieWidth}' fill="${user.numberColor}" class="bi bi-dice-3" viewBox="0 0 16 16">
<path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-4-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`,
    4: `<svg xmlns="http://www.w3.org/2000/svg" width='${dieWidth}' height='${dieWidth}' fill="${user.numberColor}" class="bi bi-dice-4" viewBox="0 0 16 16">
<path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`,
    5: `<svg xmlns="http://www.w3.org/2000/svg" width='${dieWidth}' height='${dieWidth}' fill="${user.numberColor}" class="bi bi-dice-5" viewBox="0 0 16 16">
<path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm4-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`,
    6: `<svg xmlns="http://www.w3.org/2000/svg" width='${dieWidth}' height='${dieWidth}' fill="${user.numberColor}" class="bi bi-dice-6" viewBox="0 0 16 16">
<path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-8 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>`,
  };
};

const autofillFields = () => {
  let username = localStorage.getItem('username');
  let room = localStorage.getItem('room');
  if (username != null) {
    nameInput.value = username;
  }
  if (room != null) {
    roomInput.value = room;
    reconnectButton.classList.remove('d-none');
  }
};
// const changeState = (state, prop) => {
//     for(el in state){
//         if(el == prop){
//             state[el] = true;
//         } else {
//             state[el] = false;
//         }
//     }
// }

const setExpiration = () => {
  let expiration = new Date().getTime() + 3600000;
  localStorage.setItem('expiration', expiration);
};

const getStateOfDisplays = () => {
  stateOfDisplays = {
    betDisplay: betDisplay.classList.value.indexOf('d-none'),
    // If betDisplay is visible, run updateBetDisplay to populate
    betUI: betUI.classList.value.indexOf('d-none'),
    callUI: callUI.classList.value.indexOf('d-none'),
    diceCup: diceCup.classList.value.indexOf('d-none'),
    // if you have dice, show them, else "this is where your dice will go"
    hudDisplay: hudDisplay.classList.value.indexOf('d-none'),
    nextRoundButton: nextRoundButton.classList.value.indexOf('d-none'),
    // check if your turn after bluff called to show this
    otherDice: otherDice.classList.value.indexOf('d-none'),
    // if visible, displayDice
    playAgainButton: playAgainButton.classList.value.indexOf('d-none'),
    playersList: playersList.classList.value.indexOf('d-none'),
    rollUI: rollUI.classList.value.indexOf('d-none'),
    roomUI: roomUI.classList.value.indexOf('d-none'),
    setupUI: setupUI.classList.value.indexOf('d-none'),
    warningUI: warningUI.classList.value.indexOf('d-none'),
    // need to populate this somehow
  };
  return stateOfDisplays;
};
const setState = (stateOfDisplays) => {
  for (const el in stateOfDisplays) {
    console.log(`===============`);
    if (stateOfDisplays[el] == 0) {
      console.log(`${el} is d:none`);
      displays[el].classList.add('d-none');
    }
    if (stateOfDisplays[el] == -1) {
      console.log(`${el} is visible`);
      displays[el].classList.remove('d-none');
    }
  }
};
socket.on('updateState', (users) => {});

const getStorage = () => {
  let expiration = localStorage.getItem('expiration');
  if (expiration != null && expiration < new Date().getTime()) {
    localStorage.clear();
  }
  let id = localStorage.getItem('socket.id');
  if (id === null) {
    id = socket.id;
    localStorage.setItem('socket.id', socket.id);
    setExpiration();
  }
  socket.id = id;
  console.log(`getStorage - ${id}`);
  return id;
  // check if room exists, autofill username and room if so
};

const updateRangeValue = () => {
  rangeValue.innerText = dicePerPlayerField.value;
};
const updateDieColor = () => {
  let color = userColor.value;
  sampleDie.style.backgroundColor = color;
};
const updateNumberColor = () => {
  let color = fontColor.value;
  sampleDieFace.setAttribute('fill', color);
};

const randomColor = () => {
  const color = () => {
    return Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, 'f');
  };
  userColor.value = `#${color()}`;
  fontColor.value = `#${color()}`;
  updateDieColor();
  updateNumberColor();
};

const getDieWidth = () => {
  const container = document.body
    .querySelector('.content')
    .querySelector('.container');
  let dieWidth;
  dieWidth =
    (container.scrollWidth - 22 - 2 * dicePerPlayer) / dicePerPlayer + 'px';
  return dieWidth;
};

const generateRoomID = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * 26));
  }
  return result;
};

const updateBetDisplay = (room) => {
  betDisplay.innerText = `${room.currentBet.username} bet ${
    room.currentBet.quantity
  } ${room.currentBet.value}${room.currentBet.quantity == 1 ? '.' : 's.'}`;
  warningUI.classList.remove('d-none');
  warningUI.innerHTML = `<p>It's ${
    room.users[Object.keys(room.users)[room.currentTurn]].username
  }'s turn.</p>`;
};
const checkTurn = (room) => {
  if (isOut) {
    return;
  } else {
    if (room.currentTurn === room.users[socket.id].number) {
      isYourTurn = true;
    } else {
      isYourTurn = false;
    }
  }
};
const calculateQuantity = (room) => {
  betQuantity.innerHTML = '';
  let diceQuantity = 0;
  for (const el in room.users) {
    diceQuantity += room.users[el].numberOfDice;
  }
  for (i = 1; i <= diceQuantity; i++) {
    const newOption = document.createElement('option');
    newOption.innerText = i;
    newOption.setAttribute('value', i);
    betQuantity.append(newOption);
  }
};
const startGame = (diceAmount, room) => {
  dicePerPlayer = diceAmount;
  setupUI.classList.add('d-none');
  diceCup.classList.remove('d-none');
  rollUI.classList.remove('d-none');
  playersList.classList.add('d-none');
  if (room.users[socket.id].isHost == true) {
    hostControls.classList.remove('d-none');
  }
};
const HUD = (username) => {
  hudDisplay.classList.remove('d-none');
  roomDisplay.innerHTML += `<b>${roomID}</b> `;
  nameDisplay.innerHTML += `<b>${username}</b> `;
};
class Die {
  constructor(user) {
    this.user = user;
    this.value = Math.floor(Math.random() * 6 + 1);
    this.color = user.color;
  }
}
const rollDice = (user, users, room) => {
  dieWidth = getDieWidth();
  diceCup.firstElementChild.innerHTML = '';
  const hand = {};
  for (i = 0; i < user.numberOfDice; i++) {
    const die = new Die(user);
    hand[i] = die;
  }
  for (const die in hand) {
    const dieHTML = ` <span class='dice' style='background-color:${
      hand[die].color
    };width:${dieWidth};height:${dieWidth}'>
                            <span class='dieFace' style='width:${dieWidth};height:${dieWidth}'>${
      dieFaces(user, dieWidth)[hand[die].value]
    }</span>
                          </span>`;

    myDice.innerHTML += dieHTML;
  }
  socket.emit('addingDice', hand);
  rollUI.classList.add('d-none');
  checkTurn(room);
  socket.emit('roundStart');
  warningUI.classList.remove('d-none');
  if (isYourTurn === true) {
    warningUI.innerText = `It's your turn!`;
  } else {
    warningUI.innerText = `It's not your turn yet.`;
  }
};
const displayDice = (dice, users) => {
  otherDice.classList.remove('d-none');
  otherDice.innerHTML = '';
  for (const hand in dice) {
    const faces = dieFaces(users[hand], dieWidth);
    if (socket.id !== hand) {
      const diceRow = document.createElement('div');
      for (const die in dice[hand]) {
        // console.log(dice[hand][die].user.numberColor)
        const dieHTML = ` <span class='dice' style='background-color:${
          dice[hand][die].color
        };width:${dieWidth};height:${dieWidth}'>
                                    <p class='qmark' style='color:${
                                      dice[hand][die].user.numberColor
                                    };font-size:2em;'>?<p>
                                    <span class='dieFace d-none' style='width:${dieWidth};height:${dieWidth}'>${
          faces[dice[hand][die].value]
        }</span>
                                  </span>`;
        diceRow.innerHTML += dieHTML;
      }
      otherDice.append(diceRow);
    }
  }
};
const restoreDice = (room) => {};

const roundStart = (room) => {
  let allDice = 0,
    diceRolled = 0;
  for (const el in room.dice) {
    diceRolled += Object.keys(room.dice[el]).length;
  }
  for (const el in room.users) {
    allDice += room.users[el].numberOfDice;
  }
  return allDice === diceRolled;
};
const nextRound = (startingPlayer) => {
  betDisplay.classList.add('d-none');
  betDisplay.innerHTML = '';
  warningUI.innerHTML = '';
  warningUI.classList.add('d-none');
  myDice.innerHTML = '';
  otherDice.innerHTML = '';
  otherDice.classList.add('d-none');
  diceCup.firstElementChild.innerHTML = `${
    !isOut
      ? `This is where your dice will go. <br> It's ${startingPlayer.username}'s turn.`
      : ``
  }`;
  rollUI.classList.remove('d-none');
  setExpiration();
};

const callBluff = (room, bluffer, caller, message) => {
  const revealDice = () => {
    const qmarks = document.body
      .querySelector('#otherDice')
      .querySelectorAll('.qmark');
    const faces = document.body
      .querySelector('#otherDice')
      .querySelectorAll('.dieFace');
    for (const el of qmarks) {
      el.classList.add('d-none');
    }
    for (const el of faces) {
      el.classList.remove('d-none');
    }
  };
  warningUI.classList.remove('d-none');
  warningUI.innerHTML = `<p>${message}</p>`;
  revealDice();
  isYourTurn = false;
  checkTurn(room);
  if (isYourTurn) {
    nextRoundButton.classList.remove('d-none');
  }
  // changeState(state, 'roundEnd');
};
const playerOut = () => {
  isOut = true;
  warningUI.classList.remove('d-none');
  warningUI.innerHTML += `<h2>Oh no! You're out.</h2>`;
  socket.emit('kickMe');
  rollUI.innerHTML = '';
  callUI.innerHTML = '';
  betUI.innerHTML = '';
};

const makeBet = (room) => {
  console.log(room.currentBet.quantity);
  console.log(room.currentBet.value);
  // If quantity is higher || Quantity is same and value is higher
  if (
    Number(betQuantity.value) > room.currentBet.quantity ||
    (Number(betQuantity.value) == room.currentBet.quantity &&
      Number(betValue.value) > room.currentBet.value)
  ) {
    betUI.classList.add('d-none');
    isYourTurn = false;
    return {
      username: room.users[socket.id].username,
      quantity: betQuantity.value,
      value: betValue.value,
    };
  } else {
    warningUI.classList.remove('d-none');
    warningUI.innerHTML =
      '<p>Please place a bet higher than the previous one.</p>';
    return false;
  }
};

const skipPlayer = () => {
  socket.emit('skipPlayer');
};
const kickPlayer = () => {
  socket.emit('kickPlayer');
};
const winner = (users) => {
  rollUI.innerHTML = '';
  callUI.innerHTML = '';
  betUI.innerHTML = '';
  nextRoundButton.classList.add('d-none');
  warningUI.classList.remove('d-none');
  if (socket.id == Object.keys(users)[0]) {
    warningUI.innerHTML = `<h2>You win!</h2>`;
  } else {
    warningUI.innerHTML = `<h2>Game over! ${
      users[Object.keys(users)[0]].username
    } wins!</h2>`;
  }
  playAgainButton.classList.remove('d-none');
};

// ==================================================
//              Chronology
// ==================================================

// autofillFields();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let username = nameInput.value,
    diceColor = userColor.value,
    numberColor = fontColor.value;
  if (roomInput.value) {
    roomID = roomInput.value.toUpperCase();
  } else {
    roomID = generateRoomID();
  }
  socket.emit('login', roomID, username, diceColor, numberColor);
  socket.on('isHost', (user) => {
    if (user.isHost === true) setupUI.classList.remove('d-none');
  });
  roomUI.classList.add('d-none');
  playersList.classList.remove('d-none');
  window.localStorage.setItem('username', username);
  window.localStorage.setItem('room', roomID);
});

//====== Receiving broadcast events ================

socket.on('getStorage', () => {
  const id = getStorage();
  socket.emit('setID', id);
});
socket.on('getState', () => {
  let stateOfDisplays = getStateOfDisplays();
  socket.emit('sendState', stateOfDisplays);
});
socket.on('HUD', (username) => {
  HUD(username);
});
socket.on('startGame', (diceAmount, room) => {
  startGame(diceAmount, room);
  // changeState(state, 'rolling');
});
socket.on('addingDice', (dice, users) => {
  displayDice(dice, users);
});
socket.on('testtest', () => {
  console.log(`Is this thing on?`);
});
socket.on('playerJoined', (users) => {
  console.log(`PlayerJoined!`);
  console.log(users);
  playersList.innerHTML = `<h2>Players:</h2>`;
  for (const id in users) {
    playersList.innerHTML += `<h4>${users[id].username}</h4>`;
  }
});
socket.on('rollDice', (user, users, room) => {
  rollDice(user, users, room);
});
socket.on('roundStart', (room) => {
  let ready = roundStart(room);
  if (!ready) {
    warningUI.classList.remove('d-none');
    warningUI.innerText = `Still waiting on players.`;
  } else if (ready && !isYourTurn) {
    warningUI.classList.remove('d-none');
    warningUI.innerText = `It's ${
      room.users[Object.keys(room.users)[room.currentTurn]].username
    }'s turn!`;
    // changeState(state, 'waiting');
  }
  if (ready && isYourTurn) {
    warningUI.classList.add('d-none');
    warningUI.innerText = '';
    betUI.classList.remove('d-none');
    calculateQuantity(room);
    // If you reconnect on first turn, game will still show call button here
    // changeState(state, 'calling');
  }
});
socket.on('makeBet', (room) => {
  let bet = makeBet(room);
  if (bet != false) {
    socket.emit('updateBet', bet);
  }
});
socket.on('updateBet', (room) => {
  warningUI.innerHTML = '';
  warningUI.classList.add('d-none');
  betDisplay.classList.remove('d-none');
  updateBetDisplay(room);
  checkTurn(room);
  if (isYourTurn) {
    // changeState(state, 'calling');
    callUI.classList.remove('d-none');
  }
});
socket.on('clickedRaise', (room) => {
  // changeState(state, 'raising');
  calculateQuantity(room);
  betUI.classList.remove('d-none');
  callUI.classList.add('d-none');
});
socket.on('callBluff', (room, bluffer, caller, message) => {
  callBluff(room, bluffer, caller, message);
});
socket.on('nextRound', (startingPlayer) => {
  nextRound(startingPlayer);
});
socket.on('playerOut', () => {
  console.log(`Oh no, I'm out!`);
  playerOut();
});
socket.on('winner', (users) => {
  winner(users);
  localStorage.removeItem('room');
});
socket.on('skippingTurn', (room) => {
  isYourTurn = false;
  betUI.classList.add('d-none');
  callUI.classList.add('d-none');
});

const changeMyID = (ID) => {
  socket.emit('ChangeMyID', ID);
};

const emitStartGame = () => {
  socket.emit('startGame', socket.id, dicePerPlayer);
};
const emitRollDice = () => {
  socket.emit('rollDice');
};
const emitMakeBet = () => {
  socket.emit('makeBet');
};
const emitClickedRaise = () => {
  socket.emit('clickedRaise');
};
const emitCallBluff = () => {
  callUI.classList.add('d-none');
  socket.emit('callBluff');
};

const emitRoundStart = () => {
  socket.emit('roundStart');
};

const emitNextRound = () => {
  nextRoundButton.classList.add('d-none');
  socket.emit('nextRound');
};

startButton.addEventListener('click', emitStartGame);
rollButton.addEventListener('click', emitRollDice);
betButton.addEventListener('click', emitMakeBet);
raiseButton.addEventListener('click', emitClickedRaise);
callButton.addEventListener('click', emitCallBluff);
randomizeButton.addEventListener('click', randomColor);
nextRoundButton.addEventListener('click', emitNextRound);
skipPlayerButton.addEventListener('click', skipPlayer);
kickPlayerButton.addEventListener('click', kickPlayer);
fontColor.addEventListener('change', updateNumberColor);
userColor.addEventListener('change', updateDieColor);
