// utils/userBehavior.js

const VIEWED_KEY = "viewed_products";
const LIKED_KEY = "liked_products";

// Hàm để lấy danh sách ID từ localStorage
const getProductList = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// --- Chức năng "Đã Xem" ---
export const markProductAsViewed = (productId) => {
  let viewed = getProductList(VIEWED_KEY);
  // Xóa ID nếu đã tồn tại để đưa nó lên đầu danh sách (xem gần đây nhất)
  viewed = viewed.filter((id) => id !== productId);
  // Thêm ID mới vào đầu danh sách
  viewed.unshift(productId);
  // Giới hạn lịch sử xem 20 sản phẩm gần nhất
  if (viewed.length > 20) {
    viewed = viewed.slice(0, 20);
  }
  localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
};

// --- Chức năng "Thích" (Toggle) ---
export const toggleProductLike = (productId) => {
  let liked = getProductList(LIKED_KEY);
  const isLiked = liked.includes(productId);

  if (isLiked) {
    // Nếu đã thích -> Bỏ thích
    liked = liked.filter((id) => id !== productId);
  } else {
    // Nếu chưa thích -> Thích
    liked.push(productId);
  }
  localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
  return !isLiked; // Trả về trạng thái mới (true nếu vừa thích, false nếu vừa bỏ thích)
};

// Hàm để kiểm tra một sản phẩm có được thích hay không
export const isProductLiked = (productId) => {
  const liked = getProductList(LIKED_KEY);
  return liked.includes(productId);
};

// Hàm để lấy tất cả lịch sử
export const getViewHistory = () => getProductList(VIEWED_KEY);
export const getLikedProducts = () => getProductList(LIKED_KEY);
