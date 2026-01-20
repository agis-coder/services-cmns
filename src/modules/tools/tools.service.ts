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
            .replace(/[^\d+,;/\-\(\)]/gi, '') // ✅ GIỮ DẤU +
            .replace(/\s+/g, '');
    }

    private isForeignPhone(raw: string): boolean {
        const s = raw.replace(/\s+/g, '');

        // +84 là VIỆT NAM → KHÔNG phải foreign
        if (s.startsWith('+84')) return false;

        // +xx khác → foreign
        if (s.startsWith('+')) return true;

        // 82-, 886- ... → foreign
        if (/^\d{2,3}-/.test(s) && !s.startsWith('84')) return true;

        return false;
    }



    normalizeSinglePhone(input: string): string | null {
        if (!input) return null;

        let num = input.trim().replace(/[^\d+]/g, '');
        if (!num) return null;

        // ❌ rác ngắn
        if (/^\d{1,8}$/.test(num)) return null;

        // ✅ 10 số bắt đầu bằng 1 → coi là VN thiếu 0
        if (/^1\d{9}$/.test(num)) {
            num = '0' + num;
        }

        // 9 số mobile VN
        if (/^[35789]\d{8}$/.test(num)) {
            num = '0' + num;
        }

        // +84
        if (num.startsWith('+')) {
            if (num.startsWith('+84')) {
                let digits = '0' + num.slice(3).replace(/\D/g, '');

                if (digits.length === 11) {
                    const p4 = digits.slice(0, 4);
                    const p3 = digits.slice(0, 3);

                    if (PREFIX_MAP[p4]) digits = PREFIX_MAP[p4] + digits.slice(4);
                    else if (PREFIX_MAP[p3]) digits = PREFIX_MAP[p3] + digits.slice(3);
                }

                return digits.length === 10 ? digits : null;
            }
            return null; // foreign
        }

        // bắt đầu bằng 0
        if (num.startsWith('0')) {
            let digits = num.replace(/\D/g, '');

            if (digits.length === 11) {
                const p4 = digits.slice(0, 4);
                const p3 = digits.slice(0, 3);

                if (PREFIX_MAP[p4]) digits = PREFIX_MAP[p4] + digits.slice(4);
                else if (PREFIX_MAP[p3]) digits = PREFIX_MAP[p3] + digits.slice(3);
                else return null;
            }

            return digits.length === 10 ? digits : null;
        }

        return null;
    }


    private extractPhonesSmart(raw: string): string[] {
        const digits = raw.replace(/\D/g, '');
        const mobiles: string[] = [];

        let i = 0;
        while (i < digits.length) {
            if (digits[i] === '0' && digits[i + 1] === '1') {
                const chunk11 = digits.slice(i, i + 11);
                const n = this.normalizeSinglePhone(chunk11);
                if (n) {
                    mobiles.push(n);
                    i += 11;
                    continue;
                }
            }

            // 10 số di động
            if (digits[i] === '0') {
                const chunk10 = digits.slice(i, i + 10);
                const n = this.normalizeSinglePhone(chunk10);
                if (n) {
                    mobiles.push(n);
                    i += 10;
                    continue;
                }
            }

            // số bàn / nội hạt → bỏ
            i++;
        }

        // 🔒 CHỐT NGHIỆP VỤ:
        // nếu chỉ có 1 số di động → trả đúng số đó
        if (mobiles.length === 1) {
            return mobiles;
        }

        // nếu >1 → coi là nhiều di động thật
        return [...new Set(mobiles)];
    }

    normalizePhoneEdit(cell: any): string {
        let raw = this.getCellText(cell);
        if (!raw) return '';
        if (this.isForeignPhone(raw)) {
            return raw.trim();
        }
        // 1️⃣ GIỮ NGUYÊN newline để tách
        const lines = raw
            .split(/\r?\n/)        // 👈 TÁCH THEO DÒNG TRƯỚC
            .map(l => l.trim())
            .filter(Boolean);

        const result: string[] = [];

        for (const line of lines) {
            // 2️⃣ SAU KHI TÁCH DÒNG → mới clean
            const cleaned = this.cleanPhoneNoise(line);

            // 3️⃣ tách tiếp theo delimiter
            const parts = cleaned.split(/[,;/\-|]/);

            for (const p of parts) {
                const phone = this.normalizeSinglePhone(p);
                if (phone) {
                    result.push(phone);
                    continue;
                }

                // 4️⃣ fallback cho chuỗi dính liền thật
                if (p.replace(/\D/g, '').length >= 10) {
                    const many = this.extractPhonesSmart(p);
                    result.push(...many);
                }
            }
        }

        return [...new Set(result)].join('-');
    }


    async processSingleExcelWithAkabiz(
        file: Express.Multer.File,
    ): Promise<Buffer> {
        if (!file?.buffer) {
            throw new BadRequestException('File không hợp lệ');
        }

        const zip = new JSZip();

        const { buffer, phones } = await this.processExcel(file.buffer);

        const phoneName = file.originalname.replace(/\.xlsx?$/i, '_PHONE.xlsx');
        zip.file(phoneName, buffer);

        const akabizBuffer = await this.buildAkabizExcel(phones);
        const akabizName = file.originalname.replace(/\.xlsx?$/i, '_AKABIZ.xlsx');
        zip.file(akabizName, akabizBuffer);

        return zip.generateAsync({ type: 'nodebuffer' });
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
            edited.split(/[-,;/|]/).map(p => p.trim()).filter(p => /^\d{10}$/.test(p)).forEach(p => {
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
            const { buffer, phones } = await this.processExcel(file.buffer);
            const phoneName = file.originalname.replace(/\.xlsx?$/i, '_PHONE.xlsx');
            zip.file(phoneName, buffer);
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
        const headers = ['Fullname', 'Uid', 'Mobile', 'Email', 'Info1', 'Info2', 'Info3', 'Info4', 'Info5',];
        sheet.addRow(headers);
        sheet.getColumn(3).numFmt = '@';
        for (const phone of phones) {
            sheet.addRow(['', '', phone, '', '', '', '', '', '']);
        }
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

}
