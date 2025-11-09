import { MenuItem, Popper, Grow, MenuList, Paper, ClickAwayListener } from '@mui/material'
import { Box } from '@mui/material'
import LanguageIcon from '@mui/icons-material/Language'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/providers/LanguageProvider'

interface Props {
    isUser?: boolean
}

const LanguageMenu = ({ isUser }: Props) => {
    const { t } = useTranslation('common')
    const anchorRef = useRef<HTMLDivElement | null>(null)
    const [open, setOpen] = useState(false)
    const { language, setLanguage } = useLanguage()

    const handleToggle = () => {
        setOpen(prev => !prev)
    }

    const handleChangeLanguage = (language: string) => {
        setLanguage(language)
        setOpen(false)
    }

    const handleClose = (event: Event | React.SyntheticEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return
        }
        setOpen(false)
    }

    const handleListKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Tab' || event.key === 'Escape') {
            event.preventDefault()
            setOpen(false)
        }
    }

    const prevOpen = useRef(open)
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current?.focus()
        }
        prevOpen.current = open
    }, [open])

    return (
        <Box>
            <Box
                ref={anchorRef}
                onClick={handleToggle}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isUser === true ? '#fff' : 'var(--text-color)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: isUser === true ? '#5ce2c2' : 'var(--hover-color)',
                        borderColor: isUser === true ? '#5ce2c2' : 'var(--hover-color)'
                    },
                    ...(open && {
                        backgroundColor: isUser === true ? '#5ce2c2' : 'var(--hover-color)',
                        borderColor: isUser === true ? '#5ce2c2' : 'var(--hover-color)'
                    })
                }}
            >
                <LanguageIcon sx={{ fontSize: 28 }} />
            </Box>

            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement='bottom-end'
                transition
                sx={{
                    borderRadius: '10px'
                }}
                disablePortal
            >
                {({ TransitionProps }) => (
                    <Grow
                        {...TransitionProps}
                        timeout={0}
                        style={{
                            marginTop: '5px',
                            borderRadius: '10px',
                            transformOrigin: 'right top'
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                backgroundImage:
                                    'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfMjc0OV8xNDUxODYpIiBmaWxsLW9wYWNpdHk9IjAuMTIiLz4KPGRlZnM+CjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQwX3JhZGlhbF8yNzQ5XzE0NTE4NiIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgxMjAgMS44MTgxMmUtMDUpIHJvdGF0ZSgtNDUpIHNjYWxlKDEyMy4yNSkiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMDBCOEQ5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwQjhEOSIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==), url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSJ1cmwoI3BhaW50MF9yYWRpYWxfMjc0OV8xNDUxODcpIiBmaWxsLW9wYWNpdHk9IjAuMTIiLz4KPGRlZnM+CjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQwX3JhZGlhbF8yNzQ5XzE0NTE4NyIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgwIDEyMCkgcm90YXRlKDEzNSkgc2NhbGUoMTIzLjI1KSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjU2MzAiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY1NjMwIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K)',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                backdropFilter: 'blur(20px)',
                                backgroundColor: 'var(--background-item)',
                                border: '1px solid var(--border-color)',
                                padding: '0 8px',
                                width: '168px',
                                borderRadius: '10px'
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList
                                    autoFocusItem={false}
                                    id='language-menu'
                                    onKeyDown={handleListKeyDown}
                                    sx={{
                                        borderRadius: '10px'
                                    }}
                                >
                                    <MenuItem
                                        sx={{
                                            color: 'var(--text-color)',
                                            borderRadius: '6px',
                                            '&:hover': { backgroundColor: 'var(--hover-color)' },
                                            ...(language === 'vi' && {
                                                backgroundColor: 'var(--background-selected-item)',
                                                '&:hover': { backgroundColor: 'var(--hover-color)' }
                                            }),
                                            padding: '3px 12px 3px 8px',
                                            mb: '3px'
                                        }}
                                        onClick={() => handleChangeLanguage('vi')}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: '12.5px',
                                                alignItems: 'center',
                                                justifyContent: 'left'
                                            }}
                                        >
                                            <img
                                                src='/images/vietnam.png'
                                                style={{
                                                    borderRadius: 0,
                                                    height: '35px'
                                                }}
                                            />
                                            {t('COMMON.LANGUAGE.VI')}
                                        </Box>
                                    </MenuItem>
                                    <MenuItem
                                        sx={{
                                            color: 'var(--text-color)',
                                            borderRadius: '6px',
                                            '&:hover': { backgroundColor: 'var(--hover-color)' },
                                            ...(language === 'en' && {
                                                backgroundColor: 'var(--background-selected-item)',
                                                '&:hover': { backgroundColor: 'var(--hover-color)' }
                                            }),
                                            padding: '3px 12px 3px 8px'
                                        }}
                                        onClick={() => handleChangeLanguage('en')}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: '12.5px',
                                                alignItems: 'center',
                                                justifyContent: 'left'
                                            }}
                                        >
                                            <img
                                                src='/images/united-kingdom.png'
                                                style={{ borderRadius: 0, height: '35px' }}
                                            />
                                            {t('COMMON.LANGUAGE.EN')}
                                        </Box>
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    )
}

export default LanguageMenu
