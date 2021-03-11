import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoTables1614894377728 implements MigrationInterface {
    name = 'AutoTables1614894377728';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE `content_posts` ADD `type` enum ('html', 'markdown') NOT NULL DEFAULT 'markdown'",
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `content_posts` DROP COLUMN `type`',
        );
    }
}
