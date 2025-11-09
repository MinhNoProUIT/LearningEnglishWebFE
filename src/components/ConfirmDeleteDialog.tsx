import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function ConfirmDeleteDialog({ 
    open, 
    onClose, 
    onConfirm 
}: {
    open: boolean,
    onClose: () => void,
    onConfirm: () => void
}) {
    const { t } = useTranslation("common");

    return (
        <Dialog open={open} onClose={onClose}
            sx={{
                '& .MuiPaper-root': {
                    backgroundColor: "var(--background-item)",
                    color: "var(--text-color)",
                    padding: '20px 4px',
                    borderRadius: '15px'
                }
            }}
        >
            <DialogTitle>
                {t("COMMON.ALERT_DIALOG.CONFIRM_DELETE.CONTENT")}
            </DialogTitle>

            <DialogActions sx={{
                alignSelf: 'center',
            }}>
                <Button onClick={onClose}
                    sx={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: 'var(--text-color)',
                        textTransform: "none",
                    }}
                >
                {t("COMMON.ALERT_DIALOG.CONFIRM_DELETE.CANCEL")}
                </Button>
                <Button variant="contained" color="error" onClick={onConfirm}
                    sx={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        borderRadius: '8px',
                        textTransform: "none",
                    }}
                >
                {t("COMMON.ALERT_DIALOG.CONFIRM_DELETE.DELETE")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
