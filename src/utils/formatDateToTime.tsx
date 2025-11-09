export default function formatDateToTime(dateString: string): string {
    const date = new Date(dateString) // Chuyển đổi chuỗi thành đối tượng Date
    const hours = date.getHours() // Lấy giờ
    const minutes = date.getMinutes() // Lấy phút
    const day = String(date.getDate()).padStart(2, '0') // Lấy ngày và đảm bảo có 2 chữ số
    const month = String(date.getMonth() + 1).padStart(2, '0') // Lấy tháng (nhớ cộng thêm 1 vì tháng trong JS bắt đầu từ 0)
    const year = date.getFullYear() // Lấy năm

    // Định dạng giờ và phút
    const formattedTime = `${hours}:${String(minutes).padStart(2, '0')}`

    // Trả về chuỗi theo định dạng yêu cầu
    return `${formattedTime} ${day}-${month}-${year}`
}
