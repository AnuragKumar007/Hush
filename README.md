# Hush 🤫

Hush is a modern, lightweight, web-based, anonymous temporary chat application designed for private person-to-person conversations. Inspired by the simplicity of Codeshare, Hush allows users to create a temporary room and instantly share a link to start chatting.

This project is tailored specifically for **mobile viewports**, offering an app-like dark mode interface by default.

---

## 🚀 Key Features
* **Zero Registration**: No signups, email verification, or phone numbers.
* **Instant Rooms**: Create a room with a single click, or join via direct URL/ID.
* **Ephemeral In-Memory State**: Messages and rooms are stored only in server memory. When the room is empty, or the server restarts, everything is permanently wiped.
* **Mobile-First UX**: Sleek, app-like mobile layout with bottom navigation/inputs and slide-out active user panels.
* **Default Dark Mode**: Glassmorphism aesthetic with indigo/cyan neon accents.
* **Anonymous Onboarding**: Automatically generates funny, incognito usernames (e.g. `SilentFox32`) for instant access.

---

## 🛠️ Tech Stack
* **Frontend**: React + Vite + Tailwind CSS v3 + Lucide Icons
* **Backend**: Node.js + Express
* **Real-time Engine**: Socket.io (server) & Socket.io-client (frontend)
* **Runner Utility**: Concurrently (to start client & server with one command)

---

## 📁 Folder Structure
```
Hush/
├── package.json               # Orchestrates both client and server commands
├── README.md                  # Documentation and setup instructions
├── client/                    # React frontend application
│   ├── index.html             # Entry HTML (configured with Inter font & mobile SEO)
│   ├── package.json           # Client packages
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind setup & theme extensions
│   ├── postcss.config.js      # PostCSS setup
│   └── src/
│       ├── main.jsx           # React app mount
│       ├── index.css          # Tailwind imports & mobile global styles
│       ├── App.jsx            # State-based router (Landing <-> Room)
│       ├── socket.js          # Socket.io client client configuration
│       ├── components/
│       │   ├── LandingPage.jsx     # Modern mobile hero section & join forms
│       │   ├── UsernameModal.jsx   # Temporary display name generator/input
│       │   ├── ChatRoom.jsx        # Mobile-app chat client layout
│       │   ├── MessageBubble.jsx   # Message rendering (me/others alignment)
│       │   ├── SystemNotification.jsx  # Joins, leaves, and server status alerts
│       │   └── Toast.jsx           # Floating status/action alerts
│       └── utils/
│           └── nameGenerator.js    # Random adjective + animal name creator
└── server/                    # Node.js backend
    ├── package.json           # Backend packages
    ├── .env                   # Server configurations (port, client URL)
    ├── .env.example           # Example environment template
    ├── server.js              # Express entry point & HTTP router
    ├── socket.js              # Socket.io connection & event mapping
    └── roomManager.js         # In-memory room and messaging state machine
```

---

## ⚡ Socket.io Events Architecture

### Server Events (Listeners)
* **`connection`**: Emitted when a client opens a socket session.
* **`join-room`** (`{ roomId, username }`): Registers the client user inside the in-memory room. 
  * Emits `room-joined` back to the joining socket.
  * Broadcasts `user-joined` to other room participants.
* **`send-message`** (`{ roomId, text }`): Receives chat message from a socket, appends to the in-memory room log (capped at 100 messages), and broadcasts `message` to all room users.
* **`leave-room`** (`{ roomId }`): Unregisters the client, leaves the socket channel, and broadcasts `user-left` to the room.
* **`disconnecting`** (Built-in): Automatically cleans up room memberships if the client closes the tab or loses connection.

### Client Events (Listeners)
* **`room-joined`** (`{ roomId, users, messages }`): Receives the room's current online list and historical messages.
* **`user-joined`** (`{ username, users }`): Triggered when someone else enters the room.
* **`message`** (`{ id, sender, text, timestamp }`): Receives a new real-time chat message.
* **`user-left`** (`{ username, users }`): Triggered when someone else exits the room.
* **`error`** (`errorMessage`): Receives system/server alerts (e.g. missing fields).

---

## ⚙️ Environment Configuration

### Backend (`/server/.env`)
Create a `.env` file in the `/server` folder:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend (`/client/.env`)
Optionally create a `.env` file in the `/client` folder for production deploys:
```env
VITE_SERVER_URL=http://localhost:5000
```

---

## ⚙️ Setup and Running Instructions

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [npm](https://www.npmjs.com/) (installed automatically with Node)

### Step 1: Install All Dependencies
From the root directory, run:
```bash
npm run install-all
```
This automatically runs `npm install` on the root, `/server`, and `/client` directories.

### Step 2: Start the Project in Development Mode
From the root directory, run:
```bash
npm run dev
```
This launches:
1. The **Backend Server** on `http://localhost:5000`
2. The **React/Vite Dev Server** on `http://localhost:5173`

Open `http://localhost:5173` on a mobile browser or in a simulated mobile device via Chrome DevTools to start chatting.
