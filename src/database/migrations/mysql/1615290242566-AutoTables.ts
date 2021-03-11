import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoTables1615290242566 implements MigrationInterface {
    name = 'AutoTables1615290242566';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "CREATE TABLE `user_captchas` (`id` varchar(36) NOT NULL, `code` varchar(255) NOT NULL COMMENT '验证码', `action` enum ('registration', 'reset-password') NOT NULL COMMENT '验证操作类型', `type` enum ('phone', 'email') NOT NULL COMMENT '验证码类型', `value` varchar(255) NOT NULL COMMENT '手机号/邮箱地址', `created_at` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB",
        );
        await queryRunner.query(
            'ALTER TABLE `content_posts` DROP FOREIGN KEY `FK_8fcc2d81ced7b8ade2bbd151b1a`',
        );
        await queryRunner.query(
            'ALTER TABLE `content_posts` CHANGE `authorId` `authorId` varchar(36) NULL',
        );
        await queryRunner.query(
            'ALTER TABLE `content_posts` ADD CONSTRAINT `FK_8fcc2d81ced7b8ade2bbd151b1a` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `content_posts` DROP FOREIGN KEY `FK_8fcc2d81ced7b8ade2bbd151b1a`',
        );
        await queryRunner.query(
            'ALTER TABLE `content_posts` CHANGE `authorId` `authorId` varchar(36) NOT NULL',
        );
        await queryRunner.query(
            'ALTER TABLE `content_posts` ADD CONSTRAINT `FK_8fcc2d81ced7b8ade2bbd151b1a` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
        );
        await queryRunner.query('DROP TABLE `user_captchas`');
    }
}
