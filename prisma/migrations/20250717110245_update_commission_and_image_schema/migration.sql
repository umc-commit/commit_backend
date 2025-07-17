-- AlterTable
ALTER TABLE `commissions` DROP COLUMN `price`,
    ADD COLUMN `content` TEXT NOT NULL,
    ADD COLUMN `min_price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `images` ADD COLUMN `order_index` INTEGER NULL;
