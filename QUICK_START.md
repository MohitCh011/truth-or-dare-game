# 🎮 Truth or Dare Game - Quick Reference

## 🚀 Current Status
✅ **Server Running**: http://localhost:3000
✅ **Client Running**: http://localhost:5173

## 📋 Quick Commands

### Start Everything
```bash
# Windows - Double click or run:
start.bat

# Or use npm:
npm run dev
```

### Individual Commands
```bash
npm run server    # Start server only (port 3000)
npm run client    # Start client only (port 5173)
```

### Installation
```bash
npm install           # Install root dependencies
npm run install:all   # Install client + server dependencies
```

## 🌐 Access the Game
1. Open your browser
2. Go to: **http://localhost:5173**
3. Create or join a game room
4. Share the room code with a friend!

## 🛑 Stop Servers
Press `Ctrl + C` in the terminal where servers are running

## 📁 Project Structure
```
truth-or-dare-game/
├── client/              # React frontend (Vite)
│   ├── src/            # React components
│   └── .env            # Client config (VITE_SERVER_URL)
├── server/              # Node.js backend
│   ├── server.js       # Express + Socket.io server
│   └── .env            # Server config (PORT, CLIENT_URL)
├── package.json         # Root scripts
├── start.bat           # Windows quick start
└── README.md           # Full documentation
```

## 🔧 Configuration Files

### server/.env
```
PORT=3000
CLIENT_URL=http://localhost:5173
```

### client/.env
```
VITE_SERVER_URL=http://localhost:3000
```

## 🎯 How to Play
1. **Player 1**: Create a room and share the code
2. **Player 2**: Join using the room code
3. **Both**: Click "I'm ready" when the rules screen appears
4. **Take turns**: Choose Truth or Dare (or press T/D on keyboard)
5. **Chat**: Use the chat to ask questions or give dares
6. **Vibe slider**: Adjust intensity if things get too spicy!

## 💡 Tips
- Use keyboard shortcuts: **T** for Truth, **D** for Dare
- Quick emotes available: 🔥 😂 😈 🤮 💀 ❤️
- Adjust your vibe slider to signal comfort level
- 30-second turn timer keeps the game moving

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Run: `npm install --prefix server`

### Client won't start
- Check if port 5173 is already in use
- Run: `npm install --prefix client`

### Connection issues
- Verify both servers are running
- Check .env files have correct URLs
- Clear browser cache and reload

## 📞 Need Help?
Check the full [README.md](README.md) for detailed documentation.
