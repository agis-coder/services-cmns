import { VN_KEYWORDS } from "../enums/national";

export const buildVnCondition = (aliasList: string[]) => VN_KEYWORDS.map((k, i) => aliasList.map(a => `LOWER(${a}) LIKE :vn${i}`).join(' OR ')).join(' OR ')


export const CITY_ALIAS: Record<string, string> = {
    HCM: 'TP Hồ Chí Minh',
    HN: 'Hà Nội',
    DN: 'Đà Nẵng',
};

export const normalizeSearch = (search: string): string => {
    if (!search) return '';
    const trimmed = search.trim();
    const upper = trimmed.toUpperCase();
    return CITY_ALIAS[upper] || trimmed;
}