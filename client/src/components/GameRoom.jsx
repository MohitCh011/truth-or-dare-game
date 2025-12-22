import { useState, useEffect, useRef } from 'react';
import './GameRoom.css';

const TURN_DURATION = 30;

const toneColors = {
  CHILL: 'chill',
  SPICY: 'spicy',
  EXTREME: 'extreme'
};

function GameRoom({ socket, roomCode, playerName, playerNumber, sessionTone, gameMode }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [gameReady, setGameReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [typingPlayer, setTypingPlayer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION);
  const [vibes, setVibes] = useState({ 1: 0.3, 2: 0.3 });
  const [localVibe, setLocalVibe] = useState(0.3);

  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Helper to add system message
  const pushSystem = (text) => {
    setMessages((m) => [...m, { text, sender: 'System', timestamp: new Date().toISOString(), id: `sys-${Date.now()}` }]);
  };

  useEffect(() => {
    const handleGameReady = ({ players: p, currentTurn: ct, tone }) => {
      setGameReady(true);
      setPlayers(p || []);
      setCurrentTurn(ct || 1);
      pushSystem(`Both players joined. Tone: ${tone || sessionTone}. Mode: ${gameMode}`);
    };

    const handleStartGame = ({ currentTurn: ct }) => {
      setStarted(true);
      setCurrentTurn(ct || 1);
      setTimeLeft(TURN_DURATION);
      startTimer();
      pushSystem('Game started!');
    };

    const handleReceiveMessage = (messageData) => {
      setMessages((prev) => [...prev, { ...messageData, id: `m-${Date.now()}-${Math.random()}` }]);
    };

    const handleChoiceSelected = ({ choice, playerName: pName }) => {
      pushSystem(`${pName} chose ${choice}!`);
      setSelectedChoice(choice);
      setTimeLeft(TURN_DURATION);

      // In random mode, request a question from server
      if (gameMode === 'RANDOM') {
        socket.emit('get_random_question', { roomCode, choice });
      }
    };

    const handleRandomQuestion = ({ question, choice }) => {
      setRandomQuestion(question);
      pushSystem(`${choice}: ${question}`);
    };

    const handleTurnChanged = ({ currentTurn: ct }) => {
      setCurrentTurn(ct);
      setSelectedChoice(null);
      setRandomQuestion(null);
      setTimeLeft(TURN_DURATION);
      pushSystem(`Now it's Player ${ct}'s turn.`);
      startTimer();
    };

    const handleTyping = ({ playerName: pName }) => {
      if (pName !== playerName) {
        setTypingPlayer(pName);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingPlayer(null), 1500);
      }
    };

    const handleVibeChanged = ({ playerNumber: pn, vibe }) => {
      setVibes((prev) => ({ ...prev, [pn]: vibe }));
    };

    socket.on('game_ready', handleGameReady);
    socket.on('start_game', handleStartGame);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('choice_selected', handleChoiceSelected);
    socket.on('random_question', handleRandomQuestion);
    socket.on('turn_changed', handleTurnChanged);
    socket.on('typing', handleTyping);
    socket.on('vibe_changed', handleVibeChanged);

    return () => {
      socket.off('game_ready', handleGameReady);
      socket.off('start_game', handleStartGame);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('choice_selected', handleChoiceSelected);
      socket.off('random_question', handleRandomQuestion);
      socket.off('turn_changed', handleTurnChanged);
      socket.off('typing', handleTyping);
      socket.off('vibe_changed', handleVibeChanged);
      stopTimer();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, playerName, sessionTone, gameMode, roomCode]);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e?.preventDefault?.();
    if (!inputMessage.trim()) return;
    socket.emit('send_message', {
      roomCode,
      message: inputMessage.trim(),
      senderName: playerName
    });
    setInputMessage('');
  };

  const handleChoiceSelect = (choice) => {
    if (!isMyTurn) return;
    setSelectedChoice(choice);
    socket.emit('select_choice', { roomCode, choice, playerName, playerNumber });
  };

  const handleNextTurn = () => {
    socket.emit('next_turn', { roomCode });
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    socket.emit('typing', { roomCode, playerName });
  };

  const handleQuickEmote = (icon) => {
    socket.emit('send_message', { roomCode, message: icon, senderName: playerName });
  };

  const handleVibeChange = (e) => {
    const value = Number(e.target.value);
    setLocalVibe(value);
    socket.emit('vibe_update', { roomCode, playerNumber, vibe: value });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      pushSystem('Room code copied to clipboard');
    } catch (err) {
      pushSystem('Failed to copy room code');
    }
  };

  const handleEndGame = () => {
    if (confirm('End this session for both players?')) {
      socket.emit('end_game', { roomCode });
    }
  };

  const handleReady = () => {
    socket.emit('player_ready', { roomCode, playerNumber });
  };

  const isMyTurn = currentTurn === playerNumber;
  const otherPlayer = players.find((p) => p.playerNumber !== playerNumber) || null;
  const timerPercent = Math.max(0, (timeLeft / TURN_DURATION) * 100);
  const toneClass = toneColors[sessionTone] || 'chill';
  const myVibe = vibes[playerNumber] ?? 0.3;
  const otherVibe = otherPlayer ? vibes[otherPlayer.playerNumber] ?? 0.3 : 0.3;

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (!isMyTurn || selectedChoice) return;
      if (e.key.toLowerCase() === 't') handleChoiceSelect('Truth');
      if (e.key.toLowerCase() === 'd') handleChoiceSelect('Dare');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMyTurn, selectedChoice]);

  return (
    <div className="game-room">
      <div className="game-shell glass-card">
        {/* Header */}
        <div className="game-header">
          <div className="room-info">
            <h2 className="gradient-text">Truth or Dare</h2>
            <div className="room-code-pill">
              <span className="code-label">Room</span>
              <strong className="code-value">{roomCode}</strong>
              <button className="copy-btn" type="button" onClick={handleCopyCode}>
                📋
              </button>
            </div>
          </div>

          <div className="header-right">
            <div className={`tone-badge ${toneClass}`}>
              {sessionTone === 'CHILL' && '😌 Chill'}
              {sessionTone === 'SPICY' && '🌶️ Spicy'}
              {sessionTone === 'EXTREME' && '🔥 Extreme'}
            </div>
            <div className={`mode-badge ${gameMode.toLowerCase()}`}>
              {gameMode === 'RANDOM' ? '🎲 Random' : '💬 Chat'}
            </div>
            <button className="end-btn btn-outline" type="button" onClick={handleEndGame}>
              End Game
            </button>
          </div>
        </div>

        {/* Player Info */}
        <div className="player-info-bar">
          <div className={`player-chip ${isMyTurn ? 'active' : ''}`}>
            <span className="player-avatar">P{playerNumber}</span>
            <span className="player-name">{playerName}</span>
            <span className="player-status">{isMyTurn ? '🎯 Your Turn' : '⏳ Waiting'}</span>
          </div>
          {otherPlayer && (
            <div className={`player-chip ${currentTurn === otherPlayer.playerNumber ? 'active' : ''}`}>
              <span className="player-avatar">P{otherPlayer.playerNumber}</span>
              <span className="player-name">{otherPlayer.name}</span>
              <span className="player-status">
                {currentTurn === otherPlayer.playerNumber ? '🎯 Their Turn' : '⏳ Waiting'}
              </span>
            </div>
          )}
        </div>

        {/* Waiting for players */}
        {!gameReady && (
          <div className="waiting-panel glass-card animate-pulse">
            <div className="waiting-icon">⏳</div>
            <h3>Waiting for Player 2...</h3>
            <p>Share the room code: <strong>{roomCode}</strong></p>
          </div>
        )}

        {/* Ready Screen */}
        {gameReady && !started && (
          <div className="rules-overlay">
            <div className="rules-card glass-card animate-scaleIn">
              <h3 className="gradient-text">Ready to Play?</h3>
              <div className="game-info">
                <div className="info-item">
                  <span className="info-label">Tone:</span>
                  <span className="info-value">{sessionTone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mode:</span>
                  <span className="info-value">{gameMode === 'RANDOM' ? 'Random Questions' : 'Custom Chat'}</span>
                </div>
              </div>
              <ul className="rules-list">
                {gameMode === 'RANDOM' ? (
                  <>
                    <li>🎲 Questions are randomly selected</li>
                    <li>🎯 Choose Truth or Dare each turn</li>
                    <li>💬 Chat to discuss and react</li>
                  </>
                ) : (
                  <>
                    <li>💬 Type your own questions and dares</li>
                    <li>🎯 Choose Truth or Dare each turn</li>
                    <li>🤝 Respect boundaries</li>
                  </>
                )}
                <li>⌨️ Press <strong>T</strong> for Truth, <strong>D</strong> for Dare</li>
                <li>🎚️ Use vibe slider if needed</li>
              </ul>
              <button className="btn btn-primary ready-btn" onClick={handleReady}>
                I'm Ready! 🚀
              </button>
            </div>
          </div>
        )}

        {/* Vibe Sliders */}
        {gameReady && (
          <div className="vibe-section">
            <div className="vibe-control">
              <label className="vibe-label">
                <span className="vibe-icon">🎚️</span>
                Your Vibe
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localVibe}
                onChange={handleVibeChange}
                className="vibe-slider"
              />
              <span className="vibe-value">{Math.round(localVibe * 100)}%</span>
            </div>
            {otherPlayer && (
              <div className="vibe-control">
                <label className="vibe-label">
                  <span className="vibe-icon">👤</span>
                  {otherPlayer.name}'s Vibe
                </label>
                <div className="vibe-bar">
                  <div className="vibe-bar-fill" style={{ width: `${otherVibe * 100}%` }} />
                </div>
                <span className="vibe-value">{Math.round(otherVibe * 100)}%</span>
              </div>
            )}
            <div className="timer-display">
              <span className="timer-label">⏱️ Turn Timer</span>
              <div className={`timer-bar-container ${timeLeft <= 5 ? 'warning' : ''}`}>
                <div className="timer-bar-fill" style={{ width: `${timerPercent}%` }} />
              </div>
              <span className="timer-value">{timeLeft}s</span>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        {gameReady && (
          <div className="game-content">
            {/* Choice Panel */}
            <div className="choice-panel glass-card">
              <div className="panel-header">
                <h3 className="panel-title gradient-text">
                  {isMyTurn ? '🎯 Your Turn' : `⏳ Player ${currentTurn}'s Turn`}
                </h3>
                <p className="panel-subtitle">
                  {isMyTurn ? 'Choose Truth or Dare' : 'Wait for their choice'}
                </p>
              </div>

              <div className="choice-area">
                {!selectedChoice && isMyTurn && (
                  <div className="choice-buttons animate-scaleIn">
                    <button
                      className="choice-btn truth-btn"
                      onClick={() => handleChoiceSelect('Truth')}
                    >
                      <span className="choice-icon">💭</span>
                      <span className="choice-text">Truth</span>
                      <span className="choice-hint">Press T</span>
                    </button>
                    <button
                      className="choice-btn dare-btn"
                      onClick={() => handleChoiceSelect('Dare')}
                    >
                      <span className="choice-icon">⚡</span>
                      <span className="choice-text">Dare</span>
                      <span className="choice-hint">Press D</span>
                    </button>
                  </div>
                )}

                {selectedChoice && (
                  <div className="selected-choice animate-scaleIn">
                    <div className="selected-badge">Selected</div>
                    <div className={`selected-display ${selectedChoice.toLowerCase()}`}>
                      <span className="selected-icon">
                        {selectedChoice === 'Truth' ? '💭' : '⚡'}
                      </span>
                      <span className="selected-text">{selectedChoice.toUpperCase()}</span>
                    </div>

                    {gameMode === 'RANDOM' && randomQuestion && (
                      <div className="random-question">
                        <div className="question-label">Your Challenge:</div>
                        <div className="question-text">{randomQuestion}</div>
                      </div>
                    )}

                    {gameMode === 'CHAT' && (
                      <p className="instruction-text">
                        {isMyTurn
                          ? '💬 Wait for them to send the question/dare in chat'
                          : '💬 Send your question or dare in the chat below'}
                      </p>
                    )}

                    <button onClick={handleNextTurn} className="btn btn-secondary next-btn">
                      Next Turn →
                    </button>
                  </div>
                )}

                {!selectedChoice && !isMyTurn && (
                  <div className="waiting-choice">
                    <div className="waiting-icon animate-pulse">⏳</div>
                    <p>Waiting for Player {currentTurn} to choose...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="chat-panel glass-card">
              <div className="panel-header">
                <h3 className="panel-title gradient-text">💬 Chat</h3>
                <p className="panel-subtitle">
                  {gameMode === 'RANDOM' ? 'Discuss and react' : 'Send your questions and dares'}
                </p>
              </div>

              {typingPlayer && (
                <div className="typing-indicator">
                  <span className="typing-dots">●●●</span>
                  {typingPlayer} is typing...
                </div>
              )}

              <div className="messages-container">
                <div className="messages-inner">
                  {messages.map((msg) => {
                    const key = msg.id || `${msg.timestamp}-${Math.random()}`;
                    const isSystem = msg.sender === 'System';
                    const mine = msg.sender === playerName;
                    const cls = isSystem ? 'system-message' : mine ? 'message my-message' : 'message other-message';
                    return (
                      <div key={key} className={`${cls} animate-slideUp`}>
                        {!isSystem && <div className="message-sender">{msg.sender}</div>}
                        <div className="message-text">{msg.text}</div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="quick-emotes">
                {['🔥', '😂', '😈', '🤮', '💀', '❤️'].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className="emote-btn"
                    onClick={() => handleQuickEmote(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="message-form">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="message-input"
                />
                <button type="submit" className="send-btn btn-primary">
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameRoom;
