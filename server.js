const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(http);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected");

  // store username
  socket.on("set username", (username) => {
    socket.username = username;
  });

  socket.on("chat message", (msg) => {
    const messageData = {
      user: socket.username || "Anonymous",
      text: msg
    };

    io.emit("chat message", messageData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
