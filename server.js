const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-lobby", (username) => {
    users.push({ id: socket.id, username });
    console.log(`${username} joined the lobby.`);
    if (users.length > 1) {
      // Notify the most recent two users
      const [user1, user2] = users.slice(-2);
      io.to(user1.id).emit("ready-to-call");
      io.to(user2.id).emit("ready-to-call");
    }
  });

  socket.on("offer", (data) => {
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    users = users.filter(u => u.id !== socket.id);
    console.log("User disconnected:", socket.id);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server is running...");
});