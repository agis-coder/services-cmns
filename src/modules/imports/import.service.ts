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
function requirePhone(
    row: Record<string, any>,
    headers: string[],
    rowIndex: number,
) {
    const raw = getValueStrict(row, headers);

    if (raw === undefined || raw === null) {
        throw new BadRequestException(
            `Row ${rowIndex}: thiếu giá trị PHONE`
        );
    }

    const phone = String(raw)
        .normalize('NFC')
        .replace(/\u00A0/g, ' ') // NBSP
        .replace(/\s+/g, '')
        .trim();

    if (!phone) {
        throw new BadRequestException(
            `Row ${rowIndex}: PHONE không hợp lệ`
        );
    }

    return phone;
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
                qr.manager.create(ImportFile, { file_name: file.originalname }),
            );

            const customerMap = new Map<string, Customer>();
            const detailMap = new Map<string, ProjectDetail>();

            const normalize = (v: string) => (v ?? '').trim().toLowerCase();

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const rowIndex = i + 2;

                const customerName = requireHeader(row, HEADER_MAP.customer_name, rowIndex);
                const phone = requirePhone(row, HEADER_MAP.phone_number, rowIndex);

                // 🔑 phân biệt người theo: SĐT + TÊN
                const customerKey = `${normalize(phone)}|${normalize(customerName)}`;
                const source =
                    getValueStrict(row, HEADER_MAP.soucre) || 'IMPORT';
                const projectName =
                    getValueStrict(row, HEADER_MAP.project_name) || 'DỰ ÁN CHƯA PHÂN LOẠI';

                const unitCode =
                    getValueStrict(row, HEADER_MAP.unit_code) || `AUTO-${rowIndex}`;

                const productType =
                    getValueStrict(row, HEADER_MAP.product_type) || 'UNKNOWN';

                const contractPriceRaw =
                    row[HEADER_MAP.contract_price as unknown as string];

                const contractPrice = contractPriceRaw
                    ? parseMoney(contractPriceRaw)
                    : 0;

                if (contractPrice < 0) {
                    throw new BadRequestException(
                        `Row ${rowIndex}: contract_price không hợp lệ`,
                    );
                }

                // ================= PROJECT =================
                let project = await qr.manager.findOne(Project, {
                    where: { project_name: projectName },
                });

                if (!project) {
                    project = await qr.manager.save(
                        qr.manager.create(Project, {
                            project_name: projectName,
                            investor: '',
                        }),
                    );
                }

                // ================= PROJECT DETAIL =================
                const detailKey = `${project.id}|${unitCode}`;

                let detail: ProjectDetail | undefined;

                if (!detail) {
                    detail = await qr.manager.findOne(ProjectDetail, {
                        where: {
                            project: { id: project.id },
                            unit_code: unitCode,
                        },
                    }) ?? undefined;

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
                                source,                    // 🔥 BẮT BUỘC
                                day_trading: getValueStrict(row, HEADER_MAP.day_trading) || null,
                            }),
                        );
                    }

                    detailMap.set(detailKey, detail);
                }

                // ================= CUSTOMER =================
                let customer: Customer | undefined;

                if (!customer) {
                    customer = await qr.manager.findOne(Customer, {
                        where: {
                            phone_number: phone,
                            customer_name: customerName,
                        },
                    }) ?? undefined;

                    if (!customer) {
                        customer = await qr.manager.save(
                            qr.manager.create(Customer, {
                                customer_name: customerName,
                                phone_number: phone,
                                cccd: getValueStrict(row, HEADER_MAP.cccd),
                                email: getValueStrict(row, HEADER_MAP.email),
                                address: getValueStrict(row, HEADER_MAP.address),
                                permanent_address: getValueStrict(row, HEADER_MAP.permanent_address),
                            }),
                        );
                    }

                    customerMap.set(customerKey, customer);
                }

                // ================= NEW SALE / TRANSFER =================
                if (type === 'new_sale') {
                    const existed = await qr.manager.findOne(ProjectNewSale, {
                        where: {
                            project_detail: { id: detail.id },
                            customer: { id: customer.id },
                            import_file: { id: importFile.id },
                        },
                    });

                    if (!existed) {
                        await qr.manager.save(
                            qr.manager.create(ProjectNewSale, {
                                project_detail: detail,
                                customer,
                                import_file: importFile,
                            }),
                        );
                    }
                } else {
                    const existed = await qr.manager.findOne(ProjectTransfer, {
                        where: {
                            project_detail: { id: detail.id },
                            customer: { id: customer.id },
                            import_file: { id: importFile.id },
                        },
                    });

                    if (!existed) {
                        await qr.manager.save(
                            qr.manager.create(ProjectTransfer, {
                                project_detail: detail,
                                customer,
                                import_file: importFile,
                            }),
                        );
                    }
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
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const projectDetailTable =
                this.dataSource.getMetadata(ProjectDetail).tableName;

            const newSaleTable =
                this.dataSource.getMetadata(ProjectNewSale).tableName;

            const transferTable =
                this.dataSource.getMetadata(ProjectTransfer).tableName;

            const customerTable =
                this.dataSource.getMetadata(Customer).tableName;

            const importFileTable =
                this.dataSource.getMetadata(ImportFile).tableName;

            const detailRows = await qr.query(
                `
            SELECT DISTINCT pd.id
            FROM ${projectDetailTable} pd
            LEFT JOIN ${newSaleTable} ns
                ON ns.project_detail_id = pd.id
            LEFT JOIN ${transferTable} tf
                ON tf.project_detail_id = pd.id
            WHERE ns.importFileId = ?
               OR tf.importFileId = ?
            `,
                [id, id],
            );

            const projectDetailIds = detailRows.map((r: any) => r.id);

            await qr.query(
                `
            DELETE FROM ${newSaleTable}
            WHERE importFileId = ?
            `,
                [id],
            );

            await qr.query(
                `
            DELETE FROM ${transferTable}
            WHERE importFileId = ?
            `,
                [id],
            );

            await qr.query(
                `
            DELETE FROM ${customerTable}
            WHERE importFileId = ?
            `,
                [id],
            );

            if (projectDetailIds.length > 0) {
                await qr.manager.delete(ProjectDetail, projectDetailIds);
            }

            await qr.query(
                `
            DELETE FROM ${importFileTable}
            WHERE id = ?
            `,
                [id],
            );

            await qr.commitTransaction();
            return {
                message:
                    'Đã xóa toàn bộ dữ liệu của file import (customer, new sale, transfer, project detail)',
            };
        } catch (e) {
            await qr.rollbackTransaction();
            throw e;
        } finally {
            await qr.release();
        }
    }



}
