import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PREFIX_MAP } from '../../common/enums/excel-field.map';
import JSZip from 'jszip';

@Injectable()
export class ToolsService {

    getCellText(cell: any): string {
        if (cell == null) return '';
        if (typeof cell === 'number') {
            return this.excelNumberToString(cell);
        }
        if (typeof cell === 'string') return cell;

        if (typeof cell === 'object') {
            if ('text' in cell) return this.excelNumberToString(cell.text);
            if ('richText' in cell)
                return cell.richText.map((t: any) => t.text).join('');
        }
        return '';
    }


    private excelNumberToString(val: any): string {
        if (typeof val === 'number') {
            return val.toLocaleString('fullwide', { useGrouping: false });
        }
        return String(val);
    }

    // private splitLongDigits(raw: string): string[] {
    //     const digits = raw.replace(/\D/g, '');

    //     if (digits.length < 10) return [];
    //     const out: string[] = [];
    //     if (digits.length >= 19) {
    //         const right = digits.slice(-10);
    //         const leftRemain = digits.slice(0, digits.length - 10);
    //         if (leftRemain.length === 9) {
    //             out.push('0' + leftRemain);
    //         }
    //         else if (leftRemain.length >= 10) {
    //             for (let i = 0; i <= leftRemain.length - 10; i += 10) {
    //                 out.push(leftRemain.slice(i, i + 10));
    //             }
    //         }
    //         out.push(right);
    //         return out;
    //     }
    //     if (digits.length > 10 && digits.length % 10 === 0) {
    //         for (let i = 0; i < digits.length; i += 10) {
    //             out.push(digits.slice(i, i + 10));
    //         }
    //         return out;
    //     }
    //     return [];
    // }
    private splitLongDigits(raw: string): string[] {
        const digits = raw.replace(/\D/g, '');
        const out: string[] = [];

        if (digits.length < 10) return out;

        for (let i = 0; i <= digits.length - 10; i++) {
            const slice = digits.slice(i, i + 10);

            // chỉ mobile VN hợp lệ
            if (/^0[35789]\d{8}$/.test(slice)) {
                out.push(slice);
            }
        }

        return out;
    }

    private cleanPhoneNoise(input: string): string {
        return input
            .replace(/[^\d,;/\-\(\)]/gi, '')
            .replace(/\s+/g, '');
    }

    normalizeSinglePhone(input: string): string | null {
        if (!input) return null;

        let num = input.trim().replace(/[\s\-\.\(\)]/g, '');
        if (!num) return null;
        if (/^\d{1,8}$/.test(num)) return null;
        if (/^\d{9}$/.test(num) && !/^[35789]\d{8}$/.test(num)) {
            return null;
        }
        if (/^[35789]\d{8}$/.test(num)) {
            num = '0' + num;
        }
        if (num.startsWith('+')) {
            if (num.startsWith('+84')) {
                let vn = '0' + num.slice(3);
                if (vn.length === 11) {
                    const p4 = vn.slice(0, 4);
                    const p3 = vn.slice(0, 3);
                    if (PREFIX_MAP[p4]) vn = PREFIX_MAP[p4] + vn.slice(4);
                    else if (PREFIX_MAP[p3]) vn = PREFIX_MAP[p3] + vn.slice(3);
                }
                return vn.length === 10 ? vn : null;
            } else {
                return num.slice(1);
            }
        }
        if (num.startsWith('0')) {
            let digits = num.replace(/\D/g, '');
            if (digits.length === 10) {
                const p4 = digits.slice(0, 4);
                const p3 = digits.slice(0, 3);
                if (PREFIX_MAP[p4]) digits = PREFIX_MAP[p4] + digits.slice(4);
                else if (PREFIX_MAP[p3]) digits = PREFIX_MAP[p3] + digits.slice(3);
            }
            if (digits.length === 11) {
                const p4 = digits.slice(0, 4);
                const p3 = digits.slice(0, 3);

                if (PREFIX_MAP[p4]) {
                    digits = PREFIX_MAP[p4] + digits.slice(4);
                } else if (PREFIX_MAP[p3]) {
                    digits = PREFIX_MAP[p3] + digits.slice(3);
                } else {
                    return null;
                }
            }

            return digits.length === 10 ? digits : null;
        }
        return num;
    }

    normalizePhoneEdit(cell: any): string {
        let raw = this.getCellText(cell);
        if (!raw) return '';
        raw = this.cleanPhoneNoise(raw);
        if (/^0\d{9}-0\d{9}$/.test(raw)) {
            return raw;
        }
        const tokens: string[] = [];
        raw.replace(/\(([^)]+)\)/g, (_, p1) => {
            tokens.push(p1);
            return '';
        });
        raw.replace(/\([^)]+\)/g, '').split(/[,;/\-\|]/).forEach(t => tokens.push(t));
        const result: string[] = [];
        for (const part of tokens) {
            const p = part.trim();
            if (!p) continue;
            const longParts = this.splitLongDigits(p);
            if (longParts.length) {
                for (const lp of longParts) {
                    const n = this.normalizeSinglePhone(lp);
                    if (n) result.push(n);
                }
                continue;
            }
            const n = this.normalizeSinglePhone(p);
            if (n) result.push(n);
        }
        return result.join('-');
    }

    extractPhonesVN(cell: any, set: Set<string>): string[] {
        const raw = this.getCellText(cell);
        if (!raw) return [];
        const parts = raw.split(/[,;/]/);
        const out: string[] = [];
        for (const part of parts) {
            const phone = this.normalizeSinglePhone(part);
            if (!phone) continue;
            if (phone.length === 10 && phone.startsWith('0') && !phone.startsWith('048') && !phone.startsWith('049') && !set.has(phone)) {
                set.add(phone);
                out.push(phone);
            }
        }
        return out;
    }

    async processExcel(fileBuffer: unknown): Promise<{ buffer: Buffer; phones: string[] }> {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer as any);
        const sheet = workbook.worksheets[0];
        if (!sheet) throw new BadRequestException('File Excel trống');
        let phoneCol: number | null = null;
        sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => {
            const t = this.getCellText(cell.value).toUpperCase();
            if (t === 'ĐIỆN THOẠI' || t === 'SỐ ĐIỆN THOẠI' || t === 'SDT' || t === 'SĐT' || t === 'PHONE') {
                phoneCol = col;
            }
        });
        if (!phoneCol) throw new BadRequestException('Không tìm thấy cột ĐIỆN THOẠI');
        const editCol = phoneCol + 1;
        sheet.getRow(1).getCell(editCol).value = 'PHONE EDIT';
        sheet.getColumn(editCol).numFmt = '@';
        const phoneSheet = workbook.addWorksheet('PHONE');
        phoneSheet.getColumn(1).numFmt = '@';
        phoneSheet.addRow(['PHONE']);
        const vnSet = new Set<string>();
        const phoneList: string[] = [];

        sheet.eachRow((row, i) => {
            if (i === 1) return;

            const cell = row.getCell(phoneCol!).value;
            const edited = this.normalizePhoneEdit(cell);

            row.getCell(editCol).value = edited;

            edited
                .split(/[-,;/|]/)
                .map(p => p.trim())
                .filter(p => /^\d{10}$/.test(p))
                .forEach(p => {
                    if (!vnSet.has(p)) {
                        vnSet.add(p);
                        phoneSheet.addRow([p]);
                        phoneList.push(p);
                    }
                });
        });

        return {
            buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
            phones: phoneList,
        };
    }

    async processMultipleExcel(files: Express.Multer.File[]): Promise<Buffer> {
        if (!files || files.length === 0) {
            throw new BadRequestException('Không có file nào được upload');
        }

        const zip = new JSZip();

        for (const file of files) {
            if (!file.buffer) continue;

            // 👉 xử lý file gốc
            const { buffer, phones } = await this.processExcel(file.buffer);

            // 👉 file _PHONE
            const phoneName = file.originalname.replace(/\.xlsx?$/i, '_PHONE.xlsx');
            zip.file(phoneName, buffer);

            // 👉 file _AKABIZ (file RIÊNG)
            const akabizBuffer = await this.buildAkabizExcel(phones);
            const akabizName = file.originalname.replace(
                /\.xlsx?$/i,
                '_AKABIZ.xlsx',
            );

            zip.file(akabizName, akabizBuffer);
        }

        return await zip.generateAsync({ type: 'nodebuffer' });
    }


    private async buildAkabizExcel(phones: string[]): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Sheet1');

        const headers = [
            'Fullname',
            'Uid',
            'Mobile',
            'Email',
            'Info1',
            'Info2',
            'Info3',
            'Info4',
            'Info5',
        ];

        sheet.addRow(headers);
        sheet.getColumn(3).numFmt = '@';

        for (const phone of phones) {
            sheet.addRow([
                '',
                '',
                phone,
                '',
                '',
                '',
                '',
                '',
                '',
            ]);
        }

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

}
