"use client";
import React, { useState } from "react";
import {
    CreditCard,
    Lock,
    CheckCircle2,
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    ArrowLeft,
    Shield,
    Award,
    Clock,
    Users,
    Star,
    Sparkles,
    Gift,
    Zap,
} from "lucide-react";

interface Course {
    id: number;
    name: string;
    company: string;
    image: string;
    currentPrice: number;
    originalPrice: number;
    savings: number;
    discountPercentage: number;
    rating: number;
    salesCount: number;
    description: string;
    duration: string;
    lessons: number;
    students: number;
    features: string[];
}

// Sample course data
const SAMPLE_COURSE: Course = {
    id: 1,
    name: "IELTS 5.5 - 6.5",
    company: "IELTS",
    image: "/images/ielts55.png",
    currentPrice: 1350000,
    originalPrice: 1500000,
    savings: 150000,
    discountPercentage: 10,
    rating: 4.8,
    salesCount: 482,
    description:
        "Khóa học IELTS chuyên sâu giúp bạn đạt điểm từ 5.5 đến 6.5. Học với giáo viên bản ngữ, tài liệu chuẩn Cambridge, luyện thi 4 kỹ năng toàn diện.",
    duration: "3 tháng",
    lessons: 48,
    students: 1250,
    features: [
        "48 buổi học trực tuyến với giáo viên",
        "Tài liệu học tập độc quyền",
        "Chấm chữa bài tập hàng tuần",
        "Mock test hàng tháng",
        "Hỗ trợ 24/7 qua chat",
        "Chứng nhận hoàn thành khóa học",
    ],
};

export default function PaymentPage() {
    const [selectedCourse] = useState<Course>(SAMPLE_COURSE);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "momo" | "bank">(
        "card"
    );
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
        promoCode: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setStep(3);
        }, 2000);
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString("vi-VN") + " VND";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 animate-fadeIn">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-4 group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Quay lại danh sách khóa học</span>
                    </button>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Thanh toán khóa học
                    </h1>
                    <p className="text-gray-600">
                        Hoàn tất thanh toán để bắt đầu hành trình học tập của bạn
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {[
                            { num: 1, label: "Thông tin" },
                            { num: 2, label: "Thanh toán" },
                            { num: 3, label: "Hoàn tất" },
                        ].map((item, idx) => (
                            <React.Fragment key={item.num}>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${step >= item.num
                                                ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-110"
                                                : "bg-gray-200 text-gray-500"
                                            }`}
                                    >
                                        {step > item.num ? (
                                            <CheckCircle2 className="w-6 h-6" />
                                        ) : (
                                            item.num
                                        )}
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${step >= item.num ? "text-green-600" : "text-gray-500"
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                                {idx < 2 && (
                                    <div
                                        className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${step > item.num
                                                ? "bg-gradient-to-r from-green-500 to-blue-500"
                                                : "bg-gray-200"
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {step === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Personal Information */}
                                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Thông tin cá nhân
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Họ và tên
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={(e) =>
                                                        handleInputChange("fullName", e.target.value)
                                                    }
                                                    placeholder="Nguyễn Văn A"
                                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) =>
                                                            handleInputChange("email", e.target.value)
                                                        }
                                                        placeholder="example@email.com"
                                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Số điện thoại
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) =>
                                                            handleInputChange("phone", e.target.value)
                                                        }
                                                        placeholder="0123456789"
                                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Địa chỉ
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                                <textarea
                                                    value={formData.address}
                                                    onChange={(e) =>
                                                        handleInputChange("address", e.target.value)
                                                    }
                                                    placeholder="Nhập địa chỉ của bạn"
                                                    rows={3}
                                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Tiếp tục
                                    <Zap className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Payment Method Selection */}
                                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                                            <CreditCard className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Phương thức thanh toán
                                        </h2>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                                        {[
                                            { id: "card", label: "Thẻ tín dụng", icon: CreditCard },
                                            { id: "momo", label: "MoMo", icon: Phone },
                                            { id: "bank", label: "Chuyển khoản", icon: MapPin },
                                        ].map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() =>
                                                    setPaymentMethod(method.id as typeof paymentMethod)
                                                }
                                                className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${paymentMethod === method.id
                                                        ? "border-green-500 bg-green-50 shadow-lg scale-105"
                                                        : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <method.icon
                                                    className={`w-8 h-8 ${paymentMethod === method.id
                                                            ? "text-green-600"
                                                            : "text-gray-400"
                                                        }`}
                                                />
                                                <span
                                                    className={`font-semibold ${paymentMethod === method.id
                                                            ? "text-green-600"
                                                            : "text-gray-700"
                                                        }`}
                                                >
                                                    {method.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {paymentMethod === "card" && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Số thẻ
                                                </label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.cardNumber}
                                                        onChange={(e) =>
                                                            handleInputChange("cardNumber", e.target.value)
                                                        }
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength={19}
                                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Tên chủ thẻ
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.cardName}
                                                    onChange={(e) =>
                                                        handleInputChange("cardName", e.target.value)
                                                    }
                                                    placeholder="NGUYEN VAN A"
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all uppercase"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Ngày hết hạn
                                                    </label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            value={formData.expiryDate}
                                                            onChange={(e) =>
                                                                handleInputChange("expiryDate", e.target.value)
                                                            }
                                                            placeholder="MM/YY"
                                                            maxLength={5}
                                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        CVV
                                                    </label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            value={formData.cvv}
                                                            onChange={(e) =>
                                                                handleInputChange("cvv", e.target.value)
                                                            }
                                                            placeholder="123"
                                                            maxLength={3}
                                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === "momo" && (
                                        <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200">
                                            <div className="text-center space-y-4">
                                                <div className="w-32 h-32 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center">
                                                    <div className="text-6xl">📱</div>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    Quét mã QR để thanh toán
                                                </h3>
                                                <p className="text-gray-600">
                                                    Mở ứng dụng MoMo và quét mã QR bên dưới
                                                </p>
                                                <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                                                    <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                                                        <span className="text-gray-400">QR Code</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === "bank" && (
                                        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                                Thông tin chuyển khoản
                                            </h3>
                                            <div className="space-y-3 bg-white p-4 rounded-xl">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Ngân hàng:</span>
                                                    <span className="font-semibold">
                                                        Vietcombank - Chi nhánh TP.HCM
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Số tài khoản:</span>
                                                    <span className="font-semibold font-mono">
                                                        1234567890
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Chủ tài khoản:</span>
                                                    <span className="font-semibold">
                                                        CONG TY ENGLISH WEB
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Nội dung:</span>
                                                    <span className="font-semibold text-green-600">
                                                        THANHTOAN {selectedCourse.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-50 transition-all duration-300"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handlePayment}
                                        disabled={isProcessing}
                                        className="flex-1 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-5 h-5" />
                                                Thanh toán ngay
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Security Badge */}
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    <span>
                                        Thanh toán được bảo mật bởi SSL 256-bit encryption
                                    </span>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-fadeIn">
                                <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100 text-center">
                                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
                                        <CheckCircle2 className="w-12 h-12 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                        Thanh toán thành công! 🎉
                                    </h2>
                                    <p className="text-gray-600 mb-8 text-lg">
                                        Chúc mừng bạn đã đăng ký khóa học thành công. Hãy bắt đầu
                                        hành trình học tập của bạn ngay hôm nay!
                                    </p>

                                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-gray-600">Mã đơn hàng:</span>
                                            <span className="font-bold text-green-600">
                                                #DH{Date.now().toString().slice(-8)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-gray-600">Khóa học:</span>
                                            <span className="font-semibold">
                                                {selectedCourse.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Số tiền:</span>
                                            <span className="font-bold text-2xl text-green-600">
                                                {formatPrice(selectedCourse.currentPrice)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button className="flex-1 py-4 border-2 border-green-500 text-green-600 font-bold text-lg rounded-xl hover:bg-green-50 transition-all duration-300">
                                            Xem hóa đơn
                                        </button>
                                        <button className="flex-1 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                            Bắt đầu học ngay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 sticky top-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                Thông tin đơn hàng
                            </h3>

                            {/* Course Card */}
                            <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                                <div className="flex gap-4 mb-4">
                                    <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                                        <img
                                            src={selectedCourse.image}
                                            alt={selectedCourse.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-green-600 font-semibold mb-1">
                                            {selectedCourse.company}
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-1">
                                            {selectedCourse.name}
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-semibold">
                                                {selectedCourse.rating}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ({selectedCourse.salesCount})
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Features */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4 text-green-600" />
                                        <span>{selectedCourse.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Award className="w-4 h-4 text-green-600" />
                                        <span>{selectedCourse.lessons} bài học</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Users className="w-4 h-4 text-green-600" />
                                        <span>{selectedCourse.students} học viên</span>
                                    </div>
                                </div>
                            </div>

                            {/* Promo Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mã giảm giá
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.promoCode}
                                            onChange={(e) =>
                                                handleInputChange("promoCode", e.target.value)
                                            }
                                            placeholder="Nhập mã"
                                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <button className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all">
                                        Áp dụng
                                    </button>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-200">
                                <div className="flex justify-between text-gray-600">
                                    <span>Giá gốc:</span>
                                    <span className="line-through">
                                        {formatPrice(selectedCourse.originalPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-green-600 font-semibold">
                                    <span>Giảm giá ({selectedCourse.discountPercentage}%):</span>
                                    <span>-{formatPrice(selectedCourse.savings)}</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-bold text-gray-900">
                                        Tổng cộng:
                                    </span>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                            {formatPrice(selectedCourse.currentPrice)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Đã bao gồm VAT
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-green-600" />
                                    <h4 className="font-bold text-gray-900">
                                        Quyền lợi của bạn
                                    </h4>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {selectedCourse.features.slice(0, 4).map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
        </div>
    );
}
