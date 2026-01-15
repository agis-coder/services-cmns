
export function normalizeHeader(input: string): string {
    return input
        .toString()
        .normalize('NFD')                 // bỏ dấu
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')        // bỏ ký tự đặc biệt & khoảng trắng
        .trim();
}

export function getValueStrict(
    row: Record<string, any>,
    expectedHeaders: string[],
): any {
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

export function excelDateToJSDate(value: any): Date | null {
    if (value === null || value === undefined || value === '') return null;

    // Excel serial number
    if (typeof value === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        return date;
    }

    // Chuỗi ngày hợp lệ
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }

    return null;
}

export function validateHeaders(
    rows: Record<string, any>[],
    requiredHeaders: string[][],
) {
    if (!rows.length) {
        throw new Error('❌ File Excel không có dữ liệu');
    }

    const fileHeaders = Object.keys(rows[0]).map(h =>
        h.toString().trim().toLowerCase(),
    );

    for (const headerGroup of requiredHeaders) {
        const normalized = headerGroup.map(h =>
            h.toString().trim().toLowerCase(),
        );

        const exists = normalized.some(h => fileHeaders.includes(h));
        if (!exists) {
            throw new Error(
                `❌ Thiếu HEADER bắt buộc: [${headerGroup.join(' / ')}]`,
            );
        }
    }
}

export function parseMoney(value: any): number | null {
    if (value === null || value === undefined) return null;

    // Nếu đã là number (Excel chuẩn)
    if (typeof value === 'number' && !isNaN(value)) {
        return Math.round(value);
    }

    if (typeof value !== 'string') return null;

    let raw = value.toLowerCase().trim();

    if (!raw) return null;

    // Xóa ký tự tiền tệ & khoảng trắng
    raw = raw
        .replace(/₫|đ|vnđ|vnd/gi, '')
        .replace(/\s+/g, '');

    // TỶ
    if (raw.includes('tỷ') || raw.includes('ti')) {
        const num = parseFloat(
            raw.replace('tỷ', '').replace('ti', '').replace(',', '.'),
        );
        return isNaN(num) ? null : Math.round(num * 1_000_000_000);
    }

    // TRIỆU
    if (raw.includes('triệu')) {
        const num = parseFloat(raw.replace('triệu', '').replace(',', '.'));
        return isNaN(num) ? null : Math.round(num * 1_000_000);
    }

    // Xóa dấu phân cách: 16,361,804,655 | 16.361.804.655
    raw = raw.replace(/[.,](?=\d{3})/g, '');

    const result = Number(raw);
    return isNaN(result) ? null : Math.round(result);
}
