-- DropForeignKey
ALTER TABLE `postcategory` DROP FOREIGN KEY `PostCategory_postId_fkey`;

-- AddForeignKey
ALTER TABLE `PostCategory` ADD CONSTRAINT `PostCategory_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
