-- 기존 FK 삭제
ALTER TABLE `chatrooms` DROP FOREIGN KEY `chatrooms_consumer_id_fkey`;
ALTER TABLE `chatrooms` DROP FOREIGN KEY `chatrooms_request_id_fkey`;

-- request_id → commission_id
ALTER TABLE `chatrooms`
CHANGE COLUMN `request_id` `commission_id` BIGINT NOT NULL;

-- consumer_id → user_id
ALTER TABLE `chatrooms`
CHANGE COLUMN `consumer_id` `user_id` BIGINT NOT NULL;

-- hidden_consumer → hidden_user
ALTER TABLE `chatrooms`
CHANGE COLUMN `hidden_consumer` `hidden_user` BOOLEAN NOT NULL DEFAULT false;

-- FK 재생성 (이름 변경된 컬럼에 맞게)
ALTER TABLE `chatrooms`
ADD CONSTRAINT `chatrooms_user_id_fkey`
FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `chatrooms`
ADD CONSTRAINT `chatrooms_commission_id_fkey`
FOREIGN KEY (`commission_id`) REFERENCES `requests`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;