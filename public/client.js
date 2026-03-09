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
const fileInput = document.getElementById("fileInput");

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

socket.on("file message", (data) => {

  const li = document.createElement("li");

  const fileUrl = data.file;
  const fileName = data.name;

  li.textContent = data.user + ": ";

  // check if file is an image
  if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {

    const img = document.createElement("img");
    img.src = fileUrl;
    img.style.maxWidth = "200px";
    img.style.display = "block";
    img.style.marginTop = "5px";

    li.appendChild(img);

  } else {

    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.textContent = fileName;

    li.appendChild(link);

  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;

});
