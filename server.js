const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");

const io = new Server(http);

// store users
let users = {};

// file upload setup
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
    name: req.file.originalname
  });
});

// socket logic
io.on("connection", (socket) => {

  socket.on("set username", (username) => {
    socket.username = username;
    users[socket.id] = username;

    io.emit("user joined", username);
    io.emit("update users", Object.values(users));
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", {
      user: socket.username || "Anonymous",
      text: msg
    });
  });

  socket.on("file message", (data) => {
    io.emit("file message", {
      user: socket.username,
      file: data.file,
      name: data.name
    });
  });

  socket.on("disconnect", () => {
    if (socket.username) {
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
