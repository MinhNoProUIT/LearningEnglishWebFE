import React from 'react'
import { Box } from '@mui/material'

const Loader: React.FC = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                width: '100%',
                height: '100vh'
            }}
        >
            <style>
                {`
                    @keyframes rotateClockwise {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    @keyframes rotateCounterClockwise {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(-360deg); }
                    }

                    @keyframes zoomInOut {
                        0% { transform: scale(1); opacity: 0.6; }
                        50% { transform: scale(1.2); opacity: 0.9; }
                        100% { transform: scale(1); opacity: 0.6; }
                    }
                `}
            </style>

            {/* Rectangles */}
            <Box
                sx={{
                    position: 'absolute',
                    width: 100,
                    height: 100,
                    borderRadius: '21px',
                    border: '5px solid var(--loader1)',
                    animation: 'rotateClockwise 2s linear infinite'
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: 130,
                    height: 130,
                    borderRadius: '30px',
                    border: '10px solid var(--loader0)',
                    animation: 'rotateCounterClockwise 2s linear infinite'
                }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    width: 50,
                    height: 50,
                    backgroundImage: 'url(/images/street-wear.png)', // Thay thế với URL logo của bạn
                    backgroundSize: '100%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 10,
                    animation: 'zoomInOut 2s ease-in-out infinite'
                }}
            />
        </Box>
    )
}

export default Loader
