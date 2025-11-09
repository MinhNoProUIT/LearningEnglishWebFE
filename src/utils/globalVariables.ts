export interface User {
    Id: string
    FullName: string
    Roles: string[]
    AvatarPath: string | null
}

export const userId: string = 'CC001'
export const userSentNotificationId = 'CC013'
export const fullName = 'NamLee'
export const roles = 'Administrator'
export const avatarPath = 'https://localhost:44381/'
