import { MigrationInterface, QueryRunner } from "typeorm";

export class Dev1767607449417 implements MigrationInterface {
    name = 'Dev1767607449417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`emails\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`matKhau\` varchar(255) NOT NULL, \`phoneId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3cbf51004f0706ac67ff8c22db\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`phones\` (\`id\` int NOT NULL, \`sdt\` varchar(20) NOT NULL, \`nhaMang\` varchar(50) NOT NULL, \`soTien\` decimal(15,2) NOT NULL DEFAULT '0.00', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_9a41e07c3703166f4310ac0f28\` (\`sdt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`emails\` ADD CONSTRAINT \`FK_c50cb70fa22d5eca4b63b7a35a7\` FOREIGN KEY (\`phoneId\`) REFERENCES \`phones\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`emails\` DROP FOREIGN KEY \`FK_c50cb70fa22d5eca4b63b7a35a7\``);
        await queryRunner.query(`DROP INDEX \`IDX_9a41e07c3703166f4310ac0f28\` ON \`phones\``);
        await queryRunner.query(`DROP TABLE \`phones\``);
        await queryRunner.query(`DROP INDEX \`IDX_3cbf51004f0706ac67ff8c22db\` ON \`emails\``);
        await queryRunner.query(`DROP TABLE \`emails\``);
    }

}
