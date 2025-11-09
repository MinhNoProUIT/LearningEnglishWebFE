import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Snackbar, Alert } from "@mui/material";
import { toastSlice, toastSelector } from "@/redux/slices//toastSlice";

const ToastContainer = () => {
  const dispatch = useDispatch();
  const toasts = useSelector(toastSelector);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    dispatch(toastSlice.actions.removeToast());
  };

  const getAlertColor = (typeToast: string) => {
    switch (typeToast) {
      case "success":
        return { backgroundColor: "#41ed48", color: "#fff" }; // Màu cho thành công
      case "error":
        return { backgroundColor: "#f44336", color: "#fff" }; // Màu cho lỗi
      case "info":
        return { backgroundColor: "#00bbff", color: "#fff" }; // Màu cho thông tin
      case "warning":
        return { backgroundColor: "#ffdd00", color: "#fff" }; // Màu cho cảnh báo
      default:
        return {};
    }
  };

  return (
    <>
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.hideDuration || 3000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
            ...toast.anchorOrigin,
          }}
        >
          <Alert
            onClose={handleClose}
            severity={toast.typeToast}
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              fontSize: "16px",
              fontFamily: "inherit",
              ...getAlertColor(toast.typeToast),
              "& .MuiAlert-icon": {
                color: "#fff",
              },
              "& .MuiAlert-action": {
                marginTop: "-4px",
              },
            }}
            variant={toast.variant || "standard"}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default ToastContainer;
