import { MigrationInterface, QueryRunner } from "typeorm";

export class Dev1768444369062 implements MigrationInterface {
    name = 'Dev1768444369062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`zalos\` ADD \`biKhoa\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`zalos\` DROP COLUMN \`biKhoa\``);
    }

}
