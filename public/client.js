const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const usernameInput = document.getElementById("username");

// send username when user types it
usernameInput.addEventListener("change", () => {
  socket.emit("set username", usernameInput.value);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg.user + ": " + msg.text;
  messages.appendChild(li);
});