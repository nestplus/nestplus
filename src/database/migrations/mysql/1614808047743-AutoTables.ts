import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoTables1614808047743 implements MigrationInterface {
    name = 'AutoTables1614808047743';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE `content_posts` ADD `deletedAt` datetime(6) NULL COMMENT '软删除'",
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE `content_posts` DROP COLUMN `deletedAt`',
        );
    }
}
