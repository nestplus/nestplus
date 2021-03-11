import { MigrationInterface, QueryRunner } from 'typeorm';

export class FirstMigration1614556900305 implements MigrationInterface {
    name = 'FirstMigration1614556900305';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "CREATE TABLE `content_comments` (`id` varchar(36) NOT NULL, `body` longtext NOT NULL COMMENT '评论内容', `createdAt` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `nsleft` int NOT NULL DEFAULT '1', `nsright` int NOT NULL DEFAULT '2', `postId` varchar(36) NOT NULL, `parentId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
        );
        await queryRunner.query(
            "CREATE TABLE `content_posts` (`id` varchar(36) NOT NULL, `title` varchar(255) NOT NULL COMMENT '文章标题', `body` longtext NOT NULL COMMENT '文章内容', `summary` varchar(255) NULL COMMENT '文章描述', `keywords` text NULL COMMENT '关键字', `isPublished` tinyint NOT NULL COMMENT '是否发布' DEFAULT 0, `publishedAt` varchar(255) NULL COMMENT '发布时间', `createdAt` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB",
        );
        await queryRunner.query(
            "CREATE TABLE `content_categories` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL COMMENT '分类名称', `order` int NOT NULL COMMENT '分类排序' DEFAULT '0', `nsleft` int NOT NULL DEFAULT '1', `nsright` int NOT NULL DEFAULT '2', `parentId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
        );
        await queryRunner.query(
            'CREATE TABLE `content_posts_categories_content_categories` (`contentPostsId` varchar(36) NOT NULL, `contentCategoriesId` varchar(36) NOT NULL, INDEX `IDX_9172320639056856745c6bc21a` (`contentPostsId`), INDEX `IDX_82926fe45def38f6a53838347a` (`contentCategoriesId`), PRIMARY KEY (`contentPostsId`, `contentCategoriesId`)) ENGINE=InnoDB',
        );
        await queryRunner.query(
            'ALTER TABLE `content_comments` ADD CONSTRAINT `FK_5e1c3747a0031f305e94493361f` FOREIGN KEY (`postId`) REFERENCES `content_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
        );
        await queryRunner.query(
            'ALTER TABLE `content_comments` ADD CONSTRAINT `FK_982a849f676860e5d6beb607f20` FOREIGN KEY (`parentId`) REFERENCES `content_comments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE `content_categories` ADD CONSTRAINT `FK_a03aea27707893300382b6f18ae` FOREIGN KEY (`parentId`) REFERENCES `content_categories`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE `content_posts_categories_content_categories` ADD CONSTRAINT `FK_9172320639056856745c6bc21aa` FOREIGN KEY (`contentPostsId`) REFERENCES `content_posts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE `content_posts_categories_content_categories` ADD CONSTRAINT `FK_82926fe45def38f6a53838347a2` FOREIGN KEY (`contentCategoriesId`) REFERENCES `content_categories`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `content_posts_categories_content_categories` DROP FOREIGN KEY `FK_82926fe45def38f6a53838347a2`',
        );
        await queryRunner.query(
            'ALTER TABLE `content_posts_categories_content_categories` DROP FOREIGN KEY `FK_9172320639056856745c6bc21aa`',
        );
        await queryRunner.query(
            'ALTER TABLE `content_categories` DROP FOREIGN KEY `FK_a03aea27707893300382b6f18ae`',
        );
        await queryRunner.query(
            'ALTER TABLE `content_comments` DROP FOREIGN KEY `FK_982a849f676860e5d6beb607f20`',
        );
        await queryRunner.query(
            'ALTER TABLE `content_comments` DROP FOREIGN KEY `FK_5e1c3747a0031f305e94493361f`',
        );
        await queryRunner.query(
            'DROP INDEX `IDX_82926fe45def38f6a53838347a` ON `content_posts_categories_content_categories`',
        );
        await queryRunner.query(
            'DROP INDEX `IDX_9172320639056856745c6bc21a` ON `content_posts_categories_content_categories`',
        );
        await queryRunner.query(
            'DROP TABLE `content_posts_categories_content_categories`',
        );
        await queryRunner.query('DROP TABLE `content_categories`');
        await queryRunner.query('DROP TABLE `content_posts`');
        await queryRunner.query('DROP TABLE `content_comments`');
    }
}
