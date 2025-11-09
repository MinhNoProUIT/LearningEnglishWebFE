'use client'

import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { authSlice } from '@/redux/slices/authSlice'
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

const getUserData = async router => {
    const token = sessionStorage.getItem('auth_token')

    if (!token) {
        router.push('/login')
        return null
    }

    try {
        const userResponse = await fetch('https://localhost:44381/api/Auth/Me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!userResponse.ok || userResponse.status !== 200) {
            router.push('/login')
            return null
        }

        const userData = await userResponse.json()

        if (userData.Data) {
            return userData.Data.MenuLeft
        } else {
            console.error('No data available or request failed')
            return null
        }
    } catch {
        router.push('/403')
        return null
    }
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter() // Dùng để chuyển hướng
    const dispatch = useDispatch()

    const [isChecking, setIsChecking] = useState(true) // Trạng thái kiểm tra quyền

    useEffect(() => {
        const fetchMenuLeft = async () => {
            const data = await getUserData(router)
            if (data) {
                dispatch(authSlice.actions.updateAuth(data))
                setIsChecking(false)
            }
        }
        fetchMenuLeft()
    }, [dispatch, router])

    if (isChecking) {
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
