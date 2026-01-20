import { MigrationInterface, QueryRunner } from "typeorm";

export class Dev1768623800423 implements MigrationInterface {
    name = 'Dev1768623800423'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`relatives_customer\` (\`id\` varchar(36) NOT NULL, \`name_of_relative\` varchar(255) NOT NULL, \`phone_number_relative\` varchar(255) NOT NULL, \`relationship\` varchar(255) NULL, \`date_of_birth_of_a_relative\` varchar(255) NULL, \`note_relative\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`outside_sales\` (\`id\` varchar(36) NOT NULL, \`dealer_name\` varchar(255) NOT NULL, \`outside_sales_name\` varchar(255) NOT NULL, \`phone_sale\` varchar(255) NOT NULL, \`email_sale\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`import_files\` (\`id\` varchar(36) NOT NULL, \`file_name\` varchar(255) NOT NULL, \`status\` enum ('imported', 'temp_deleted') NOT NULL DEFAULT 'imported', \`imported_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_17e7f933220f7b932bedd1b0b8\` (\`file_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`projects\` (\`id\` varchar(36) NOT NULL, \`project_name\` varchar(255) NOT NULL, \`project_category\` enum ('BDS', 'GUI_TIET_KIEM', 'XE_HOI', 'CHUNG_KHOAN', 'VANG', 'TRUONG_QUOC_TE', 'BAC_SI', 'QUAN_CHUC', 'DINH_CU', 'TMĐT', 'CEO', 'BAO_HIEM', 'GOLF', 'KS_5_SAO', 'HIEP_HOI') NOT NULL DEFAULT 'BDS', \`investor\` varchar(255) NULL, \`location\` varchar(255) NULL, \`legal\` varchar(255) NULL, \`description\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`project_details\` (\`id\` varchar(36) NOT NULL, \`unit_code\` varchar(255) NOT NULL, \`product_type\` varchar(255) NOT NULL, \`subdivision\` varchar(255) NOT NULL, \`floor\` varchar(255) NOT NULL, \`land_area\` decimal(18,2) NOT NULL, \`usable_area\` decimal(18,2) NOT NULL, \`door_direction\` varchar(255) NOT NULL, \`view\` varchar(255) NOT NULL, \`contract_price\` bigint NOT NULL, \`day_trading\` varchar(255) NULL, \`source\` varchar(255) NOT NULL, \`source_details\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`project_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`project_new_sales\` (\`id\` varchar(36) NOT NULL, \`first_interaction_new\` date NULL, \`closest_interaction_new\` date NULL, \`project_advertised\` varchar(255) NULL, \`result_new\` varchar(255) NULL, \`note_expected_new\` varchar(255) NULL, \`project_detail_id\` varchar(36) NOT NULL, \`customerId\` varchar(36) NOT NULL, \`outsideSaleId\` varchar(36) NULL, \`employeeId\` varchar(36) NULL, \`importFileId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`employees\` (\`id\` varchar(36) NOT NULL, \`code_otp\` varchar(255) NOT NULL, \`empl_id\` varchar(255) NOT NULL, \`empl_name\` varchar(255) NOT NULL, \`empl_phone\` varchar(255) NOT NULL, \`empl_email\` varchar(255) NOT NULL, \`time_care\` varchar(255) NULL, UNIQUE INDEX \`IDX_b129cb47cfd2101ce90349ca1c\` (\`code_otp\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`project_transfers\` (\`id\` varchar(36) NOT NULL, \`first_interaction_transfer\` date NULL, \`closest_interaction_transfer\` date NULL, \`result_transfer\` varchar(255) NOT NULL, \`expected_selling_price_transfer\` bigint NOT NULL, \`expected_rental_price_transfer\` bigint NOT NULL, \`note_expected_transfer\` varchar(255) NULL, \`project_detail_id\` varchar(36) NOT NULL, \`customerId\` varchar(36) NOT NULL, \`outsideSaleId\` varchar(36) NULL, \`employeeId\` varchar(36) NULL, \`importFileId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`customers\` (\`id\` varchar(36) NOT NULL, \`customer_name\` varchar(255) NOT NULL, \`phone_number\` varchar(255) NOT NULL, \`img_customer\` varchar(255) NULL, \`date_of_birth\` date NULL, \`cccd\` varchar(255) NULL, \`email\` varchar(255) NULL, \`gender\` varchar(255) NULL, \`address\` varchar(255) NULL, \`permanent_address\` varchar(255) NULL, \`living_area\` varchar(255) NULL, \`the_product_type\` varchar(255) NULL, \`nationality\` varchar(255) NULL, \`marital_status\` varchar(255) NULL, \`interest\` varchar(255) NULL, \`total_assets\` bigint NULL, \`business_field\` varchar(255) NULL, \`zalo_status\` varchar(255) NULL, \`facebook\` varchar(255) NULL, \`importFileId\` varchar(36) NULL, INDEX \`IDX_a1dded0c9e77a3e62a09d20ed8\` (\`customer_name\`), INDEX \`IDX_16a1516d545978de10572498b6\` (\`cccd\`), INDEX \`IDX_46c5f573cb24bdc6e81b8ef250\` (\`phone_number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`emails\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`verified\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deviceId\` int NULL, UNIQUE INDEX \`IDX_3cbf51004f0706ac67ff8c22db\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`zalos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tenZalo\` varchar(100) NOT NULL, \`trangThai\` enum ('ACTIVE', 'DIE', 'LOCK') NOT NULL DEFAULT 'ACTIVE', \`sdtDangKy\` varchar(20) NOT NULL, \`password\` varchar(100) NOT NULL, \`chayAkaabiz\` tinyint NOT NULL DEFAULT 0, \`biKhoa\` tinyint NOT NULL DEFAULT 0, \`chanNhanTinNguoiLa\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deviceId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`facebooks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tenFacebook\` varchar(255) NOT NULL, \`uid\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`trangThai\` enum ('ACTIVE', 'LOCK', 'DIE') NOT NULL DEFAULT 'ACTIVE', \`chayTool\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deviceId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`devices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tenThietBi\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`phones\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sdt\` varchar(20) NOT NULL, \`nhaMang\` varchar(50) NOT NULL, \`soTien\` decimal(15,2) NOT NULL DEFAULT '0.00', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deviceId\` int NULL, UNIQUE INDEX \`IDX_9a41e07c3703166f4310ac0f28\` (\`sdt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`customer_relatives\` (\`customer_id\` varchar(36) NOT NULL, \`relative_id\` varchar(36) NOT NULL, INDEX \`IDX_fe8bd978beb592591ccc309938\` (\`customer_id\`), INDEX \`IDX_0d05ad598d7dea1da7c6accb08\` (\`relative_id\`), PRIMARY KEY (\`customer_id\`, \`relative_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`project_details\` ADD CONSTRAINT \`FK_cc514a0fcc085b035c22416208c\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_new_sales\` ADD CONSTRAINT \`FK_0c2242a25a93222e86e6b872c12\` FOREIGN KEY (\`project_detail_id\`) REFERENCES \`project_details\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_new_sales\` ADD CONSTRAINT \`FK_97e74c43cd1556473e5848df1e0\` FOREIGN KEY (\`customerId\`) REFERENCES \`customers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_new_sales\` ADD CONSTRAINT \`FK_4aeee9e6111b28df19a018425b4\` FOREIGN KEY (\`outsideSaleId\`) REFERENCES \`outside_sales\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_new_sales\` ADD CONSTRAINT \`FK_0bec6ac040362ae90b1c7a0667e\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employees\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_new_sales\` ADD CONSTRAINT \`FK_8b85a6be9824421103551e8b19f\` FOREIGN KEY (\`importFileId\`) REFERENCES \`import_files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_transfers\` ADD CONSTRAINT \`FK_49e493dc2eddce0132c0237d686\` FOREIGN KEY (\`project_detail_id\`) REFERENCES \`project_details\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_transfers\` ADD CONSTRAINT \`FK_a633c12fc5edc94737c90dcca64\` FOREIGN KEY (\`customerId\`) REFERENCES \`customers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_transfers\` ADD CONSTRAINT \`FK_3cb447e4e30baa503e7da1adb59\` FOREIGN KEY (\`outsideSaleId\`) REFERENCES \`outside_sales\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_transfers\` ADD CONSTRAINT \`FK_7171e87cbe8f4e8c4fc22f63ac1\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employees\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_transfers\` ADD CONSTRAINT \`FK_488567b673086b589d0ec37df82\` FOREIGN KEY (\`importFileId\`) REFERENCES \`import_files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`customers\` ADD CONSTRAINT \`FK_2c6fc2e873df0a072f1cef26bac\` FOREIGN KEY (\`importFileId\`) REFERENCES \`import_files\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`emails\` ADD CONSTRAINT \`FK_3da14c31f5d62ba4daa67c932a6\` FOREIGN KEY (\`deviceId\`) REFERENCES \`devices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`zalos\` ADD CONSTRAINT \`FK_0e03033679e7e683727c3a0d6a8\` FOREIGN KEY (\`deviceId\`) REFERENCES \`devices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`facebooks\` ADD CONSTRAINT \`FK_0e920c79346d45610b061c10c6e\` FOREIGN KEY (\`deviceId\`) REFERENCES \`devices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`phones\` ADD CONSTRAINT \`FK_8e405fc31603ae2b253cbaa1154\` FOREIGN KEY (\`deviceId\`) REFERENCES \`devices\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`customer_relatives\` ADD CONSTRAINT \`FK_fe8bd978beb592591ccc3099389\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`customer_relatives\` ADD CONSTRAINT \`FK_0d05ad598d7dea1da7c6accb08c\` FOREIGN KEY (\`relative_id\`) REFERENCES \`relatives_customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`customer_relatives\` DROP FOREIGN KEY \`FK_0d05ad598d7dea1da7c6accb08c\``);
        await queryRunner.query(`ALTER TABLE \`customer_relatives\` DROP FOREIGN KEY \`FK_fe8bd978beb592591ccc3099389\``);
        await queryRunner.query(`ALTER TABLE \`phones\` DROP FOREIGN KEY \`FK_8e405fc31603ae2b253cbaa1154\``);
        await queryRunner.query(`ALTER TABLE \`facebooks\` DROP FOREIGN KEY \`FK_0e920c79346d45610b061c10c6e\``);
        await queryRunner.query(`ALTER TABLE \`zalos\` DROP FOREIGN KEY \`FK_0e03033679e7e683727c3a0d6a8\``);
        await queryRunner.query(`ALTER TABLE \`emails\` DROP FOREIGN KEY \`FK_3da14c31f5d62ba4daa67c932a6\``);
        await queryRunner.query(`ALTER TABLE \`customers\` DROP FOREIGN KEY \`FK_2c6fc2e873df0a072f1cef26bac\``);
        await queryRunner.query(`ALTER TABLE \`project_transfers\` DROP FOREIGN KEY \`FK_488567b673086b589d0ec37df82\``);
        await queryRunner.query(`ALTER TABLE \`project_transfers\` DROP FOREIGN KEY \`FK_7171e87cbe8f4e8c4fc22f63ac1\``);
        await queryRunner.query(`ALTER TABLE \`project_transfers\` DROP FOREIGN KEY \`FK_3cb447e4e30baa503e7da1adb59\``);
        await queryRunner.query(`ALTER TABLE \`project_transfers\` DROP FOREIGN KEY \`FK_a633c12fc5edc94737c90dcca64\``);
        await queryRunner.query(`ALTER TABLE \`project_transfers\` DROP FOREIGN KEY \`FK_49e493dc2eddce0132c0237d686\``);
        await queryRunner.query(`ALTER TABLE \`project_new_sales\` DROP FOREIGN KEY \`FK_8b85a6be9824421103551e8b19f\``);
        await queryRunner.query(`ALTER TABLE \`project_new_sales\` DROP FOREIGN KEY \`FK_0bec6ac040362ae90b1c7a0667e\``);
        await queryRunner.query(`ALTER TABLE \`project_new_sales\` DROP FOREIGN KEY \`FK_4aeee9e6111b28df19a018425b4\``);
        await queryRunner.query(`ALTER TABLE \`project_new_sales\` DROP FOREIGN KEY \`FK_97e74c43cd1556473e5848df1e0\``);
        await queryRunner.query(`ALTER TABLE \`project_new_sales\` DROP FOREIGN KEY \`FK_0c2242a25a93222e86e6b872c12\``);
        await queryRunner.query(`ALTER TABLE \`project_details\` DROP FOREIGN KEY \`FK_cc514a0fcc085b035c22416208c\``);
        await queryRunner.query(`DROP INDEX \`IDX_0d05ad598d7dea1da7c6accb08\` ON \`customer_relatives\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe8bd978beb592591ccc309938\` ON \`customer_relatives\``);
        await queryRunner.query(`DROP TABLE \`customer_relatives\``);
        await queryRunner.query(`DROP INDEX \`IDX_9a41e07c3703166f4310ac0f28\` ON \`phones\``);
        await queryRunner.query(`DROP TABLE \`phones\``);
        await queryRunner.query(`DROP TABLE \`devices\``);
        await queryRunner.query(`DROP TABLE \`facebooks\``);
        await queryRunner.query(`DROP TABLE \`zalos\``);
        await queryRunner.query(`DROP INDEX \`IDX_3cbf51004f0706ac67ff8c22db\` ON \`emails\``);
        await queryRunner.query(`DROP TABLE \`emails\``);
        await queryRunner.query(`DROP INDEX \`IDX_46c5f573cb24bdc6e81b8ef250\` ON \`customers\``);
        await queryRunner.query(`DROP INDEX \`IDX_16a1516d545978de10572498b6\` ON \`customers\``);
        await queryRunner.query(`DROP INDEX \`IDX_a1dded0c9e77a3e62a09d20ed8\` ON \`customers\``);
        await queryRunner.query(`DROP TABLE \`customers\``);
        await queryRunner.query(`DROP TABLE \`project_transfers\``);
        await queryRunner.query(`DROP INDEX \`IDX_b129cb47cfd2101ce90349ca1c\` ON \`employees\``);
        await queryRunner.query(`DROP TABLE \`employees\``);
        await queryRunner.query(`DROP TABLE \`project_new_sales\``);
        await queryRunner.query(`DROP TABLE \`project_details\``);
        await queryRunner.query(`DROP TABLE \`projects\``);
        await queryRunner.query(`DROP INDEX \`IDX_17e7f933220f7b932bedd1b0b8\` ON \`import_files\``);
        await queryRunner.query(`DROP TABLE \`import_files\``);
        await queryRunner.query(`DROP TABLE \`outside_sales\``);
        await queryRunner.query(`DROP TABLE \`relatives_customer\``);
    }

}
