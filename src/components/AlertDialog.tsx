'use client'
import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import InfoIcon from '@mui/icons-material/Info'

interface AlertDialogProps {
    title: string
    content: string
    type: 'info' | 'warning' | 'error'
    open: boolean
    buttonCancel: string
    buttonConfirm: string
    setOpen: (open: boolean) => void
    onConfirm: () => void
}

export default function AlertDialog({
    title,
    content,
    type,
    buttonCancel,
    buttonConfirm,
    open,
    setOpen,
    onConfirm
}: AlertDialogProps) {
    return (
        <React.Fragment>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
                PaperProps={{
                    sx: {
                        borderRadius: '12px'
                    }
                }}
            >
                <DialogTitle
                    id='alert-dialog-title'
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: type === 'error' ? 'red' : type === 'info' ? 'blue' : 'yellow'
                    }}
                >
                    {type === 'error' && <ErrorIcon style={{ color: 'red', width: '70px', height: '70px' }} />}
                    {type === 'warning' && <WarningIcon style={{ color: '#ffd329', width: '70px', height: '70px' }} />}
                    {type === 'info' && <InfoIcon style={{ color: 'blue', width: '70px', height: '70px' }} />}
                </DialogTitle>
                <DialogContent
                    sx={{
                        padding: '10px 15px',
                        paddingTop: '15px !important',
                        backgroundColor: 'var(--background-color)',
                        borderLeft: `0.5px solid var(--border-alert-color)`,
                        borderRight: `0.5px solid var(--border-alert-color)`
                    }}
                >
                    <DialogContentText
                        sx={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-color)' }}
                    >
                        {title}
                    </DialogContentText>
                    <DialogContentText
                        id='alert-dialog-description'
                        sx={{
                            fontSize: '16px',
                            textAlign: 'center',
                            color: 'var(--text-color)'
                        }}
                    >
                        {content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingTop: '5px',
                        paddingBottom: '18px',
                        gap: '13px',
                        backgroundColor: 'var(--background-color)',
                        borderLeft: `0.5px solid var(--border-alert-color)`,
                        borderRight: `0.5px solid var(--border-alert-color)`,
                        borderBottom: `0.5px solid var(--border-alert-color)`
                    }}
                >
                    <Button
                        variant='outlined'
                        onClick={() => setOpen(false)}
                        sx={{
                            color: 'var(--text-color)',
                            borderColor: 'var(--border-color)',
                            '&:hover': {
                                color: 'var(--hover-button-color)',
                                borderColor: 'var(--hover-button-color)'
                            },
                            textTransform: 'none'
                        }}
                    >
                        {buttonCancel}
                    </Button>
                    <Button
                        variant='contained'
                        onClick={() => onConfirm()}
                        autoFocus
                        sx={{
                            backgroundColor: 'var(--button-color)',
                            '&:hover': {
                                backgroundColor: 'var(--hover-button-color)'
                            },
                            textTransform: 'none',
                            marginLeft: '10px'
                        }}
                    >
                        {buttonConfirm}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
