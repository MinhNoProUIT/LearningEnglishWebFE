export default function formatNumberWithUnit(number: number): string {
    if (isNaN(number)) {
        return 'Số không hợp lệ'
    }

    const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ']

    let unitIndex = 0
    while (Math.abs(number) >= 1000 && unitIndex < units.length - 1) {
        number /= 1000
        unitIndex++
    }

    // Sử dụng toLocaleString cho định dạng dấu phẩy
    let formattedNumber = Math.abs(number).toLocaleString('vi-VN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

    if (number < 0) {
        formattedNumber = '-' + formattedNumber
    }

    return `${formattedNumber} ${units[unitIndex]} VND`
}

export function formatNumberToMoney(number: number): string {
    if (isNaN(number)) {
        return 'Số không hợp lệ'
    }

    // Sử dụng toLocaleString cho định dạng dấu phẩy
    const formattedNumber = number.toLocaleString('vi-VN')

    return `${formattedNumber} VND`
}
