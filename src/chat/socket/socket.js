import { uploadToS3 } from "../../s3.upload.js";
import { Server } from "socket.io";
import { stringifyWithBigInt } from "../../bigintJson.js";
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '../../jwt.config.js';
import { ChatRepository } from "../repository/chat.repository.js";

const prisma = new PrismaClient();

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }
      const user = verifyJwt(token);
      socket.user = user; // userId, role 등 저장
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 채팅방 join
    socket.on("join", async (chatroomId) => {
      socket.join(chatroomId);
      console.log(`User ${socket.user.userId} joined chatroom ${chatroomId}`);

      try {
        console.log(socket.user)
        const accountId = BigInt(socket.user.accountId);
        
        // 해당 채팅방의 모든 미확인 메시지에 대해 읽음 처리
        const unreadMessages = await prisma.chatMessage.findMany({
          where: {
            chatroomId: BigInt(chatroomId),
            NOT: {
              chatMessageReads: {
                some: {
                  accountId: BigInt(accountId),
                  read: true,
                },
              },
            },
          },
        });

        // 읽음 상태 기록 업데이트
        await Promise.all(
          unreadMessages.map((msg) =>
            ChatRepository.markAsRead(accountId, msg.id)
          )
        );

        // 필요하면 클라이언트에 읽음 처리 완료 알림 전송
        socket.emit("read messages success", { chatroomId });

      } catch (err) {
        console.error("Error marking messages as read:", err);
        socket.emit("error", { message: "읽음 처리 중 오류가 발생했습니다." });
      }
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