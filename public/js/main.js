let clientIO = io();

const chatMessages = document.querySelector(".chat-messages");
clientIO.on("connect", () => { console.log("Connected to server..."); });
clientIO.on("message", messageObj => {
    outputMessage(messageObj);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
clientIO.on("roomUsers", roomDetails => {
    outputRoomDetails(roomDetails);
});
clientIO.on("chats", chats => {
    console.log("Chats ", chats);
});

const { username, room } = Qs.parse(window.location.search, {
    ignoreQueryPrefix: true
});
clientIO.emit("join", { username, room });
document.getElementById("greet-user").innerText = `Welcome ${username} !`;

const chatForm = document.getElementById("chat-form");
chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const msg = event.target.elements.msg.value;
    clientIO.emit('chatMessage', msg);
    event.target.elements.msg.value = "";
    event.target.elements.msg.focus();
});

function outputMessage(messageObj) {
    let div = document.createElement("div");
    div.classList.add("message");

    let message = messageObj.message;
    if (messageObj.username === "--ChatRoom Bot--") {
        message = `<strong style='color: gray'>${message}</strong>`;
    }

    div.innerHTML = `<p class="meta">${messageObj.username} <span>${messageObj.time}</span></p><p class="text">${message}</p>`;
    document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomDetails(roomDetails) {
    document.getElementById("room-name").innerText = roomDetails.room;
    document.getElementById("users").innerHTML = `${roomDetails.users.map(user => `<p>${user.username}</p>`).join('')}`;
}