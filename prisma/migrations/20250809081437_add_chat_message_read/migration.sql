-- CreateTable
CREATE TABLE `chat_message_reads` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `messageId` BIGINT NOT NULL,
    `accountId` BIGINT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chat_message_reads` ADD CONSTRAINT `chat_message_reads_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `chat_messages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_message_reads` ADD CONSTRAINT `chat_message_reads_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
