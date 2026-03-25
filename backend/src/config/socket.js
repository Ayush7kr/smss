const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const getCookie = (name, cookies) => {
   const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
   if (match) return match[2];
   return null;
}

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    let token = socket.handshake.auth.token;
    if (!token && socket.handshake.headers.cookie) {
       token = getCookie('jwt', socket.handshake.headers.cookie);
    }
    
    if (!token) {
       return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { userId, role, tenantId }
      next();
    } catch(err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: User ${socket.user.userId}`);
    
    // Join tenant room
    socket.join(socket.user.tenantId);
    
    // Join specific user room for direct targeting
    socket.join(socket.user.userId.toString());

    // Join role specific room e.g., TECH-999_Society_Admin
    if (socket.user.role) {
       socket.join(`${socket.user.tenantId}_${socket.user.role}`);
    }

    socket.on("disconnect", () => {
       console.log(`Socket disconnected: User ${socket.user.userId}`);
    });
  });
};

const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

module.exports = { initSocket, getIo };
