'use client'

import * as React from 'react'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import Box from '@mui/material/Box'
import { useTheme } from 'next-themes'

interface Props {
    isUser?: boolean
}

export default function ColorModeIconDropdown({ isUser }: Props) {
    const { resolvedTheme, setTheme } = useTheme()
    const handleClick = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }

    return (
        <Box>
            <Box
                onClick={handleClick}
                sx={{
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    color: isUser === true ? '#fff' : 'var(--text-color)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                        backgroundColor: isUser === true ? '#5ce2c2' : 'var(--hover-color)',
                        borderColor: isUser === true ? '#5ce2c2' : 'var(--hover-color)'
                    }
                }}
            >
                {resolvedTheme === 'light' && (
                    <SunIcon className='h-[23px] w-[23px] rotate-0 scale-100 transition-all' />
                )}
                {resolvedTheme === 'dark' && (
                    <MoonIcon className='h-[23px] w-[23px] rotate-0 scale-100 transition-all' />
                )}
            </Box>
        </Box>
    )
}
