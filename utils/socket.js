const socketIO = require("socket.io");
const createMessage = require("./messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./users");

const appName = "--ChatRoom Bot--";
function socketApp(server) {
    const socket = socketIO(server);
    socket.on('connection', io => {
        // Listen to join event
        io.on("join", ({ username, room }) => {
            const user = userJoin(io.id, username, room);
            io.join(user.room);

            // Welcomes new client
            io.emit("message", createMessage(appName, `Hello ${user.username}!, welcome to ${user.room} chat room`));

            // Broadcast when a user joins chat
            io.broadcast.to(user.room).emit("message", createMessage(appName, `${user.username} has joined the chat!`));

            // Emit list of users and room in the chat room
            socket.to(room).emit("roomUsers", { room: user.room, users: getRoomUsers(user.room) });
        });

        // Listen to client messages
        io.on("chatMessage", msg => {
            const user = getCurrentUser(io.id);
            if (user) {
                socket.to(user.room).emit("message", createMessage(user.username, msg));
            }
        });

        // When client disconnects
        io.on("disconnect", () => {
            const user = userLeave(io.id);
            if (user) {
                socket.to(user.room).emit("message", createMessage(appName, `${user.username} has left the chat!`));
                // Emit list of users and room in the chat room
                socket.to(user.room).emit("roomUsers", { room: user.room, users: getRoomUsers(user.room) });
            }
        });
    });
}

module.exports = socketApp;

