const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const usernameInput = document.getElementById("username");
const usersList = document.getElementById("users");
const fileInput = document.getElementById("fileInput");

// send username to server
usernameInput.addEventListener("change", () => {
  socket.emit("set username", usernameInput.value);
});

// send messages and files
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    socket.emit("file message", data);

    fileInput.value = "";
  }
});

// display text messages
socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.id = msg.id;

  const text = document.createElement("span");
  text.textContent = msg.user + ": " + msg.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.style.marginLeft = "10px";
  deleteBtn.onclick = () => socket.emit("delete message", msg.id);

  li.appendChild(text);
  li.appendChild(deleteBtn);
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// display file messages with preview
socket.on("file message", (data) => {
  const li = document.createElement("li");
  li.id = data.id;
  li.textContent = data.user + ": ";

  if (data.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    const img = document.createElement("img");
    img.src = data.file;
    li.appendChild(img);
  } else {
    const link = document.createElement("a");
    link.href = data.file;
    link.target = "_blank";
    link.textContent = data.name;
    li.appendChild(link);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.onclick = () => socket.emit("delete message", data.id);

  li.appendChild(deleteBtn);
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// delete messages
socket.on("delete message", (id) => {
  const message = document.getElementById(id);
  if (message) message.remove();
});

// user join/leave messages
socket.on("user joined", (username) => {
  const li = document.createElement("li");
  li.textContent = username + " joined the chat";
  li.style.fontStyle = "italic";
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("user left", (username) => {
  const li = document.createElement("li");
  li.textContent = username + " left the chat";
  li.style.fontStyle = "italic";
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// update sidebar user list
socket.on("update users", (users) => {
  usersList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user;
    usersList.appendChild(li);
  });
});
