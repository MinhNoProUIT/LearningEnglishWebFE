'use client'
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import * as signalR from '@microsoft/signalr'
import { countNewNotificationSlice } from '@/redux/slices/countNewNotificationSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Typography, Snackbar, Alert, Avatar } from '@mui/material'
import { INotificationsForUser } from '@/models/Notifications'
import { notificationsSelector, notificationsSlice } from '@/redux/slices/notificationsSlice'
import { userId } from '@/utils/globalVariables'
import { iconsForNotification, getTimeDifferenceText } from '@/utils/calcForNotification'

interface INotificationAlert {
    Title: string
    Content: string
    SentTime: string
    Type: string
}

function NotificationRealTime() {
    const { t } = useTranslation('common')
    const dispatch = useDispatch()

    const [notificationAlert, setNotificationAlert] = useState<INotificationAlert[]>([])
    const [open, setOpen] = useState(false)
    const [currentNotificationAlert, setCurrentNotificationAlert] = useState<INotificationAlert | null>(null)

    const currentNotifications = useSelector(notificationsSelector)
    const currentNotificationsRef = useRef(currentNotifications)

    useEffect(() => {
        currentNotificationsRef.current = currentNotifications
    }, [currentNotifications])

    const handleOpen = (notification: INotificationsForUser) => {
        setNotificationAlert(prevNotificationAlert => [
            ...prevNotificationAlert,
            {
                Title: notification.Title,
                Content: notification.Content,
                SentTime: notification.SentTime,
                Type: notification.Type
            }
        ])
        dispatch(countNewNotificationSlice.actions.increasingCountNewNotification())
        dispatch(notificationsSlice.actions.updateNotifications([notification, ...currentNotificationsRef.current]))
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return
        setNotificationAlert(prev => {
            const nextNotifications = prev.slice(1)
            setCurrentNotificationAlert(nextNotifications[0] || null)
            return nextNotifications
        })
        setOpen(false)
    }

    useEffect(() => {
        if (notificationAlert.length > 0 && !currentNotificationAlert) {
            setCurrentNotificationAlert(notificationAlert[0])
            setOpen(true)
        }
    }, [notificationAlert, currentNotificationAlert])

    useEffect(() => {
        if (currentNotificationAlert) {
            setOpen(true)
        }
    }, [currentNotificationAlert])

    const connectionRef = useRef<signalR.HubConnection | null>(null)

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:44381/notificationHub', {
                accessTokenFactory: () => userId
            })
            .withAutomaticReconnect()
            .build()

        connection.on('ReceiveNotifications', notification => {
            handleOpen(notification)
        })

        connection.start().then(() => {
            connectionRef.current = connection
        })

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop()
            }
        }
    }, [])

    return (
        currentNotificationAlert && (
            <Snackbar open={open} sx={{ cursor: 'pointer' }} autoHideDuration={4000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    sx={{
                        width: '350px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--alert-color)',
                        position: 'relative',
                        '.MuiAlert-icon': { display: 'none' },
                        '.MuiAlert-action': {
                            paddingLeft: 0,
                            height: '35px',
                            svg: {
                                color: 'var(--text-color)'
                            },
                            button: {
                                borderRadius: '50%',
                                backgroundColor: 'var(--button-alert-color)',
                                marginRight: '3px',
                                '&:hover': {
                                    backgroundColor: 'var(--button-alert-hover-color)'
                                }
                            }
                        }
                    }}
                >
                    <div className={`absolute right-5 top-[75px] w-3 h-3 rounded-full bg-[red] -translate-y-1/2`} />
                    <Typography sx={{ color: 'var(--text-color)', pb: 1, fontWeight: 'bold', fontSize: '15px' }}>
                        {t('COMMON.ALERT.NOTIFICATION_NEW')}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%'
                        }}
                    >
                        <Avatar
                            src={iconsForNotification[currentNotificationAlert.Type]}
                            sx={{
                                borderRadius: '50%',
                                objectFit: 'cover',
                                width: '54px',
                                height: '54px',
                                border: '1px solid #fdd',
                                mr: 2,
                                backgroundColor: 'white'
                            }}
                            alt=''
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <Typography
                                variant='h6'
                                sx={{
                                    width: '100%',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: 'var(--text-color)'
                                }}
                            >
                                {currentNotificationAlert.Title}
                            </Typography>
                            <Typography
                                variant='h6'
                                component='div'
                                sx={{
                                    marginTop: '-3px',
                                    width: '100%',
                                    fontSize: '14px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: 'var(--text-color)'
                                }}
                            >
                                {
                                    new DOMParser().parseFromString(currentNotificationAlert.Content, 'text/html').body
                                        .textContent
                                }
                            </Typography>
                            <Typography
                                variant='h6'
                                sx={{
                                    marginTop: '-3px',
                                    fontSize: '12px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                                className={'text-[var(--text-role-color)] font-bold'}
                            >
                                {getTimeDifferenceText(
                                    new Date(
                                        new Date(currentNotificationAlert.SentTime).getTime() - 7 * 60 * 60 * 1000
                                    ).toISOString(),
                                    t
                                )}
                            </Typography>
                        </Box>
                    </Box>
                </Alert>
            </Snackbar>
        )
    )
}

export default NotificationRealTime
