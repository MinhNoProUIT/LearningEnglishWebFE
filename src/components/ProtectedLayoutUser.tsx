'use client'

import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectIsLoading } from '@/redux/slices/authSlice'
import { useEffect, useState } from 'react'
import MainLoader from '@/components/MainLoader'
import { Box, keyframes } from '@mui/material'

const slide = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`

export default function ProtectedLayoutUser({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const isLoading = useSelector(selectIsLoading)

    const [showContent, setShowContent] = useState(false)

    useEffect(() => {
        // Đợi cho đến khi auth state được hydrate
        if (!isLoading) {
            if (!isAuthenticated) {
                // Chưa đăng nhập -> redirect về login
                router.push('/authentication/login')
            } else {
                // Đã đăng nhập -> hiển thị nội dung
                setShowContent(true)
            }
        }
    }, [isAuthenticated, isLoading, router])

    // Đang kiểm tra auth state
    if (isLoading || !showContent) {
        return <MainLoader />
    }

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '2.5px',
                    backgroundColor: 'transparent',
                    overflow: 'hidden',
                    zIndex: 9999999
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#19c346',
                        animation: `${slide} 0.5s forwards`
                    }}
                />
            </Box>
            {children}
        </>
    )
}
