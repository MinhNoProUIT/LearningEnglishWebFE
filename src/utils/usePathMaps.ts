import { useTranslation } from 'react-i18next'

export const usePathMaps = () => {
    const { t } = useTranslation('common')

    const mapPathName: Record<string, string> = {
        '/admin': t('COMMON.SIDEBAR.HOME'),
        '/admin/statistics': t('COMMON.SIDEBAR.STATISTICS'),
        '/admin/employee': t('COMMON.SIDEBAR.EMPLOYEE'),
        '/admin/contract': t('COMMON.SIDEBAR.CONTRACT'),
        '/admin/salary': t('COMMON.SIDEBAR.SALARY'),
        '/admin/schedular': t('COMMON.SIDEBAR.SCHEDULAR'),
        '/admin/timekeeping': t('COMMON.SIDEBAR.TIMEKEEPING'),
        '/admin/time-off': t('COMMON.SIDEBAR.TIME_OFF'),
        '/admin/permission': t('COMMON.SIDEBAR.PERMISSION'),
        '/admin/department': t('COMMON.SIDEBAR.DEPARTMENT'),
        '/admin/role': t('COMMON.SIDEBAR.ROLE'),
        '/admin/org-structure': t('COMMON.SIDEBAR.ORG_STRUCTURE'),
        '/admin/work-regulations': t('COMMON.SIDEBAR.WORK_REGULATIONS'),
        '/admin/work-shift': t('COMMON.SIDEBAR.WORK_SHIFT'),
        '/admin/insurance': t('COMMON.SIDEBAR.INSURANCE'),
        '/admin/reward': t('COMMON.SIDEBAR.REWARD'),
        '/admin/benefit': t('COMMON.SIDEBAR.BENEFIT'),
        '/admin/discipline': t('COMMON.SIDEBAR.DISCIPLINE'),
        '/admin/holiday': t('COMMON.SIDEBAR.HOLIDAY'),
        '/admin/configuration': t('COMMON.SIDEBAR.CONFIGURATION'),
        '/admin/statistics/attendance': t('COMMON.SIDEBAR.ATTENDANCE'),
        '/admin/statistics/benefits': t('COMMON.SIDEBAR.BENEFITS'),
        '/admin/statistics/salary': t('COMMON.SIDEBAR.SALARY'),
        '/admin/statistics/employee-contract': t('COMMON.SIDEBAR.EMPLOYEE_CONTRACT'),
        '/admin/statistics/timeoff-errorreport': t('COMMON.SIDEBAR.TIMEOFF_ERRORREPORT'),
        '/admin/statistics/rewards-disciplines': t('COMMON.SIDEBAR.REWARDS_DISCIPLINES'),
        '/admin/statistics/insurance': t('COMMON.SIDEBAR.INSURANCE')
    }

    const mapParentPathName: Record<string, string> = {
        '/admin': t('COMMON.SIDEBAR.DASHBOARD'),
        '/admin/statistics': t('COMMON.SIDEBAR.DASHBOARD'),
        '/admin/employee': t('COMMON.SIDEBAR.HUMAN_RESOURCES'),
        '/admin/contract': t('COMMON.SIDEBAR.HUMAN_RESOURCES'),
        '/admin/salary': t('COMMON.SIDEBAR.HUMAN_RESOURCES'),
        '/admin/schedular': t('COMMON.SIDEBAR.HUMAN_RESOURCES'),
        '/admin/timekeeping': t('COMMON.SIDEBAR.HUMAN_RESOURCES'),
        '/admin/time-off': t('COMMON.SIDEBAR.HUMAN_RESOURCES'),
        '/admin/permission': t('COMMON.SIDEBAR.HUMAN_RESOURCES'),
        '/admin/department': t('COMMON.SIDEBAR.ORGANIZATION_DESIGN'),
        '/admin/role': t('COMMON.SIDEBAR.ORGANIZATION_DESIGN'),
        '/admin/org-structure': t('COMMON.SIDEBAR.ORGANIZATION_DESIGN'),
        '/admin/work-regulations': t('COMMON.SIDEBAR.REGULATIONS_AND_POLICIES'),
        '/admin/work-shift': t('COMMON.SIDEBAR.REGULATIONS_AND_POLICIES'),
        '/admin/insurance': t('COMMON.SIDEBAR.REGULATIONS_AND_POLICIES'),
        '/admin/reward': t('COMMON.SIDEBAR.REGULATIONS_AND_POLICIES'),
        '/admin/benefit': t('COMMON.SIDEBAR.REGULATIONS_AND_POLICIES'),
        '/admin/discipline': t('COMMON.SIDEBAR.REGULATIONS_AND_POLICIES'),
        '/admin/holiday': t('COMMON.SIDEBAR.REGULATIONS_AND_POLICIES'),
        '/admin/configuration': t('COMMON.SIDEBAR.REGULATIONS_AND_POLICIES')
    }

    return { mapPathName, mapParentPathName }
}
