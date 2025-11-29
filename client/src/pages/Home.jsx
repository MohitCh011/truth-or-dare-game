import { useState } from 'react';
import './Home.css';

function Home({ onCreateRoom, onJoinRoom, recapData, onCloseRecap }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('create');
  const [tone, setTone] = useState('CHILL');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (mode === 'create') {
      onCreateRoom(name.trim(), tone);
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
      {recapData && (
        <div className="modal-backdrop" onClick={onCloseRecap}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Session recap</h2>
            <p className="modal-sub">{recapData.brutal}</p>
            <div className="modal-grid">
              <div>
                <span className="modal-label">Rounds</span>
                <span className="modal-value">{recapData.recap.rounds}</span>
              </div>
              <div>
                <span className="modal-label">Truths</span>
                <span className="modal-value">{recapData.recap.truthCount}</span>
              </div>
              <div>
                <span className="modal-label">Dares</span>
                <span className="modal-value">{recapData.recap.dareCount}</span>
              </div>
              <div>
                <span className="modal-label">P1 starts</span>
                <span className="modal-value">{recapData.recap.startedByP1}</span>
              </div>
              <div>
                <span className="modal-label">P2 starts</span>
                <span className="modal-value">{recapData.recap.startedByP2}</span>
              </div>
            </div>
            <button className="btn btn-primary modal-btn" onClick={onCloseRecap}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="home-card">
        <div className="logo-pill">
          <span className="logo-dot" />
          REAL-TIME · 2 PLAYER
        </div>

        <h1 className="home-title">
          <span className="gradient-text">Truth or Dare</span>
        </h1>
        <p className="subtitle">
          A tiny, intense room just for <span>two people</span>.  
          No preset cards. Only what you type.
        </p>

        <div className="mode-selection">
          <button
            type="button"
            className={`mode-chip ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
          >
            <span className="label">Create</span>
            <span className="desc">You’ll share a code.</span>
          </button>
          <button
            type="button"
            className={`mode-chip ${mode === 'join' ? 'active' : ''}`}
            onClick={() => setMode('join')}
          >
            <span className="label">Join</span>
            <span className="desc">Use a friend’s code.</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="entry-form">
          <div>
            <div className="input-label">Your name</div>
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
            <div>
              <div className="input-label">Room code</div>
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
            <div className="tone-section">
              <div className="input-label">Session tone</div>
              <div className="tone-pills">
                <button
                  type="button"
                  className={`tone-pill ${tone === 'CHILL' ? 'active' : ''}`}
                  onClick={() => setTone('CHILL')}
                >
                  Chill
                </button>
                <button
                  type="button"
                  className={`tone-pill ${tone === 'SPICY' ? 'active' : ''}`}
                  onClick={() => setTone('SPICY')}
                >
                  Spicy
                </button>
                <button
                  type="button"
                  className={`tone-pill ${tone === 'EXTREME' ? 'active' : ''}`}
                  onClick={() => setTone('EXTREME')}
                >
                  Extreme
                </button>
              </div>
            </div>
          )}

          <div className="button-group">
            <button type="submit" className="btn btn-primary">
              {mode === 'create' ? 'Start a new room' : 'Join with code'}
            </button>
          </div>
        </form>

        <div className="footer-note">
          <span className="footer-dot" />
          Designed for mobile. Rotate your phone if you want more space.
        </div>
      </div>
    </div>
  );
}

export default Home;
