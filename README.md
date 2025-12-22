# Truth or Dare Game 🎮

A multiplayer Truth or Dare game built with React, Node.js, Express, and Socket.io.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Install all dependencies** (client + server + root):
```bash
npm install
npm run install:all
```

### Running the Application

#### ✅ Currently Running:
- **Server**: `http://localhost:3000` ✓
- **Client**: `http://localhost:5173` ✓

#### Option 1: Quick Start (Windows)
```bash
start.bat
```
Double-click `start.bat` or run it from the terminal to start everything at once!

#### Option 2: Run Both Client and Server Together
```bash
npm run dev
```
This will start:
- **Server** on `http://localhost:3000`
- **Client** on `http://localhost:5173`

#### Option 3: Run Separately

**Run Server Only:**
```bash
npm run server
```

**Run Client Only:**
```bash
npm run client
```

**Run Both Manually:**
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

## 📁 Project Structure

```
truth-or-dare-game/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend (Express + Socket.io)
├── package.json     # Root package with convenience scripts
└── README.md
```

## 🛠️ Available Scripts

- `npm run dev` - Run both client and server concurrently
- `npm run start` - Production mode (server) + dev mode (client)
- `npm run server` - Run server only
- `npm run client` - Run client only
- `npm run install:all` - Install dependencies for both client and server
- `npm run build` - Build client for production

## 🎯 How to Play

1. Start the application using `npm run dev`
2. Open your browser to `http://localhost:5173`
3. Create or join a game room
4. Play Truth or Dare with your friends!

## 🔧 Configuration

### Server
- Default port: `3000`
- Configure in `server/.env`

### Client
- Default port: `5173` (Vite dev server)
- Configure in `client/vite.config.js`

## 📝 License

MIT
