import { uploadToS3 } from "../../s3.upload.js";
import { Server } from "socket.io";
import { stringifyWithBigInt } from "../../bigintJson.js";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 채팅방 join
    socket.on("join", (chatroomId) => {
      socket.join(chatroomId);
      console.log(`User ${socket.id} joined chatroom ${chatroomId}`);
    });

    // 메시지 수신
    socket.on("chat message", async ({ chatroomId, senderId, content, imageBase64 }) => {
      try {
        if (content && content.length > 255) {
          socket.emit("error", { message: "메시지 길이는 255자를 초과할 수 없습니다." });
          return;
        }

        let imageUrl = null;

        // 이미지 처리
        if (imageBase64) {
          const buffer = Buffer.from(imageBase64, 'base64');
          imageUrl = await uploadToS3({
            buffer,
            folderName: "messages",
            extension: "png"
          });
        }

        // 메시지 저장
        const savedMessage = await prisma.chatMessage.create({
          data: {
            chatroomId: BigInt(chatroomId),
            senderId: BigInt(senderId),
            content,
          },
        });

        // 이미지 테이블 저장
        if (imageUrl) {
          await prisma.image.create({
            data: {
              target: 'chat_messages',
              targetId: savedMessage.id,
              imageUrl,
            },
          });
        }

        // 클라이언트에 전송
        const safeMessage = JSON.parse(stringifyWithBigInt({
          id: savedMessage.id,
          chatroomId: savedMessage.chatroomId,
          senderId: savedMessage.senderId,
          content: savedMessage.content,
          imageUrl,
          createdAt: savedMessage.createdAt,
        }));

        io.to(chatroomId).emit("chat message", safeMessage);

      } catch (err) {
        console.error("Socket message error:", err);
        socket.emit("error", {
          message: "메시지 처리 중 오류가 발생했습니다.",
          details: err.message,
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("User disconnected:", socket.id, reason);
    });
  });

  return io;
}