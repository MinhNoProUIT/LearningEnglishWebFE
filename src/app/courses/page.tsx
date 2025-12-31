"use client";

import {
  Box,
  Typography,
  Link,
} from "@mui/material";
import ProductCard from "./ProductCard";

import { useEffect, useState } from "react";
import "rc-slider/assets/index.css";
import { useTranslation } from "react-i18next";

import HistoryModal from "./HistoryModal";

interface Product {
  id: number;
  image: string;
  company: string;
  name: string;
  currentPrice: number;
  originalPrice: number;
  savings: number;
  discountPercentage: number;
  rating: number;
  salesCount: number;
  inStock: boolean;
  isHot: boolean;
  description: string;
}

const Iproducts = [
  {
    id: 1,
    image: "/images/ielts55.png",
    company: "IELTS",
    name: "IELTS 3.5 - 4.5",
    currentPrice: 700000,
    originalPrice: 1000000,
    savings: 300000,
    discountPercentage: 30,
    rating: 5.0,
    salesCount: 348,
    inStock: true,
    isHot: true,
    description:
      "Khóa học Địa lý 12 cung cấp kiến thức toàn diện về địa lý tự nhiên và kinh tế xã hội Việt Nam. Bài giảng được thiết kế sinh động, dễ hiểu và sát với chương trình thi THPT Quốc gia.",
  },
  {
    id: 2,
    image: "/images/ielts55.png",
    company: "IELTS",
    name: "IELTS  4.5- 5.5",
    currentPrice: 500000,
    originalPrice: 1000000,
    savings: 500000,
    discountPercentage: 50,
    rating: 4.6,
    salesCount: 42,
    inStock: true,
    isHot: true,
    description:
      "Khóa học Lịch sử 12 giúp học sinh nắm vững các giai đoạn lịch sử Việt Nam và thế giới hiện đại. Nội dung được trình bày logic, hỗ trợ ghi nhớ bằng sơ đồ và tư liệu hình ảnh.",
  },
  {
    id: 3,
    image: "/images/ielts55.png",
    company: "TOEIC",
    name: "TOEIC 450+",
    currentPrice: 2700000,
    originalPrice: 3000000,
    savings: 300000,
    discountPercentage: 10,
    rating: 4.7,
    salesCount: 283,
    inStock: true,
    isHot: true,
    description:
      "Khóa học Toán 12 bao gồm đầy đủ đại số và giải tích, hình học không gian, bám sát cấu trúc đề thi THPT. Học viên được luyện tập với hàng trăm bài tập và đề thi thử chất lượng.",
  },
  {
    id: 4,
    image: "/images/ielts55.png",
    company: "IELTS",
    name: "IELTS 5.5 - 6.5",
    currentPrice: 1350000,
    originalPrice: 1500000,
    savings: 150000,
    discountPercentage: 10,
    rating: 3.8,
    salesCount: 482,
    inStock: true,
    isHot: true,
    description:
      "Khóa học Hình học 12 chuyên sâu về hình học không gian và tọa độ trong không gian. Hướng dẫn chi tiết từng dạng bài và cách trình bày bài thi hiệu quả.",
  },
  {
    id: 5,
    image: "/images/ielts55.png",
    company: "TOEIC",
    name: "TOEIC 600+",
    currentPrice: 150000,
    originalPrice: 1500000,
    savings: 1350000,
    discountPercentage: 90,
    rating: 4.8,
    salesCount: 600,
    inStock: true,
    isHot: false,
    description:
      "Khóa học Sinh học 12 bao quát di truyền học, tiến hóa và sinh thái học. Cung cấp nhiều ví dụ thực tiễn và bài tập trắc nghiệm chuẩn hóa.",
  },
  {
    id: 6,
    image: "/images/ielts55.png",
    company: "IELTS",
    name: "IELTS 6.5 - 7.5",
    currentPrice: 1350000,
    originalPrice: 1500000,
    savings: 150000,
    discountPercentage: 10,
    rating: 3.8,
    salesCount: 482,
    inStock: true,
    isHot: true,
    description:
      "Khóa học Ngữ văn 12 tập trung phân tích tác phẩm văn học trọng tâm và kỹ năng làm văn nghị luận. Cung cấp dàn ý mẫu và hướng dẫn cách viết bài điểm cao.",
  },
  {
    id: 7,
    image: "/images/ielts55.png",
    company: "TOEIC",
    name: "TOEIC 800+",
    currentPrice: 1350000,
    originalPrice: 1500000,
    savings: 150000,
    discountPercentage: 10,
    rating: 4.8,
    salesCount: 600,
    inStock: true,
    isHot: false,
    description:
      "Khóa học Tiếng Anh 12 giúp cải thiện kỹ năng đọc hiểu, ngữ pháp và từ vựng theo đề thi chuẩn. Bao gồm luyện nghe nói qua các video và bài tập tương tác.",
  },
];

const INITIAL_PRODUCT_LIMIT = 3;

const HomePage = () => {
  const { t } = useTranslation();
  const [products, setTopics] = useState(Iproducts);
  const [searchKey, setSearchKey] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [limit, setLimit] = useState(INITIAL_PRODUCT_LIMIT);

  const [isFormHistoryOpen, setIsFormHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<Product[] | null>(null);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]); // Tăng max range để bao hết sản phẩm

  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange([value[0], value[1]]);
    }
  };

  const handleShowAll = (e) => {
    e.preventDefault();
    setLimit(filteredProducts.length);
  };

  const handleCollapse = (e) => {
    e.preventDefault();
    setLimit(INITIAL_PRODUCT_LIMIT);
  };

  const filteredProducts = products.filter((product) => {
    const inPriceRange =
      product.currentPrice >= priceRange[0] &&
      product.currentPrice <= priceRange[1];

    let matchesSearchKey = true;
    if (searchKey) {
      const value = product[searchBy];
      if (typeof value === "number") {
        matchesSearchKey = value === Number(searchKey);
      } else {
        matchesSearchKey =
          value?.toLowerCase().includes(searchKey.toLowerCase()) || false;
      }
    }

    return inPriceRange && matchesSearchKey;
  });

  useEffect(() => {}, [setTopics, setSearchBy]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        //borderColor: "black",
        // borderWidth: 1,
        // borderStyle: "solid",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: "calc(75%)",
          display: "flex",
          //borderColor: "black",
          alignItems: "center",
          justifyContent: "space-between",
          // borderWidth: 1,
          // borderStyle: "solid",
          gap: "24px",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {t("DANH SÁCH KHÓA HỌC")} ({filteredProducts.length})
        </Typography>
        {filteredProducts.length > limit && (
          <Link
            href="#"
            underline="hover"
            sx={{ color: "primary.main", fontWeight: "bold" }}
            onClick={handleShowAll}
          >
            {t("Xem tất cả")}
          </Link>
        )}
      </Box>

      <Box
        sx={{
          width: "calc(75%)",
          // borderColor: "black",
          // borderWidth: 1,
          // borderStyle: "solid",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          justifyContent: {
            xs: "center",
            sm: "center",
          },
        }}
      >
        {filteredProducts.slice(0, limit).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Box>
      {limit > INITIAL_PRODUCT_LIMIT &&
        filteredProducts.length > INITIAL_PRODUCT_LIMIT && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Link
              href="#"
              underline="hover"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                textAlign: "center",
              }}
              onClick={handleCollapse}
            >
              {t("Thu gọn")}
            </Link>
          </Box>
        )}
      <HistoryModal
        open={isFormHistoryOpen}
        onClose={() => setIsFormHistoryOpen(false)}
        initialData={historyData}
      />
    </Box>
  );
};

export default HomePage;
