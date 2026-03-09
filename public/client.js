const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const usernameInput = document.getElementById("username");
const usersList = document.getElementById("users");
const fileInput = document.getElementById("fileInput");

let currentUser = "";

// send username to server
usernameInput.addEventListener("change", () => {
  currentUser = usernameInput.value;
  socket.emit("set username", currentUser);
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

// helper to create messages
function addMessage(msg, isFile = false) {
  const li = document.createElement("li");
  li.id = msg.id;

  // display username
  const text = document.createElement("span");
  text.textContent = msg.user + (isFile ? ": " : ": " + (msg.text || ""));
  li.appendChild(text);

  // show delete button only for messages sent by current user
  if (msg.user === currentUser) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.onclick = () => socket.emit("delete message", msg.id);
    li.appendChild(deleteBtn);
  }

  if (isFile) {
    if (msg.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      const img = document.createElement("img");
      img.src = msg.file;
      li.appendChild(img);
    } else {
      const link = document.createElement("a");
      link.href = msg.file;
      link.target = "_blank";
      link.textContent = msg.name;
      li.appendChild(link);
    }
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

// display text messages
socket.on("chat message", (msg) => addMessage(msg));

// display file messages
socket.on("file message", (msg) => addMessage(msg, true));

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
