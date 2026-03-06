const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const usernameInput = document.getElementById("username");
const usersList = document.getElementById("users");

// send username to server
usernameInput.addEventListener("change", () => {
  socket.emit("set username", usernameInput.value);
});

// send messages
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

// display chat messages
socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg.user + ": " + msg.text;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// display user joined message
socket.on("user joined", (username) => {
  const li = document.createElement("li");
  li.textContent = username + " joined the chat";
  li.style.fontStyle = "italic";
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// display user left message
socket.on("user left", (username) => {
  const li = document.createElement("li");
  li.textContent = username + " left the chat";
  li.style.fontStyle = "italic";
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

// update user list sidebar
socket.on("update users", (users) => {
  usersList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user;
    usersList.appendChild(li);
  });
});
