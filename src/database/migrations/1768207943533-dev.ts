import { MigrationInterface, QueryRunner } from "typeorm";

export class Dev1768207943533 implements MigrationInterface {
    name = 'Dev1768207943533'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`devices\` DROP COLUMN \`tenThietBi\``);
        await queryRunner.query(`ALTER TABLE \`devices\` ADD \`tenThietBi\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`devices\` DROP COLUMN \`tenThietBi\``);
        await queryRunner.query(`ALTER TABLE \`devices\` ADD \`tenThietBi\` varchar(100) NULL`);
    }

}
