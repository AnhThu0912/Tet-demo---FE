export const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN').format(Number(value)) + ' đ';
};