import { MigrationInterface, QueryRunner } from "typeorm";

export class Dev1768452407960 implements MigrationInterface {
    name = 'Dev1768452407960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`zalos\` ADD \`chanNhanTinNguoiLa\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`zalos\` DROP COLUMN \`chanNhanTinNguoiLa\``);
    }

}
