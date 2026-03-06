const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(http);

app.use(express.static("public"));

let users = {}; // store connected users

io.on("connection", (socket) => {
  console.log("User connected");

  // when a user sets a username
  socket.on("set username", (username) => {
    socket.username = username;
    users[socket.id] = username;

    // broadcast user joined
    io.emit("user joined", username);

    // update user list for everyone
    io.emit("update users", Object.values(users));
  });

  // handle messages
  socket.on("chat message", (msg) => {
    io.emit("chat message", {
      user: socket.username || "Anonymous",
      text: msg
    });
  });

  // handle disconnect
  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`${socket.username} disconnected`);

      // broadcast user left
      io.emit("user left", socket.username);

      // remove from users list
      delete users[socket.id];
      io.emit("update users", Object.values(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
