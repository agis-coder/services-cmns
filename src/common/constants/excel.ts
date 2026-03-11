import { BadRequestException } from "@nestjs/common";

export const requireHeader = (row: Record<string, any>, headers: string | string[], rowIndex: number,) => {
    let value: any;
    if (Array.isArray(headers)) {
        for (const h of headers) {
            const v = getValueStrict(row, [h]);
            if (v !== undefined && v !== null && v.toString().trim() !== '') {
                value = v;
                break;
            }
        }
    } else {
        value = getValueStrict(row, [headers]);
    }
    if (value === undefined || value === null || value.toString().trim() === '') {
        const name = Array.isArray(headers) ? headers.join(' / ') : headers;
        throw new BadRequestException(`Row ${rowIndex}: thiếu header "${name}"`);
    }
    return value;
}

export const getValueStrict = (row: Record<string, any>, expectedHeaders: string[],): any => {
    if (!row || typeof row !== 'object') return null;
    const normalizedExpected = new Set(
        expectedHeaders.map(h => normalizeHeader(h)),
    );
    for (const [key, value] of Object.entries(row)) {
        if (!key) continue;
        const normalizedKey = normalizeHeader(key);
        if (normalizedExpected.has(normalizedKey)) {
            return value ?? null;
        }
    }
    return null;
}

export const normalizeHeader = (input: string): string => {
    return input.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

export const excelDateToJSDate = (value: any): Date | null => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        return date;
    }
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }
    return null;
}

export const validateHeaders = (rows: Record<string, any>[], requiredHeaders: string[][]) => {
    if (!rows.length) {
        throw new Error('❌ File Excel không có dữ liệu');
    }
    const fileHeaders = Object.keys(rows[0]).map(h => h.toString().trim().toLowerCase(),);
    for (const headerGroup of requiredHeaders) {
        const normalized = headerGroup.map(h => h.toString().trim().toLowerCase(),);
        const exists = normalized.some(h => fileHeaders.includes(h));
        if (!exists) {
            throw new Error(`❌ Thiếu HEADER bắt buộc: [${headerGroup.join(' / ')}]`);
        }
    }
}

export const parseMoney = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && !isNaN(value)) {
        return Math.round(value);
    }
    if (typeof value !== 'string') return null;
    let raw = value.toLowerCase().trim();
    if (!raw) return null;
    raw = raw.replace(/₫|đ|vnđ|vnd/gi, '').replace(/\s+/g, '');
    if (raw.includes('tỷ') || raw.includes('ti')) {
        const num = parseFloat(raw.replace('tỷ', '').replace('ti', '').replace(',', '.'),);
        return isNaN(num) ? null : Math.round(num * 1_000_000_000);
    }
    if (raw.includes('triệu')) {
        const num = parseFloat(raw.replace('triệu', '').replace(',', '.'));
        return isNaN(num) ? null : Math.round(num * 1_000_000);
    }
    raw = raw.replace(/[.,](?=\d{3})/g, '');
    const result = Number(raw);
    return isNaN(result) ? null : Math.round(result);
}

export const requirePhone = (row: Record<string, any>, headers: string[], rowIndex: number,): string => {
    const raw = getValueStrict(row, headers);
    if (raw === undefined || raw === null) {
        throw new BadRequestException(`Row ${rowIndex}: thiếu giá trị PHONE`,);
    }
    const cleaned = String(raw).normalize('NFC').replace(/\u00A0/g, ' ').trim();
    const phones = cleaned.split(/[-/,;|]/g).map(p => p.replace(/\D/g, '')).filter(p => p.length >= 9 && p.length <= 12);
    if (phones.length === 0) {
        return '';
    }
    const result = phones.join('|');
    return result;
}
