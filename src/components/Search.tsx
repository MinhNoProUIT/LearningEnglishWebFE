'use client'

import * as React from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function Search() {
    const { t } = useTranslation()
    return (
        <Box
            className='flex items-center justify-center cursor-pointer'
            sx={{
                userSelect: 'none',
                borderRadius: '8px',
                padding: '7px 15px',
                border: '1px solid var(--border-color)',
                '&:hover': {
                    borderColor: 'var(--hover-color)'
                }
            }}
        >
            <SearchRoundedIcon sx={{ color: '#9c9c9c', mr: 1 }} fontSize='medium' />
            <Typography variant='h5' fontSize='16px' color='#8f8f8f'>
                {t('COMMON.SEARCH_ANYTHING')}
            </Typography>
        </Box>
    )
}
