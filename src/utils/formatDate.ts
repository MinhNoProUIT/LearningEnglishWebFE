import { format } from 'date-fns'

export function formatDate(dateString: string) {
    const date = new Date(dateString)

    if (!isNaN(date.getTime())) {
        const formattedDate = format(date, 'dd-MM-yyyy')
        return formattedDate
    }
}
