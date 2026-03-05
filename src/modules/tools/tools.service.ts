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
            // 1️⃣ bỏ format hiển thị trước (., space)
            .replace(/[.\s]+/g, '')

            // 2️⃣ newline là delimiter
            .replace(/[\r\n]+/g, '|')

            // 3️⃣ chữ nằm giữa 2 số → delimiter
            .replace(/(\d)[^\d+,;/\-\(\)|]+(\d)/gi, '$1|$2')

            // 4️⃣ giữ ký tự hợp lệ
            .replace(/[^\d+,;/\-\(\)|]/gi, '');
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

        // 🆕 84xxxxxxxxx (không có +) → số VN
        if (/^84\d{9,10}$/.test(num)) {
            num = '0' + num.slice(2);
        }

        // ✅ CASE: +0xxxxxxxxx → VN, bỏ +
        if (/^\+0\d{9}$/.test(num)) {
            return num.slice(1);
        }

        // ✅ CASE: +<digits> → bỏ dấu + (KHÔNG coi là foreign ở đây)
        if (/^\+\d{10,}$/.test(num)) {
            return num.slice(1);
        }

        // ❌ rác ngắn
        if (/^\d{1,8}$/.test(num)) return null;

        // ❌ 0 + 8 số → bỏ
        if (/^0\d{8}$/.test(num)) return null;

        // 🆕 0 + 9 số → thiếu 0
        if (/^0[35789]\d{7}$/.test(num)) {
            num = '0' + num.slice(1);
        }

        // 10 số bắt đầu bằng 1
        if (/^1\d{9}$/.test(num)) {
            num = '0' + num;
        }

        // 9 số mobile
        if (/^[35789]\d{8}$/.test(num)) {
            num = '0' + num;
        }

        // +84 (giữ logic cũ)
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
            return null; // foreign khác
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

        // 🆕 FIX CUỐI: nếu còn bắt đầu bằng 84 → đổi thành 0
        if (/^84\d{9,10}$/.test(num)) {
            const converted = '0' + num.slice(2);
            return converted.length === 10 ? converted : null;
        }


        return null;

    }

    private extractPhonesByRegex(raw: string): string[] {
        if (!raw) return [];

        const text = raw.replace(/\s+/g, '');

        const matches = text.match(
            /(\+84|84|0)([35789]\d{8,9})/g
        ) || [];

        const out: string[] = [];

        for (const m of matches) {
            const fixed = this.normalizeSinglePhone(m);
            if (fixed) out.push(fixed);
        }

        return [...new Set(out)];
    }


    private extractPhonesSmart(raw: string): string[] {
        const digits = raw.replace(/\D/g, '');
        const mobiles: string[] = [];
        if (digits.length === 19) {
            const fixed = '0' + digits; // thành 20
            const p1 = fixed.slice(0, 10);
            const p2 = fixed.slice(10, 20);

            const n1 = this.normalizeSinglePhone(p1);
            const n2 = this.normalizeSinglePhone(p2);

            if (n1) mobiles.push(n1);
            if (n2) mobiles.push(n2);

            return [...new Set(mobiles)];
        }
        const left10 = digits.slice(0, 10);
        const right10 = digits.slice(10);

        if (left10 === right10) {
            const one = this.normalizeSinglePhone(left10);
            return one ? [one] : [];
        }

        if (digits.length === 20) {
            const out: string[] = [];

            // 🆕 0️⃣ CASE TRÙNG GƯƠNG: 10 + 10 giống nhau
            const left10 = digits.slice(0, 10);
            const right10 = digits.slice(10, 20);

            if (left10 === right10) {
                const one = this.normalizeSinglePhone(left10);
                return one ? [one] : [];
            }

            // 1️⃣ thử 10 – 10 (2 số khác nhau)
            const n10a = this.normalizeSinglePhone(left10);
            const n10b = this.normalizeSinglePhone(right10);

            if (n10a || n10b) {
                if (n10a) out.push(n10a);
                if (n10b) out.push(n10b);
                return [...new Set(out)];
            }

            // 2️⃣ fallback 11 – 9
            const left11 = digits.slice(0, 11);
            const right9 = digits.slice(11, 20);

            const n11 = this.normalizeSinglePhone(left11);

            let n9: string | null = null;
            if (/^[35789]\d{8}$/.test(right9)) {
                n9 = '0' + right9;
            }

            if (n11) out.push(n11);
            if (n9) {
                const fixed = this.normalizeSinglePhone(n9);
                if (fixed) out.push(fixed);
            }

            return [...new Set(out)];
        }

        if (digits.length === 21) {
            const fixed = '0' + digits; // 22
            const p1 = fixed.slice(0, 11);
            const p2 = fixed.slice(11, 22);

            const n1 = this.normalizeSinglePhone(p1);
            const n2 = this.normalizeSinglePhone(p2);

            if (n1) mobiles.push(n1);
            if (n2) mobiles.push(n2);

            return [...new Set(mobiles)];
        }
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
            i++;
        }

        if (mobiles.length === 1) {
            return mobiles;
        }
        return [...new Set(mobiles)];
    }

    normalizePhoneEdit(cell: any): string {
        let raw = this.getCellText(cell);
        if (!raw) return '';
        const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const result: string[] = [];
        for (const line of lines) {
            const cleaned = this.cleanPhoneNoise(line);
            const parts = cleaned.split(/[,;/\-|]/);
            for (const p of parts) {
                const rawPart = p.trim();
                if (!rawPart) continue;

                // 1️⃣ +<digits> nhưng KHÔNG phải +84 → foreign → bỏ +
                if (/^\+\d+$/.test(rawPart) && !rawPart.startsWith('+84')) {
                    result.push(rawPart.slice(1));
                    continue;
                }

                // 2️⃣ normalize VN (+84, 0xxx, 9xxx…)
                const phone = this.normalizeSinglePhone(rawPart);
                if (phone) {
                    result.push(phone);
                    continue;
                }

                // 3️⃣ fallback regex VN (có chữ chen)
                const byRegex = this.extractPhonesByRegex(rawPart);
                if (byRegex.length) {
                    result.push(...byRegex);
                    continue;
                }

                // 4️⃣ fallback dính liền số
                const digits = rawPart.replace(/\D/g, '');
                if (digits.length >= 10) {
                    const many = this.extractPhonesSmart(rawPart);
                    result.push(...many);
                }

            }
        }
        return [...new Set(result)].map(p => {
            if (/^[35789]\d{8}$/.test(p)) {
                return '0' + p;
            }
            if (/^84\d{9}$/.test(p)) {
                return '0' + p.slice(2);
            }
            return p;
        }).filter(p => /^\d{10}$/.test(p)).join('-');
    }

    async processSingleExcelWithAkabiz(file: Express.Multer.File,): Promise<Buffer> {
        if (!file?.buffer) {
            throw new BadRequestException('File không hợp lệ');
        }
        const zip = new JSZip();
        const { buffer, phones } = await this.processExcel(file.buffer);
        const phoneName = file.originalname.replace(/\.xlsx?$/i, '.xlsx');
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
        let editCol: number | null = null;
        sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => {
            const t = this.getCellText(cell.value).toUpperCase();
            if (t === 'ĐIỆN THOẠI' || t === 'SỐ ĐIỆN THOẠI' || t === 'SDT' || t === 'SĐT' || t === 'PHONE') {
                phoneCol = col;
            }
            if (t === 'PHONE EDIT') {
                editCol = col;
            }
        });

        if (!phoneCol) {
            throw new BadRequestException('Không tìm thấy cột ĐIỆN THOẠI');
        }
        if (!editCol) {
            editCol = sheet.columnCount + 1;
            sheet.getRow(1).getCell(editCol).value = 'PHONE EDIT';
            sheet.getColumn(editCol).numFmt = '@';
        }
        const phoneSheet = workbook.addWorksheet('PHONE');
        phoneSheet.getColumn(1).numFmt = '@';
        phoneSheet.addRow(['PHONE']);
        const vnSet = new Set<string>();
        const phoneList: string[] = [];
        sheet.eachRow((row, i) => {
            if (i === 1) return;
            const cell = row.getCell(phoneCol!).value;
            const edited = this.normalizePhoneEdit(cell);
            row.getCell(editCol!).value = edited;
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
