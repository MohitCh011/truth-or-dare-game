const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getUniqueRandomQuestion } = require('./data/questionDatabase');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Store active rooms and players
const rooms = new Map();

// Generate unique room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('create_room', ({ playerName, tone, gameMode }) => {
    const roomCode = generateRoomCode();

    rooms.set(roomCode, {
      players: [
        {
          id: socket.id,
          name: playerName,
          playerNumber: 1,
        },
      ],
      currentTurn: 1,
      messages: [],
      tone: tone || 'CHILL',
      gameMode: gameMode || 'RANDOM',
      rounds: 0,
      truthCount: 0,
      dareCount: 0,
      startedByP1: 0,
      startedByP2: 0,
      ready: {}, // for "both ready" screen
      usedQuestions: [], // track used questions in random mode
    });

    socket.join(roomCode);
    socket.emit('room_created', { roomCode, playerNumber: 1, playerName });
    console.log(`Room ${roomCode} created by ${playerName} with tone ${tone} and mode ${gameMode}`);
  });

  // Join existing room
  socket.on('join_room', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    room.players.push({
      id: socket.id,
      name: playerName,
      playerNumber: 2,
    });

    socket.join(roomCode);
    socket.emit('room_joined', { roomCode, playerNumber: 2, playerName });

    // Notify both players that game is ready (pre-game rules screen)
    io.to(roomCode).emit('game_ready', {
      players: room.players,
      currentTurn: room.currentTurn,
      tone: room.tone,
    });

    console.log(`${playerName} joined room ${roomCode}`);
  });

  // Handle chat messages
  socket.on('send_message', ({ roomCode, message, senderName }) => {
    const room = rooms.get(roomCode);

    if (room) {
      const messageData = {
        text: message,
        sender: senderName,
        timestamp: new Date().toISOString(),
      };

      room.messages.push(messageData);
      io.to(roomCode).emit('receive_message', messageData);
    }
  });

  // Handle Truth or Dare selection + stats
  socket.on('select_choice', ({ roomCode, choice, playerName, playerNumber }) => {
    const room = rooms.get(roomCode);

    if (room) {
      room.rounds += 1;
      if (choice === 'Truth') room.truthCount += 1;
      if (choice === 'Dare') room.dareCount += 1;
      if (playerNumber === 1) room.startedByP1 += 1;
      if (playerNumber === 2) room.startedByP2 += 1;

      io.to(roomCode).emit('choice_selected', {
        choice,
        playerName,
      });
    }
  });

  // Handle turn change
  socket.on('next_turn', ({ roomCode }) => {
    const room = rooms.get(roomCode);

    if (room) {
      room.currentTurn = room.currentTurn === 1 ? 2 : 1;
      io.to(roomCode).emit('turn_changed', { currentTurn: room.currentTurn });
    }
  });

  // Typing indicator
  socket.on('typing', ({ roomCode, playerName }) => {
    socket.to(roomCode).emit('typing', { playerName });
  });

  // Vibe slider updates
  socket.on('vibe_update', ({ roomCode, playerNumber, vibe }) => {
    const room = rooms.get(roomCode);
    if (room) {
      io.to(roomCode).emit('vibe_changed', { playerNumber, vibe });
    }
  });

  // Get random question for random mode
  socket.on('get_random_question', ({ roomCode, choice }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    if (room.gameMode === 'RANDOM') {
      const questionType = choice === 'Truth' ? 'truths' : 'dares';
      const question = getUniqueRandomQuestion(room.tone, questionType, room.usedQuestions);

      if (question) {
        room.usedQuestions.push(question);
        io.to(roomCode).emit('random_question', { question, choice });
      }
    }
  });

  // Player ready for pre-game rules screen
  socket.on('player_ready', ({ roomCode, playerNumber }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    if (!room.ready) room.ready = {};
    room.ready[playerNumber] = true;

    if (room.ready[1] && room.ready[2]) {
      io.to(roomCode).emit('start_game', {
        currentTurn: room.currentTurn,
        tone: room.tone,
      });
    }
  });

  // End game & send recap
  socket.on('end_game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const recap = {
      rounds: room.rounds,
      truthCount: room.truthCount,
      dareCount: room.dareCount,
      startedByP1: room.startedByP1,
      startedByP2: room.startedByP2,
    };

    let brutal;
    if (room.dareCount === 0) brutal = 'Both kept it soft.';
    else if (room.startedByP1 > room.startedByP2) brutal = 'Most brutal: Player 1';
    else if (room.startedByP2 > room.startedByP1) brutal = 'Most brutal: Player 2';
    else brutal = 'You were equally evil.';

    io.to(roomCode).emit('game_over', { recap, brutal });

    rooms.delete(roomCode);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);

      if (playerIndex !== -1) {
        const disconnectedPlayer = room.players[playerIndex];
        io.to(roomCode).emit('player_left', {
          playerName: disconnectedPlayer.name,
        });
        rooms.delete(roomCode);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
