import { useState, useEffect, useRef } from 'react';
import './GameRoom.css';

const TURN_DURATION = 30;

const toneColors = {
  CHILL: 'chill',
  SPICY: 'spicy',
  EXTREME: 'extreme'
};

function GameRoom({ socket, roomCode, playerName, playerNumber, sessionTone }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [gameReady, setGameReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [typingPlayer, setTypingPlayer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION);
  const [vibes, setVibes] = useState({ 1: 0.3, 2: 0.3 });
  const [localVibe, setLocalVibe] = useState(0.3);

  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const handleGameReady = ({ players, currentTurn, tone }) => {
      setGameReady(true);
      setPlayers(players || []);
      setCurrentTurn(currentTurn || 1);

      const systemMessage = {
        text: `Both players joined. Tone: ${tone || sessionTone}`,
        sender: 'System',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, systemMessage]);
    };

    const handleStartGame = ({ currentTurn }) => {
      setStarted(true);
      setCurrentTurn(currentTurn || 1);
      setTimeLeft(TURN_DURATION);
      startTimer();
    };

    const handleReceiveMessage = (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    };

    const handleChoiceSelected = ({ choice, playerName }) => {
      const choiceMessage = {
        text: `${playerName} chose ${choice}!`,
        sender: 'System',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, choiceMessage]);
      setSelectedChoice(choice);
      setTimeLeft(TURN_DURATION);
    };

    const handleTurnChanged = ({ currentTurn }) => {
      setCurrentTurn(currentTurn);
      setSelectedChoice(null);
      setTimeLeft(TURN_DURATION);
      const turnMessage = {
        text: `Now it's Player ${currentTurn}'s turn.`,
        sender: 'System',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, turnMessage]);
      startTimer();
    };

    const handleTyping = ({ playerName: pName }) => {
      if (pName !== playerName) {
        setTypingPlayer(pName);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingPlayer(null);
        }, 1500);
      }
    };

    const handleVibeChanged = ({ playerNumber, vibe }) => {
      setVibes((prev) => ({ ...prev, [playerNumber]: vibe }));
    };

    socket.on('game_ready', handleGameReady);
    socket.on('start_game', handleStartGame);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('choice_selected', handleChoiceSelected);
    socket.on('turn_changed', handleTurnChanged);
    socket.on('typing', handleTyping);
    socket.on('vibe_changed', handleVibeChanged);

    return () => {
      socket.off('game_ready', handleGameReady);
      socket.off('start_game', handleStartGame);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('choice_selected', handleChoiceSelected);
      socket.off('turn_changed', handleTurnChanged);
      socket.off('typing', handleTyping);
      socket.off('vibe_changed', handleVibeChanged);
      stopTimer();
    };
  }, [socket, playerName, sessionTone]);

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
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e?.preventDefault?.();

    if (inputMessage.trim()) {
      socket.emit('send_message', {
        roomCode,
        message: inputMessage,
        senderName: playerName
      });
      setInputMessage('');
    }
  };

  const handleChoiceSelect = (choice) => {
    if (!isMyTurn) return;
    socket.emit('select_choice', {
      roomCode,
      choice,
      playerName,
      playerNumber
    });
  };

  const handleNextTurn = () => {
    socket.emit('next_turn', { roomCode });
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    socket.emit('typing', { roomCode, playerName });
  };

  const handleQuickEmote = (icon) => {
    socket.emit('send_message', {
      roomCode,
      message: icon,
      senderName: playerName
    });
  };

  const handleVibeChange = (e) => {
    const value = Number(e.target.value);
    setLocalVibe(value);
    socket.emit('vibe_update', { roomCode, playerNumber, vibe: value });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      alert('Room code copied');
    } catch (err) {
      console.error(err);
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
  const otherPlayer =
    players.find((p) => p.playerNumber !== playerNumber) || null;

  const timerPercent = Math.max(0, (timeLeft / TURN_DURATION) * 100);
  const toneClass = toneColors[sessionTone] || 'chill';

  const myVibe = vibes[playerNumber] ?? 0.3;
  const otherVibe =
    otherPlayer ? vibes[otherPlayer.playerNumber] ?? 0.3 : 0.3;

  return (
    <div className="game-room">
      <div className="game-shell">
        <div className="game-header">
          <div className="room-info">
            <h2>Truth or Dare · Room</h2>
            <div className="room-code-pill">
              <span>Code</span>
              <strong>{roomCode}</strong>
              <button className="copy-btn" type="button" onClick={handleCopyCode}>
                Copy
              </button>
            </div>
          </div>

          <div className="header-right">
            <div className={`tone-badge ${toneClass}`}>
              {sessionTone === 'CHILL' && 'Chill'}
              {sessionTone === 'SPICY' && 'Spicy'}
              {sessionTone === 'EXTREME' && 'Extreme'}
            </div>
            <div className="player-badges">
              <div className="player-chip me">
                <span className="online-dot" />
                <span>P{playerNumber} · {playerName}</span>
              </div>
              {otherPlayer && (
                <div className="player-chip">
                  <span className="online-dot" />
                  <span>P{otherPlayer.playerNumber} · {otherPlayer.name}</span>
                </div>
              )}
            </div>
            <button className="end-btn" type="button" onClick={handleEndGame}>
              End
            </button>
          </div>
        </div>

        {gameReady && !started && (
          <div className="rules-overlay">
            <div className="rules-card">
              <h3>Ready to start?</h3>
              <p>Tone: {sessionTone.toLowerCase()}</p>
              <ul>
                <li>No pre-written cards. You type every truth/dare.</li>
                <li>Respect each other’s boundaries.</li>
                <li>Use vibe slider if it gets too wild.</li>
              </ul>
              <button className="btn btn-primary rules-btn" onClick={handleReady}>
                I’m ready
              </button>
            </div>
          </div>
        )}

        {gameReady && (
          <div className="vibe-row">
            <div className="vibe-col">
              <div className="vibe-label">Your vibe</div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localVibe}
                onChange={handleVibeChange}
              />
            </div>
            {otherPlayer && (
              <div className="vibe-col">
                <div className="vibe-label">
                  {otherPlayer.name}'s vibe
                </div>
                <div className="vibe-bar-outer">
                  <div
                    className="vibe-bar-inner"
                    style={{ width: `${otherVibe * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {gameReady && (
          <div className="game-content">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Choice</div>
                  <div className="panel-sub">
                    {isMyTurn
                      ? 'Pick Truth or Dare, then wait for the attack.'
                      : 'Wait for them to choose, then attack in chat.'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="panel-sub">
                    Turn time: {timeLeft}s
                  </div>
                  <div className={`timer-bar-shell ${timeLeft <= 5 ? 'low' : ''}`}>
                    <div
                      className="timer-bar"
                      style={{ width: `${timerPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="choice-card">
                {!selectedChoice && isMyTurn && (
                  <div className="choice-pills">
                    <button
                      className="choice-btn truth-btn"
                      onClick={() => handleChoiceSelect('Truth')}
                    >
                      T · Truth
                    </button>
                    <button
                      className="choice-btn dare-btn"
                      onClick={() => handleChoiceSelect('Dare')}
                    >
                      D · Dare
                    </button>
                  </div>
                )}

                {selectedChoice && (
                  <>
                    <div className="selected-tag">Selected</div>
                    <div
                      className={`selected-main ${
                        selectedChoice === 'Truth' ? 'truth' : 'dare'
                      }`}
                    >
                      {selectedChoice.toUpperCase()}
                    </div>
                    <p className="instruction">
                      {isMyTurn
                        ? 'Wait for them to send the question / dare in chat.'
                        : 'Use the chat to ask a brutal question or give a dare.'}
                    </p>
                    <button
                      onClick={handleNextTurn}
                      className="next-turn-btn"
                    >
                      End turn · pass to the other
                    </button>
                  </>
                )}

                {!selectedChoice && !isMyTurn && (
                  <p className="instruction">
                    Waiting for Player {currentTurn} to choose…
                  </p>
                )}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Chat</div>
                  <div className="panel-sub">
                    Type your own truths and dares. No filter.
                  </div>
                </div>
              </div>

              <div className="typing-indicator">
                {typingPlayer && `${typingPlayer} is typing…`}
              </div>

              <div className="messages-container">
                <div className="messages-inner">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={
                        msg.sender === 'System'
                          ? 'system-message'
                          : msg.sender === playerName
                          ? 'message my-message'
                          : 'message other-message'
                      }
                    >
                      {msg.sender !== 'System' && (
                        <div className="message-sender">{msg.sender}</div>
                      )}
                      <div className="message-text">{msg.text}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="quick-replies">
                {['🔥', '😂', '😈', '🤮', '💀', '❤️'].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className="quick-btn"
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
                  placeholder="Type your question, dare, or reply…"
                  className="message-input"
                />
                <button type="submit" className="send-btn">
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
