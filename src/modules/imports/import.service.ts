import * as XLSX from 'xlsx';
import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ImportFile } from '../../database/entity/import-file.entity';
import { Project } from '../../database/entity/project.entity';
import { ProjectDetail } from '../../database/entity/project-detail.entity';
import { Customer } from '../../database/entity/customer.entity';
import { ProjectNewSale } from '../../database/entity/project-new-sale.entity';
import { ProjectTransfer } from '../../database/entity/project-transfer.entity';

import { excelDateToJSDate, getValueStrict } from '../../common/constants/excel';
import { HEADER_MAP } from '../../common/enums/excel-field.map';
import { ProjectCategory } from '../../common/enums/project-category';

/** Bắt buộc header tồn tại */
function requireHeader(
    row: Record<string, any>,
    headers: string | string[],
    rowIndex: number,
) {
    let value: any;

    if (Array.isArray(headers)) {
        for (const h of headers) {
            const v = getValueStrict(row, [h]); // 👈 FIX Ở ĐÂY
            if (v !== undefined && v !== null && v.toString().trim() !== '') {
                value = v;
                break;
            }
        }
    } else {
        value = getValueStrict(row, [headers]); // 👈 VÀ Ở ĐÂY
    }

    if (value === undefined || value === null || value.toString().trim() === '') {
        const name = Array.isArray(headers) ? headers.join(' / ') : headers;
        throw new BadRequestException(`Row ${rowIndex}: thiếu header "${name}"`);
    }

    return value;
}


/** Chuyển giá tiền về number */
function parseMoney(value: any): number {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    const str = String(value).replace(/[^\d]/g, '');
    return Number(str) || 0;
}
function getPhoneAlways(
    row: Record<string, any>,
    headers: string[],
) {
    const raw = getValueStrict(row, headers);

    if (raw === undefined || raw === null) {
        return null; // cho phép null
    }

    const phone = String(raw)
        .normalize('NFC')
        .replace(/\u00A0/g, ' ')
        .trim();

    return phone || null;
}


@Injectable()
export class ImportService {
    constructor(private readonly dataSource: DataSource) { }

    importNewSaleExcel(file: Express.Multer.File) {
        return this.importExcel(file, 'new_sale');
    }

    importTransferExcel(file: Express.Multer.File) {
        return this.importExcel(file, 'transfer');
    }

    private async importExcel(
        file: Express.Multer.File,
        type: 'new_sale' | 'transfer',
    ) {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const importFile = await qr.manager.save(
                qr.manager.create(ImportFile, { file_name: file.originalname })
            );

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const rowIndex = i + 2;

                const projectName = requireHeader(row, HEADER_MAP.project_name, rowIndex);
                const phone = getPhoneAlways(
                    row,
                    HEADER_MAP.phone_number,
                );

                const unitCode = requireHeader(row, HEADER_MAP.unit_code, rowIndex);
                const source = requireHeader(row, HEADER_MAP.soucre, rowIndex);
                const productType = requireHeader(row, HEADER_MAP.product_type, rowIndex);
                const customerName = requireHeader(row, HEADER_MAP.customer_name, rowIndex);

                // contract_price: KHÔNG bắt buộc
                const contractPriceRaw =
                    row[HEADER_MAP.contract_price as unknown as string];
                const contractPrice = contractPriceRaw
                    ? parseMoney(contractPriceRaw)
                    : 0;

                if (contractPrice < 0) {
                    throw new BadRequestException(
                        `Row ${rowIndex}: contract_price (giá gốc hợp đồng) không hợp lệ`
                    );
                }


                const sourceDetail = getValueStrict(row, HEADER_MAP.source_details) || 'BDS';
                const projectCategory: ProjectCategory = Object.values(ProjectCategory).includes(sourceDetail as ProjectCategory)
                    ? (sourceDetail as ProjectCategory)
                    : ProjectCategory.BDS;



                // Find or create Project
                let project = await qr.manager.findOne(Project, { where: { project_name: projectName } });
                if (!project) {
                    project = await qr.manager.save(
                        qr.manager.create(Project, {
                            project_name: projectName,
                            project_category: projectCategory,
                            investor: '',
                        }),
                    );
                }

                // Find or create ProjectDetail
                let detail = await qr.manager.findOne(ProjectDetail, {
                    where: { project: { id: project.id }, unit_code: unitCode },
                    relations: ['project'],
                });

                if (!detail) {
                    detail = await qr.manager.save(
                        qr.manager.create(ProjectDetail, {
                            project,
                            unit_code: unitCode,
                            product_type: productType,
                            subdivision: getValueStrict(row, HEADER_MAP.subdivision) || '',
                            floor: getValueStrict(row, HEADER_MAP.floor) || '',
                            land_area: parseMoney(getValueStrict(row, HEADER_MAP.land_area)) || 0,
                            usable_area: parseMoney(getValueStrict(row, HEADER_MAP.usable_area)) || 0,
                            door_direction: getValueStrict(row, HEADER_MAP.door_direction) || '',
                            view: getValueStrict(row, HEADER_MAP.view) || '',
                            contract_price: contractPrice,
                            day_trading: getValueStrict(row, HEADER_MAP.day_trading) || null,
                            source,
                            source_details: sourceDetail,
                        }),
                    );
                }

                // Find or create Customer
                console.log('phone', phone)
                let customer = await qr.manager.findOne(Customer, { where: { phone_number: phone } });
                if (!customer) {
                    customer = await qr.manager.save(
                        qr.manager.create(Customer, {
                            customer_name: customerName,
                            phone_number: phone,
                            cccd: getValueStrict(row, HEADER_MAP.cccd),
                            email: getValueStrict(row, HEADER_MAP.email),
                            address: getValueStrict(row, HEADER_MAP.address),
                            permanent_address: getValueStrict(row, HEADER_MAP.permanent_address),
                            living_area: getValueStrict(row, HEADER_MAP.living_area),
                            nationality: getValueStrict(row, HEADER_MAP.nationality),
                            marital_status: getValueStrict(row, HEADER_MAP.marital_status),
                            interest: getValueStrict(row, HEADER_MAP.interest),
                            business_field: getValueStrict(row, HEADER_MAP.business_field),
                            zalo_status: getValueStrict(row, HEADER_MAP.zalo_status),
                            facebook: getValueStrict(row, HEADER_MAP.facebook),
                            import_file: importFile,
                        }),
                    );
                }

                // Save ProjectNewSale or ProjectTransfer
                if (type === 'new_sale') {
                    await qr.manager.save(
                        qr.manager.create(ProjectNewSale, {
                            project_detail: detail,
                            customer,
                            first_interaction_new: excelDateToJSDate(getValueStrict(row, HEADER_MAP.first_interaction_new)),
                            closest_interaction_new: excelDateToJSDate(getValueStrict(row, HEADER_MAP.closest_interaction_new)),
                            project_advertised: getValueStrict(row, HEADER_MAP.project_advertised),
                            result_new: getValueStrict(row, HEADER_MAP.result_new),
                            note_expected_new: getValueStrict(row, HEADER_MAP.note_expected_new),
                            import_file: importFile,
                        }),
                    );
                } else {
                    await qr.manager.save(
                        qr.manager.create(ProjectTransfer, {
                            project_detail: detail,
                            customer,
                            first_interaction_transfer: excelDateToJSDate(getValueStrict(row, HEADER_MAP.first_interaction_transfer)),
                            closest_interaction_transfer: excelDateToJSDate(getValueStrict(row, HEADER_MAP.closest_interaction_transfer)),
                            result_transfer: getValueStrict(row, HEADER_MAP.result_transfer),
                            expected_selling_price_transfer: parseMoney(getValueStrict(row, HEADER_MAP.expected_selling_price_transfer)),
                            expected_rental_price_transfer: parseMoney(getValueStrict(row, HEADER_MAP.expected_rental_price_transfer)),
                            note_expected_transfer: getValueStrict(row, HEADER_MAP.note_expected_transfer),
                            import_file: importFile,
                        }),
                    );
                }
            }

            await qr.commitTransaction();
            return { message: 'Import OK' };
        } catch (e) {
            await qr.rollbackTransaction();
            throw e;
        } finally {
            await qr.release();
        }
    }

    async deleteImportFile(id: string) {
        await this.dataSource.getRepository(ImportFile).delete(id);
        return { message: 'Đã xóa toàn bộ dữ liệu của file import' };
    }
}
