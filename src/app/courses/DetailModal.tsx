import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export const getTypeBgColor = (type: string) => {
  switch (type) {
    case "n":
      return "var(--bg-success-color1)";
    case "v":
      return "var(--bg-closed-color1)";
    case "adj":
      return "var(--bg-warning-color1)";
  }
};
export const getTypeTextColor = (type: string) => {
  switch (type) {
    case "n":
      return "var(--text-success-color1)";
    case "v":
      return "var(--text-closed-color1)";
    case "adj":
      return "var(--text-warning-color1)";
  }
};

export default function DetailModal({
  open,
  onClose,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}) {
  const { t } = useTranslation("common");
  const [form, setForm] = useState({
    image: "/images/logo.png",
    company: "",
    name: "",
    currentPrice: 0,
    originalPrice: 0,
    savings: 0,
    discountPercentage: 0,
    rating: 0,
    salesCount: 0,
    inStock: true,
    isHot: true,
    description: "",
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else
      setForm({
        image: "",
        company: "",
        name: "",
        currentPrice: 0,
        originalPrice: 0,
        savings: 0,
        discountPercentage: 0,
        rating: 0,
        salesCount: 0,
        inStock: true,
        isHot: true,
        description: "",
      });
  }, [initialData]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "var(--background-item)",
          color: "var(--text-color)",
          padding: "10px 4px",
          borderRadius: "15px",
          margin: 0,
        },
        "& .MuiDialogContent-root": {
          padding: 0,
        },
        "& fieldset": {
          borderRadius: "10px",
          borderColor: "var(--border-color)",
        },
        "& .MuiInputBase-input": {
          padding: "15px 10px",
          color: "var(--text-color)",
          fontSize: "16px",
          "&::placeholder": {
            color: "var(--placeholder-color)",
            opacity: 1,
          },
        },
        "& .MuiOutlinedInput-root:hover fieldset": {
          borderColor: "var(--hover-field-color)",
        },
        "& .MuiOutlinedInput-root.Mui-focused fieldset": {
          borderColor: "var(--selected-field-color)",
        },
        "& .MuiFormLabel-root": {
          color: "var(--text-color)",
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: "8px 24px",
          paddingTop: "16px",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {initialData ? t("COMMON.CHITIET") : t("Nội dung lỗi")}
      </DialogTitle>

      <Box
        sx={{
          width: "calc(100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: "24px",
        }}
      >
        <Box
          sx={{
            width: "calc(100% / 3 * 2)",
            boxShadow: "var(--box-shadow-paper)",
            borderRadius: "15px",
            overflow: "hidden",
          }}
        >
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "12px",
                padding: "10px 24px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "5px",
                }}
              >
                <Typography>{t("COMMON.MONHOC") + ":"}</Typography>
                <Typography>{form.company}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "5px",
                }}
              >
                <Typography>{t("COMMON.TENKHOAHOC") + ":"}</Typography>
                <Typography>{form.name}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "5px",
                }}
              >
                <Typography>{t("COMMON.CHITIETKHOAHOC") + ":"}</Typography>
                <Typography>{form.description}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "5px",
                }}
              >
                <Typography>{t("COMMON.GIAGOC") + ":"}</Typography>
                <Typography>
                  {form.originalPrice.toLocaleString("vi-VN")} VND
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "5px",
                }}
              >
                <Typography>{t("COMMON.GIAKHUYENMAI") + ":"}</Typography>
                <Typography>
                  {form.currentPrice.toLocaleString("vi-VN")} VND
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "5px",
                }}
              >
                <Typography>{t("COMMON.DANHGIA") + ":"} </Typography>
                <Typography>{form.rating}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "5px",
                }}
              >
                <Typography>{t("COMMON.SOLUONGDABAN") + ":"}</Typography>
                <Typography>{form.salesCount}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "5px",
                }}
              >
                <Typography>{t("COMMON.TINHTRANG") + ":"}</Typography>
                <Typography>
                  {form.inStock ? t("COMMON.CONHANG") : t("COMMON.HETHANG")}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
        </Box>
        <Box
          sx={{
            width: "calc(100% / 3 + 24px)",

            position: "relative",

            aspectRatio: "1 / 1",

            borderRadius: "15px",
            overflow: "hidden",
          }}
        >
          <Image
            src={form.image}
            alt={form.name}
            layout="fill"
            objectFit="cover"
          />
        </Box>
      </Box>

      <DialogActions
        sx={{
          alignSelf: "center",
          padding: "16px",
          gap: "10px",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            fontSize: "14px",
            fontWeight: "bold",
            borderRadius: "8px",
            backgroundColor: "#03d794",
            textTransform: "none",
          }}
        >
          {t("COMMON.DONG")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
