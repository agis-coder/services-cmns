export const HEADER_MAP = {
    project_name: ['TÊN DỰ ÁN', 'Project'],
    product_type: ['LOẠI SẢN PHẨM'],
    subdivision: ['PHÂN KHU'],
    unit_code: ['MÃ CĂN', 'CĂN SỐ'],
    floor: ['TẦNG/DÃY'],
    land_area: ['DIỆN TÍCH ĐẤT/DIỆN TÍCH TIM TƯỜNG'],
    usable_area: ['DIỆN TÍCH SÀN XÂY DỰNG/DIỆN TÍCH THÔNG THỦY'],
    door_direction: ['HƯỚNG CỬA'],
    view: ['VIEW'],
    contract_price: ['GIÁ GỐC TRÊN HỢP ĐỒNG'],
    day_trading: ['GIAO DỊCH NGÀY'],
    soucre: ['NGUỒN TỪ ĐÂU', 'soucre'],
    source_details: ['CHI TIẾT NGUỒN'],
    investor: ['Chủ đầu tư', 'investor'],
    customer_name: ['HỌ VÀ TÊN KHÁCH HÀNG', 'Tên', 'Họ và Tên', 'Full Name'],
    date_of_birth: ['NGÀY THÁNG NĂM SINH'],
    phone_number: ['PHONE', 'SĐT', 'SỐ ĐIỆN THOẠI'],
    cccd: ['CCCD'],
    email: ['EMAIL'],
    address: ['ĐỊA CHỈ LIÊN HỆ'],
    permanent_address: ['ĐỊA CHỈ THƯỜNG TRÚ'],
    living_area: ['KHU VỰC SINH SỐNG'],
    nationality: ['QUỐC TỊCH'],
    marital_status: ['TÌNH TRẠNG HÔN NHÂN'],
    interest: ['SỞ THÍCH'],
    business_field: ['LĨNH VỰC KINH DOANH'],
    zalo_status: ['TÌNH TRẠNG ZALO'],
    facebook: ['FACEBOOK'],

    employee_code: ['MÃ NHÂN VIÊN'],
    employee_name: ['TÊN NHÂN VIÊN'],

    dealer_name: ['TÊN ĐẠI LÝ'],
    outside_sales_name: ['TÊN SALE NGOÀI'],
    phone_sale: ['SĐT SALE NGOÀI'],
    email_sale: ['EMAIL SALE NGOÀI'],

    first_interaction_transfer: ['TƯƠNG TÁC LẦN ĐẦU (THỨ CẤP)'],
    closest_interaction_transfer: ['TƯƠNG TÁC GẦN NHẤT (THỨ CẤP)'],
    result_transfer: ['KẾT QUẢ (THỨ CẤP)'],
    expected_selling_price_transfer: ['GIÁ BÁN KỲ VỌNG (THỨ CẤP)'],
    expected_rental_price_transfer: ['GIÁ CHO THUÊ KỲ VỌNG (THỨ CẤP)'],
    note_expected_transfer: ['GHI CHÚ (THỨ CẤP)'],

    first_interaction_new: ['TƯƠNG TÁC LẦN ĐẦU (SƠ CẤP)'],
    closest_interaction_new: ['TƯƠNG TÁC GẦN NHẤT (SƠ CẤP)'],
    project_advertised: ['DỰ ÁN ĐANG CHÀO (SƠ CẤP)'],
    result_new: ['KẾT QUẢ (SƠ CẤP)'],
    note_expected_new: ['GHI CHÚ (SƠ CẤP)'],
};

export const REQUIRED_HEADERS_COMMON = [
    HEADER_MAP.project_name,
    HEADER_MAP.unit_code,
    HEADER_MAP.phone_number,
];

export const REQUIRED_HEADERS_NEW_SALE = [
    HEADER_MAP.first_interaction_new,
];

export const REQUIRED_HEADERS_TRANSFER = [
    HEADER_MAP.first_interaction_transfer,
];

export const PREFIX_MAP: Record<string, string> = {
    // 4 số
    '0120': '070', '0121': '079', '0122': '077', '0123': '083', '0124': '084',
    '0125': '085', '0126': '076', '0127': '081', '0128': '078', '0129': '082',
    '0134': '083',
    '0156': '036',
    '0160': '032', '0161': '031', '0162': '032', '0163': '033', '0164': '034',
    '0165': '035', '0166': '036', '0167': '037', '0168': '038', '0169': '039',
    '0182': '052', '0185': '085', '0186': '056', '0188': '058',
    '0198': '059', '0199': '059',

    // 3 số (thiếu 0)
    '120': '070', '121': '079', '122': '077', '123': '083', '124': '084',
    '125': '085', '126': '076', '127': '081', '128': '078', '129': '082',
    '160': '032', '161': '031', '162': '032', '163': '033', '164': '034',
    '165': '035', '166': '036', '167': '037', '168': '038', '169': '039',
    '186': '056', '188': '058', '199': '059',

    // đặc biệt
    '849': '09'
}