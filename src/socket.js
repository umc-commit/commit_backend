import { Server } from "socket.io";

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    socket.on("chat message", (msg) => {
      console.log("Message received:", msg);
      io.emit("chat message", msg);
    });
  });

  return io;
}