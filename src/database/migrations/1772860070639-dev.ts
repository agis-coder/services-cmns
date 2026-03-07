import { MigrationInterface, QueryRunner } from "typeorm";

export class Dev1772860070639 implements MigrationInterface {
    name = 'Dev1772860070639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_b5ba9f8fc7751511f8d9530801\` ON \`projects\` (\`project_name\`, \`investor\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_cc514a0fcc085b035c22416208\` ON \`project_details\` (\`project_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_a633c12fc5edc94737c90dcca6\` ON \`project_transfers\` (\`customerId\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_49e493dc2eddce0132c0237d68\` ON \`project_transfers\` (\`project_detail_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_49e493dc2eddce0132c0237d68\` ON \`project_transfers\``);
        await queryRunner.query(`DROP INDEX \`IDX_a633c12fc5edc94737c90dcca6\` ON \`project_transfers\``);
        await queryRunner.query(`DROP INDEX \`IDX_cc514a0fcc085b035c22416208\` ON \`project_details\``);
        await queryRunner.query(`DROP INDEX \`IDX_b5ba9f8fc7751511f8d9530801\` ON \`projects\``);
    }

}
