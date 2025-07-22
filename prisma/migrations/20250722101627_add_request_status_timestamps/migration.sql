-- AlterTable
ALTER TABLE `requests` ADD COLUMN `approved_at` DATETIME(3) NULL,
    ADD COLUMN `completed_at` DATETIME(3) NULL,
    ADD COLUMN `in_progress_at` DATETIME(3) NULL,
    ADD COLUMN `submitted_at` DATETIME(3) NULL;
