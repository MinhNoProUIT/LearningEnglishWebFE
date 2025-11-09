export function getTimeDifferenceText(sentTime: string, t: any) {
    const now = new Date()
    const sentDate = new Date(sentTime)

    const diffInSeconds = Math.floor((now.getTime() - sentDate.getTime()) / 1000)

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return t('COMMON.TIME_DIFFERENCE.MINUTES_AGO', { minutes: diffInMinutes })
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return t('COMMON.TIME_DIFFERENCE.HOURS_AGO', { hours: diffInHours })
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return t('COMMON.TIME_DIFFERENCE.DAYS_AGO', { days: diffInDays })
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 5) return t('COMMON.TIME_DIFFERENCE.WEEKS_AGO', { weeks: diffInWeeks })
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) return t('COMMON.TIME_DIFFERENCE.MONTHS_AGO', { months: diffInMonths })
    const diffInYears = Math.floor(diffInMonths / 12)
    return t('COMMON.TIME_DIFFERENCE.YEARS_AGO', { years: diffInYears })
}

export const iconsForNotification: Record<string, string> = {
    Salary: '/images/salary_icon.png',
    Reward: '/images/reward_icon.png',
    Insurance: '/images/insurance_icon.png',
    Holiday: '/images/holiday_icon.png',
    Benefit: '/images/benefit_icon.png',
    Discipline: '/images/discipline_icon.png',
    Timekeeping: '/images/timekeeping_icon.png',
    Public: '/images/public_icon.png'
}
