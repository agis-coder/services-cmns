import { MigrationInterface, QueryRunner } from "typeorm";

export class Dev1768206957039 implements MigrationInterface {
    name = 'Dev1768206957039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`emails\` DROP FOREIGN KEY \`FK_c50cb70fa22d5eca4b63b7a35a7\``);
        await queryRunner.query(`CREATE TABLE \`zalos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tenZalo\` varchar(100) NOT NULL, \`trangThai\` enum ('ACTIVE', 'DIE', 'LOCK') NOT NULL DEFAULT 'ACTIVE', \`sdtDangKy\` varchar(20) NOT NULL, \`chayAkaabiz\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deviceId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`devices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tenThietBi\` varchar(100) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`emails\` DROP COLUMN \`matKhau\``);
        await queryRunner.query(`ALTER TABLE \`emails\` DROP COLUMN \`phoneId\``);
        await queryRunner.query(`ALTER TABLE \`emails\` ADD \`verified\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`emails\` ADD \`deviceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`phones\` ADD \`deviceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`phones\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`phones\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`phones\` ADD \`id\` int NOT NULL PRIMARY KEY AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`emails\` ADD CONSTRAINT \`FK_3da14c31f5d62ba4daa67c932a6\` FOREIGN KEY (\`deviceId\`) REFERENCES \`devices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`zalos\` ADD CONSTRAINT \`FK_0e03033679e7e683727c3a0d6a8\` FOREIGN KEY (\`deviceId\`) REFERENCES \`devices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`phones\` ADD CONSTRAINT \`FK_8e405fc31603ae2b253cbaa1154\` FOREIGN KEY (\`deviceId\`) REFERENCES \`devices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`phones\` DROP FOREIGN KEY \`FK_8e405fc31603ae2b253cbaa1154\``);
        await queryRunner.query(`ALTER TABLE \`zalos\` DROP FOREIGN KEY \`FK_0e03033679e7e683727c3a0d6a8\``);
        await queryRunner.query(`ALTER TABLE \`emails\` DROP FOREIGN KEY \`FK_3da14c31f5d62ba4daa67c932a6\``);
        await queryRunner.query(`ALTER TABLE \`phones\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`phones\` ADD \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`phones\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`phones\` DROP COLUMN \`deviceId\``);
        await queryRunner.query(`ALTER TABLE \`emails\` DROP COLUMN \`deviceId\``);
        await queryRunner.query(`ALTER TABLE \`emails\` DROP COLUMN \`verified\``);
        await queryRunner.query(`ALTER TABLE \`emails\` ADD \`phoneId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`emails\` ADD \`matKhau\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`devices\``);
        await queryRunner.query(`DROP TABLE \`zalos\``);
        await queryRunner.query(`ALTER TABLE \`emails\` ADD CONSTRAINT \`FK_c50cb70fa22d5eca4b63b7a35a7\` FOREIGN KEY (\`phoneId\`) REFERENCES \`phones\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
