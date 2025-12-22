import { useState } from 'react';
import './Home.css';

function Home({ onCreateRoom, onJoinRoom, recapData, onCloseRecap }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('create');
  const [tone, setTone] = useState('CHILL');
  const [gameMode, setGameMode] = useState('RANDOM'); // RANDOM or CHAT

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (mode === 'create') {
      onCreateRoom(name.trim(), tone, gameMode);
    } else {
      if (!roomCode.trim()) {
        alert('Please enter room code');
        return;
      }
      onJoinRoom(roomCode.toUpperCase(), name.trim());
    }
  };

  return (
    <div className="home-container">
      {/* Floating Particles Background */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {recapData && (
        <div className="modal-backdrop animate-fadeIn" onClick={onCloseRecap}>
          <div className="modal-card glass-card animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h2 className="gradient-text">Session Recap</h2>
            <p className="modal-sub">{recapData.brutal}</p>
            <div className="modal-grid">
              <div className="stat-card">
                <span className="stat-label">Rounds</span>
                <span className="stat-value gradient-text">{recapData.recap.rounds}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Truths</span>
                <span className="stat-value gradient-text">{recapData.recap.truthCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Dares</span>
                <span className="stat-value gradient-text">{recapData.recap.dareCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">P1 Starts</span>
                <span className="stat-value gradient-text">{recapData.recap.startedByP1}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">P2 Starts</span>
                <span className="stat-value gradient-text">{recapData.recap.startedByP2}</span>
              </div>
            </div>
            <button className="btn btn-primary modal-btn" onClick={onCloseRecap}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="home-card glass-card animate-slideUp">
        <div className="logo-section">
          <div className="logo-pill">
            <span className="logo-dot" />
            REAL-TIME · 2 PLAYER
          </div>
        </div>

        <h1 className="home-title">
          <span className="gradient-text">Truth or Dare</span>
        </h1>
        <p className="subtitle">
          A thrilling room for <span className="highlight">two people</span>.
          Choose your adventure: Random prompts or custom challenges.
        </p>

        {/* Create/Join Mode Selection */}
        <div className="mode-selection">
          <button
            type="button"
            className={`mode-chip ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
          >
            <div className="mode-icon">🎮</div>
            <div className="mode-content">
              <span className="mode-label">Create</span>
              <span className="mode-desc">Start a new room</span>
            </div>
          </button>
          <button
            type="button"
            className={`mode-chip ${mode === 'join' ? 'active' : ''}`}
            onClick={() => setMode('join')}
          >
            <div className="mode-icon">🔗</div>
            <div className="mode-content">
              <span className="mode-label">Join</span>
              <span className="mode-desc">Use friend's code</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="entry-form">
          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">👤</span>
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Devil, Angel, Psycho..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="input-field"
            />
          </div>

          {mode === 'join' && (
            <div className="input-group animate-slideDown">
              <label className="input-label">
                <span className="label-icon">🔑</span>
                Room Code
              </label>
              <input
                type="text"
                placeholder="6-letter code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="input-field"
              />
            </div>
          )}

          {mode === 'create' && (
            <>
              {/* Game Mode Selection */}
              <div className="game-mode-section animate-slideDown">
                <label className="input-label">
                  <span className="label-icon">🎯</span>
                  Game Mode
                </label>
                <div className="game-mode-pills">
                  <button
                    type="button"
                    className={`game-mode-pill ${gameMode === 'RANDOM' ? 'active' : ''}`}
                    onClick={() => setGameMode('RANDOM')}
                  >
                    <div className="pill-icon">🎲</div>
                    <div className="pill-content">
                      <span className="pill-title">Random</span>
                      <span className="pill-subtitle">Pre-selected prompts</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`game-mode-pill ${gameMode === 'CHAT' ? 'active' : ''}`}
                    onClick={() => setGameMode('CHAT')}
                  >
                    <div className="pill-icon">💬</div>
                    <div className="pill-content">
                      <span className="pill-title">Chat</span>
                      <span className="pill-subtitle">Type your own</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tone Selection */}
              <div className="tone-section animate-slideDown">
                <label className="input-label">
                  <span className="label-icon">🌡️</span>
                  Session Tone
                </label>
                <div className="tone-pills">
                  <button
                    type="button"
                    className={`tone-pill chill ${tone === 'CHILL' ? 'active' : ''}`}
                    onClick={() => setTone('CHILL')}
                  >
                    <span className="tone-emoji">😌</span>
                    <span className="tone-name">Chill</span>
                  </button>
                  <button
                    type="button"
                    className={`tone-pill spicy ${tone === 'SPICY' ? 'active' : ''}`}
                    onClick={() => setTone('SPICY')}
                  >
                    <span className="tone-emoji">🌶️</span>
                    <span className="tone-name">Spicy</span>
                  </button>
                  <button
                    type="button"
                    className={`tone-pill extreme ${tone === 'EXTREME' ? 'active' : ''}`}
                    onClick={() => setTone('EXTREME')}
                  >
                    <span className="tone-emoji">🔥</span>
                    <span className="tone-name">Extreme</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="button-group">
            <button type="submit" className="btn btn-primary submit-btn">
              <span className="btn-text">
                {mode === 'create' ? '🚀 Start New Room' : '🎮 Join Room'}
              </span>
            </button>
          </div>
        </form>

        <div className="footer-note">
          <span className="footer-dot" />
          Optimized for mobile & desktop. Enjoy the experience!
        </div>
      </div>
    </div>
  );
}

export default Home;
