const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");

const io = new Server(http);

// store connected users
let users = {};

// Multer file upload setup
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// serve frontend
app.use(express.static("public"));

// upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    file: "/uploads/" + req.file.filename,
    name: req.file.originalname,
    id: randomUUID()
  });
});

// socket logic
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("set username", (username) => {
    socket.username = username;
    users[socket.id] = username;

    io.emit("user joined", username);
    io.emit("update users", Object.values(users));
  });

  socket.on("chat message", (msg) => {
    const message = {
      id: randomUUID(),
      user: socket.username || "Anonymous",
      text: msg
    };
    io.emit("chat message", message);
  });

  socket.on("file message", (data) => {
    const message = {
      id: data.id,
      user: socket.username || "Anonymous",
      file: data.file,
      name: data.name
    };
    io.emit("file message", message);
  });

  socket.on("delete message", (id) => {
    io.emit("delete message", id);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`${socket.username} disconnected`);
      io.emit("user left", socket.username);
      delete users[socket.id];
      io.emit("update users", Object.values(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
