import { MigrationInterface, QueryRunner } from "typeorm";

export class Dev1768208567550 implements MigrationInterface {
    name = 'Dev1768208567550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`facebooks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tenFacebook\` varchar(255) NOT NULL, \`uid\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`trangThai\` enum ('ACTIVE', 'LOCK', 'DIE') NOT NULL DEFAULT 'ACTIVE', \`chayTool\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deviceId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`emails\` ADD \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`facebooks\` ADD CONSTRAINT \`FK_0e920c79346d45610b061c10c6e\` FOREIGN KEY (\`deviceId\`) REFERENCES \`devices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`facebooks\` DROP FOREIGN KEY \`FK_0e920c79346d45610b061c10c6e\``);
        await queryRunner.query(`ALTER TABLE \`emails\` DROP COLUMN \`password\``);
        await queryRunner.query(`DROP TABLE \`facebooks\``);
    }

}
