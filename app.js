const express = require('express');
const { emit } = require('process');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}


let users = {};
    rooms = {};

const nextTurn = (room) => {
  let result = (room.currentTurn + 1)% Object.keys(room.users).length
  return result
}
const previousTurn = (room) => {
  let result;
  if(room.currentTurn == 0){
    result = Object.keys(room.users).length -1;
  } else {
    result = (room.currentTurn - 1) % Object.keys(room.users).length;
  }
  return result;
}
const getBluffer = (room) => {
  let bluffer;
  let prevTurn = previousTurn(room);
  for(user in room.users){
    if(room.users[user].number == prevTurn){
      bluffer = user;
    }
  }
  return bluffer;
}

    

app.use(express.static(__dirname))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

  console.log(`The user ${socket.id} connected`);
  socket.on('join or create room', (roomID, username, diceColor, numberColor) => {

    class User {
      constructor(username, roomID, diceColor, numberColor){
        this.username = username,
        this.id = socket.id,
        this.number = 0;
        this.currentRoom = roomID;
        this.isHost = false;
        this.numberOfDice = 5;
        this.color = diceColor;
        this.numberColor = numberColor;
      }
    }

    class Room {
      constructor(roomID){
        this.id = roomID;
        this.users = {};
        this.dice = {};
        this.currentBet = {
          username: undefined,
          quantity: 0,
          value: 1
        }
      }
    }

    // on connect, create USER for socket
    const newUser = new User(username, roomID, diceColor, numberColor);

    // Check for room code, create if room doesn't exist
    if(!rooms[newUser.currentRoom]){
      const newRoom = new Room(roomID);
      // Because user made room, make host
      newUser.isHost = true;
      socket.emit('isHost', newUser);
      // add user to room.users object
      newRoom.users[socket.id] = newUser;
      // add new room to rooms object
      rooms[roomID] = newRoom;
      // user joins room socket
     
      socket.join(newUser.currentRoom);
    } else {
      // add user to specified room object
      rooms[newUser.currentRoom].users[newUser.id] = newUser;
      // user joins room socket
      socket.join(newUser.currentRoom);
    }

    // Set user turn number
    newUser.number = Object.keys(rooms[roomID].users).length - 1;

    // add user to users object, server console rooms and users
    users[socket.id] = newUser;

    console.log('==============')
    console.log('ROOMS')
    console.log('==============')
    console.log(rooms)

    // display username and room code
    socket.emit('HUD', username);
    io.to(rooms[roomID].id).emit('playerJoined', users);

    // on disconnect, remove user from users object and room
    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected!`);
      if(users[socket.id]){
        delete users[socket.id];
      }
      if(rooms[roomID].users[socket.id]){
        delete rooms[roomID].users[socket.id]
      }
      // if no users in room on disconnect, delete room
      if(isObjectEmpty(rooms[roomID].users) === true){
        delete rooms[roomID]
      }
    })
  })
  socket.on('startGame', (id, diceAmount) => {
    // select the right room
    let room = rooms[users[id].currentRoom];
    // Give everyone the starting dice amount;
    for(el in users){
      users[el].numberOfDice = diceAmount;
    }
    // Pick random player number for currentTurn
    room.currentTurn = Math.floor(Math.random() * Object.keys(room.users).length);
    console.log(`${room.id}: startGame`);
    io.to(room.id).emit('startGame', diceAmount);
    console.log('==============')
    console.log('USERS')
    console.log('==============')
    console.log(users)
  })
  socket.on('rollDice', () => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: rollDice`)
    socket.emit('rollDice', users[socket.id], users, room)
  })
  socket.on('addingDice', hand => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: addingDice`)
    room.dice[socket.id] = hand;
    io.to(room.id).emit('addingDice', room.dice, users);
  })
  socket.on('roundStart', ()=> {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: roundStart`)
   io.to(room.id).emit('roundStart', room);
  })
  socket.on('makeBet', () => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: makeBet`)
    socket.emit('makeBet', room)
  })
  socket.on('updateBet', (bet) => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: updateBet`)
    room.currentBet.username = bet.username;
    room.currentBet.quantity = bet.quantity;
    room.currentBet.value = bet.value;
    room.currentTurn = nextTurn(room);
    io.to(room.id).emit('updateBet', room);
  })
  socket.on('clickedRaise', () => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: clickedRaise`)
    socket.emit('clickedRaise', room);
  })
  socket.on('callBluff', () => {
    let room = rooms[users[socket.id].currentRoom];
    let actualQuantity = [];
    let caller = users[socket.id];
    let blufferID = getBluffer(room);
    let bluffer = users[blufferID];
    let message = '';
    let loser;

    console.log(`${room.id}: callBluff`)

    for(hand in room.dice){
      for(die in room.dice[hand]){
        if(room.dice[hand][die].value == room.currentBet.value){
          actualQuantity.push(room.dice[hand][die].value);
        }
      }
    }

    if(actualQuantity.length >= room.currentBet.quantity){
      caller.numberOfDice--;
      room.currentTurn = caller.number;
      message = `${bluffer.username} was telling the truth! ${caller.numberOfDice == 0 ? `${caller.username} is out!` : `${caller.username} loses a die!`}`
      loser = caller;
    } else {
      bluffer.numberOfDice--;
      if(bluffer.numberOfDice != 0){
      room.currentTurn = bluffer.number;
      }
      message = `${bluffer.username} was indeed bluffing. ${bluffer.numberOfDice == 0 ? `${bluffer.username} is out!` : `${bluffer.username} loses a die!`}`
      loser = bluffer;
    }
    if(loser.numberOfDice == 0){
      room.currentTurn = nextTurn(room);
    }

    io.to(room.id).emit('callBluff', room, bluffer, caller, message);

    if(loser.numberOfDice == 0){
      console.log(`${room.id}: ${loser.username}: playerOut`)
      socket.emit('playerOut');
    }
  })
  socket.on('nextRound', () => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`======= current turn ======`);
    console.log(room.currentTurn);
    let startingPlayer = room.users[Object.keys(room.users)[room.currentTurn]];
    console.log(`${room.id}: nextRound`);
    room.dice = {};
    room.currentBet = {
      username: undefined,
      quantity: 0,
      value: 1
    }
    io.to(room.id).emit('nextRound', startingPlayer);
  })
  socket.on('kickMe', () => {
    let room = rooms[users[socket.id].currentRoom];

    console.log(`${room.id}: ${room.users[socket.id].username}: kickMe`)

    const reassignNumber = (user) => {
      let arr = Object.keys(room.users)
      let number;
      arr.forEach(id => {
        if(user === id){
          number = arr.indexOf(id);
        }
      })
      return number;
    }

    // let startingPlayer = room.users[Object.keys(room.users)[room.currentTurn]];
    // socket.leave(room);
    delete room.users[socket.id]
    delete users[socket.id]
    // reassign player turn numbers
    for(user in room.users){
      room.users[user].number = reassignNumber(user);
    }
    room.currentTurn = previousTurn(room);
    console.log(`======= new user numbers =======`);
    console.log(room.users);

    if(Object.keys(room.users).length == 1){
      io.to(room.id).emit('winner', room.users)
    }
  })
});

http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });