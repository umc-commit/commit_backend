-- AlterTable
ALTER TABLE `chatrooms` MODIFY `hidden_artist` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `hidden_consumer` BOOLEAN NOT NULL DEFAULT false;
