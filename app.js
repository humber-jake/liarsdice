import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let users = {},
  rooms = {};

const isObjectEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};
const nextTurn = (room) => {
  let result = (room.currentTurn + 1) % Object.keys(room.users).length;
  return result;
};
const previousTurn = (room) => {
  let result;
  if (room.currentTurn == 0) {
    result = Object.keys(room.users).length - 1;
  } else {
    result = (room.currentTurn - 1) % Object.keys(room.users).length;
  }
  return result;
};
const getBluffer = (room) => {
  let bluffer;
  let prevTurn = previousTurn(room);
  for (const user in room.users) {
    if (room.users[user].number == prevTurn) {
      bluffer = user;
    }
  }
  return bluffer;
};
const deleteExpired = () => {
  for (const user in users) {
    if (users[user].expiration != null && users[user].expiration < new Date()) {
      delete users[user];
      for (const room in rooms) {
        delete rooms[room].users[user];
      }
    }
  }
};
// on reconnect, getState - getState emits reconnect to everyone but socket,
//

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// setInterval( () => {
//   console.log(`Checking for expired users...`)
//   if(Object.keys(users).length > 0){
//     console.log(`Currently ${Object.keys(users).length} users. Deleting expired users...`)
//     console.log(`===========rooms========`)
//     console.log(rooms)
//     console.log(`========users==========`)
//     console.log(users)
//     deleteExpired();
//   }
// }, 5000);

io.on('connection', (socket) => {
  // bug: redefining socket breaks things because it's no longer in it's own socket, check socket.rooms
  // socket.emit('getStorage');

  // socket.on('setID', id => {
  // socket.id = id;
  console.log(`The user ${socket.id} connected`);
  // })

  class User {
    constructor(username, roomID, diceColor, numberColor) {
      (this.username = username), (this.id = socket.id), (this.number = 0);
      this.currentRoom = roomID;
      this.isHost = false;
      this.numberOfDice = 5;
      this.color = diceColor;
      this.numberColor = numberColor;
      this.expiration = null;
    }
  }

  class Room {
    constructor(roomID) {
      this.id = roomID;
      this.users = {};
      this.dice = {};
      this.currentBet = {
        username: undefined,
        quantity: 0,
        value: 1,
      };
    }
  }

  socket.on('login', (roomID, username, diceColor, numberColor) => {
    console.log(`${roomID}: ${socket.id}: ${username}: login`);
    if (users[socket.id] != undefined && roomID == rooms[roomID].id) {
      let room = rooms[users[socket.id].currentRoom];
      socket.join(room.id);
      io.to(room.id).emit('getState');
      const getPrevUserID = () => {
        let prevUserNumber = previousTurn(room);
        let prevUserID;
        for (const user in room.users) {
          if (room.users[user].number == prevUserNumber) {
            prevUserID = user;
          }
        }
        return prevUserID;
      };
      let prevUser = room.users[getPrevUserID()];
      console.log(`=======prevUser=========`);
      console.log(prevUser);

      // socket.emit('updateState', prevUser);
    }
    // if user doesn't exist:
    if (users[socket.id] == undefined) {
      // on connect, create USER for socket
      const newUser = new User(username, roomID, diceColor, numberColor);
      console.log(newUser.currentRoom);
      // Check for room code, create if room doesn't exist
      if (rooms[newUser.currentRoom] == undefined) {
        const newRoom = new Room(roomID);
        // Because user made room, make host
        newUser.isHost = true;
        socket.emit('isHost', newUser);
        // add user to newRoom, newRoom to rooms object, and join room
        newRoom.users[socket.id] = newUser;
        rooms[roomID] = newRoom;
      } else {
        console.log(`created user and joined pre-existing room!`);
        // add user to object and join room
        rooms[roomID].users[newUser.id] = newUser;
      }

      // Set user turn number
      newUser.number = Object.keys(rooms[roomID].users).length - 1;

      // add user to users object, server console rooms and users
      users[socket.id] = newUser;

      console.log('==============');
      console.log('ROOMS');
      console.log('==============');
      console.log(rooms);

      // display username and room code
      socket.emit('HUD', username);
      socket.join(roomID);
      // io.to(roomID).emit('playerJoined', rooms[roomID].users);
    } else {
      // Check if they want to create new room
      if (roomID != users[socket.id].currentRoom && !rooms[roomID]) {
        users[socket.id].currentRoom = roomID;
        const newRoom = new Room(roomID);
        // Because user made room, make host
        users[socket.id].isHost = true;
        socket.emit('isHost', uses[socket.id]);
        // add user to newRoom, newRoom to rooms object, and join room
        newRoom.users[socket.id] = users[socket.id];
        rooms[roomID] = newRoom;
        socket.join(roomID);
        // Set user turn number
        users[socket.id].number = Object.keys(rooms[roomID].users).length - 1;
        console.log('==============');
        console.log('ROOMS');
        console.log('==============');
        console.log(rooms);
        // display username and room code
        socket.emit('HUD', username);
      } else if (roomID != users[socket.id].currentRoom) {
        rooms[roomID].users[socket.id] = users[socket.id];
        socket.join(roomID);
      } else {
        socket.join(roomID);
      }
    }
    console.log(`emitting playerJoined to ${roomID}`);
    socket.join(roomID);
    console.log(socket.rooms);
    io.to(roomID).emit('playerJoined', rooms[roomID].users);
    io.to(roomID).emit('testtest');

    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected!`);
      console.log(`======= users =======`);
      console.log(users);
      console.log(`======= rooms =======`);
      console.log(rooms);
      // give user expiration time
      if (users[socket.id] != undefined) {
        users[socket.id].expiration = new Date().getTime() + 5000;
      }
      // if no users in room on disconnect, delete room
      if (
        rooms[roomID] != undefined &&
        isObjectEmpty(rooms[roomID].users) === true
      ) {
        delete rooms[roomID];
      }
    });
  });
  socket.on('startGame', (id, diceAmount) => {
    // select the right room
    let room = rooms[users[id].currentRoom];
    // Give everyone the starting dice amount;
    for (const user in users) {
      users[user].numberOfDice = diceAmount;
    }
    // Pick random player number for currentTurn
    room.currentTurn = Math.floor(
      Math.random() * Object.keys(room.users).length
    );
    console.log(`${room.id}: startGame`);
    io.to(room.id).emit('startGame', diceAmount, room);
    console.log('==============');
    console.log('USERS');
    console.log('==============');
    console.log(users);
  });
  socket.on('rollDice', () => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: rollDice`);
    socket.emit('rollDice', users[socket.id], users, room);
  });
  socket.on('addingDice', (hand) => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: addingDice`);
    room.dice[socket.id] = hand;
    io.to(room.id).emit('addingDice', room.dice, room.users);
  });
  socket.on('roundStart', () => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: roundStart`);
    io.to(room.id).emit('roundStart', room);
  });
  socket.on('makeBet', () => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: makeBet`);
    socket.emit('makeBet', room);
  });
  socket.on('updateBet', (bet) => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: updateBet`);
    room.currentBet.username = bet.username;
    room.currentBet.quantity = bet.quantity;
    room.currentBet.value = bet.value;
    room.currentTurn = nextTurn(room);
    io.to(room.id).emit('updateBet', room);
  });
  socket.on('clickedRaise', () => {
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: clickedRaise`);
    socket.emit('clickedRaise', room);
  });
  socket.on('callBluff', () => {
    let room = rooms[users[socket.id].currentRoom];
    let actualQuantity = [];
    let caller = users[socket.id];
    let blufferID = getBluffer(room);
    let bluffer = users[blufferID];
    let message = '';
    let loser;

    console.log(`${room.id}: callBluff`);
    console.log(`Turn before losing dice: ${room.currentTurn}`);

    for (const hand in room.dice) {
      for (const die in room.dice[hand]) {
        if (room.dice[hand][die].value == room.currentBet.value) {
          actualQuantity.push(room.dice[hand][die].value);
        }
      }
    }

    if (actualQuantity.length >= room.currentBet.quantity) {
      caller.numberOfDice--;
      if (caller.numberOfDice == 0) {
        room.currentTurn = nextTurn(room);
      }
      message = `${bluffer.username} was telling the truth! ${
        caller.numberOfDice == 0
          ? `${caller.username} is out!`
          : `${caller.username} loses a die!`
      }`;
      loser = caller;
    } else {
      bluffer.numberOfDice--;
      if (bluffer.numberOfDice != 0) {
        room.currentTurn = bluffer.number;
      }
      message = `${bluffer.username} was indeed bluffing. ${
        bluffer.numberOfDice == 0
          ? `${bluffer.username} is out!`
          : `${bluffer.username} loses a die!`
      }`;
      loser = bluffer;
    }

    console.log(`Turn after losing dice: ${room.currentTurn}`);

    if (loser.numberOfDice == 0) {
      console.log(`${room.id}: ${loser.username}: playerOut`);
      io.to(loser.id).emit('playerOut');
    }
    io.to(room.id).emit('callBluff', room, bluffer, caller, message);
  });
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
      value: 1,
    };
    io.to(room.id).emit('nextRound', startingPlayer);
  });
  socket.on('kickMe', () => {
    let room = rooms[users[socket.id].currentRoom];

    console.log(`${room.id}: ${room.users[socket.id].username}: kickMe`);

    const reassignNumber = (user) => {
      let arr = Object.keys(room.users);
      let number;
      arr.forEach((id) => {
        if (user === id) {
          number = arr.indexOf(id);
        }
      });
      return number;
    };
    delete room.users[socket.id];
    delete users[socket.id];
    for (const user in room.users) {
      room.users[user].number = reassignNumber(user);
    }
    room.currentTurn = previousTurn(room);
    console.log(`Turn after kicking player: ${room.currentTurn}`);
    if (Object.keys(room.users).length == 1) {
      io.to(room.id).emit('winner', room.users);
      delete rooms[room.id];
    }
  });
  socket.on('sendState', (stateOfDisplays) => {
    let room = rooms[users[socket.id].currentRoom];
    room.users[socket.id].state = stateOfDisplays;
    console.log(room.users[socket.id]);
    // socket.emit('updateState', stateOfDisplays)
  });
  socket.on('skipPlayer', () => {
    if (users[socket.id].isHost !== true) {
      return;
    }
    let room = rooms[users[socket.id].currentRoom];
    console.log(`${room.id}: ${room.users[socket.id].username}: skipPlayer`);
    io.to(Object.keys(room.users)[room.currentTurn]).emit('skippingTurn', room);
    room.currentTurn = nextTurn(room);
    io.to(room.id).emit('updateBet', room);
  });

  socket.on('ChangeMyID', (ID) => {
    console.log(`socket.id was ${socket.id}`);
    socket.id = ID;
    console.log(`socket.id is now ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// TODO:
// implement cookies / sessions
// newPlayer - add new player to the game in between rounds no matter when they connect
//  let host skip players that are idle or away
