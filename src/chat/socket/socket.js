import path from 'path';
import fs from 'fs';
import { Server } from "socket.io";
import { stringifyWithBigInt } from "../../bigintJson.js";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL;
const uploadDir = path.join(process.cwd(), 'uploads', 'messages');

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

        // 1. ChatMessage 저장
        const savedMessage = await prisma.chatMessage.create({
          data: {
            chatroomId: BigInt(chatroomId),
            senderId: BigInt(senderId),
            content,
          },
        });

        let imageUrl = null;

        // 2. 이미지 처리
        if (imageBase64) {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const buffer = Buffer.from(imageBase64, 'base64');
          const filename = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
          const filepath = path.join(uploadDir, filename);
          fs.writeFileSync(filepath, buffer);

          imageUrl = `${BASE_URL}/uploads/messages/${filename}`;

          // 3. Image 테이블에 저장
          await prisma.image.create({
            data: {
              target: 'chat_messages',
              targetId: savedMessage.id,
              imageUrl,
            },
          });
        }

        // 4. 클라이언트에 emit (BigInt 직렬화 대응)
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
        socket.emit("error", { message: "메시지 처리 중 오류가 발생했습니다." });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}