import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Home from './pages/Home';
import GameRoom from './components/GameRoom';
import './App.css';

const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001', {
  autoConnect: false
});

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState(null);
  const [inGame, setInGame] = useState(false);
  const [sessionTone, setSessionTone] = useState('CHILL');
  const [gameMode, setGameMode] = useState('RANDOM');
  const [showIntro, setShowIntro] = useState(true);
  const [recapData, setRecapData] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => setShowIntro(false), 2200);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('room_created', ({ roomCode, playerNumber, playerName }) => {
      setRoomCode(roomCode);
      setPlayerNumber(playerNumber);
      setPlayerName(playerName);
      setInGame(true);
    });

    socket.on('room_joined', ({ roomCode, playerNumber, playerName }) => {
      setRoomCode(roomCode);
      setPlayerNumber(playerNumber);
      setPlayerName(playerName);
      setInGame(true);
    });

    socket.on('error', ({ message }) => alert(message));

    socket.on('player_left', ({ playerName }) => {
      alert(`${playerName} left the game`);
      setInGame(false);
      setRoomCode('');
      setPlayerNumber(null);
    });

    socket.on('game_over', ({ recap, brutal }) => {
      setRecapData({ recap, brutal });
      setInGame(false);
      setRoomCode('');
      setPlayerNumber(null);
    });

    return () => {
      clearTimeout(timeout);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('error');
      socket.off('player_left');
      socket.off('game_over');
    };
  }, []);

  const handleCreateRoom = (name, tone, mode) => {
    setPlayerName(name);
    setSessionTone(tone);
    setGameMode(mode);
    socket.connect();
    socket.emit('create_room', { playerName: name, tone, gameMode: mode });
  };

  const handleJoinRoom = (code, name) => {
    setPlayerName(name);
    socket.connect();
    socket.emit('join_room', { roomCode: code, playerName: name });
  };

  const handleCloseRecap = () => setRecapData(null);

  return (
    <div className="App">
      {showIntro && (
        <div className="intro-overlay" onClick={() => setShowIntro(false)}>
          <div className="intro-orb intro-orb-left" />
          <div className="intro-orb intro-orb-right" />
          <div className="intro-text-wrap">
            <div className="intro-word truth">TRUTH</div>
            <div className="intro-and">&</div>
            <div className="intro-word dare">DARE</div>
          </div>
        </div>
      )}

      {!inGame ? (
        <Home
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          recapData={recapData}
          onCloseRecap={handleCloseRecap}
        />
      ) : (
        <GameRoom
          socket={socket}
          roomCode={roomCode}
          playerName={playerName}
          playerNumber={playerNumber}
          sessionTone={sessionTone}
          gameMode={gameMode}
        />
      )}
    </div>
  );
}

export default App;
