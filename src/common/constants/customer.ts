import { VN_KEYWORDS } from "../enums/national";

export const buildVnCondition = (aliasList: string[]) =>
    VN_KEYWORDS.map(
        (k, i) =>
            aliasList.map(
                a => `LOWER(${a}) LIKE :vn${i}`
            ).join(' OR ')
    ).join(' OR ')
