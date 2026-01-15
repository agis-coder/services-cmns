import { MigrationInterface, QueryRunner } from "typeorm";

export class Dev1768444962471 implements MigrationInterface {
    name = 'Dev1768444962471'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`zalos\` ADD \`password\` varchar(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`zalos\` DROP COLUMN \`password\``);
    }

}
