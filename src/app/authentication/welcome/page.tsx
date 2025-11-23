"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Award,
  Users,
  TrendingUp,
  Zap,
  Globe,
  MessageCircle,
  Headphones,
  CheckCircle,
  X,
  Menu,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function EvolingoWelcome() {
  const [scrollY, setScrollY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Khóa học đa dạng",
      desc: "Từ vựng, ngữ pháp, luyện đề TOEIC/IELTS với nội dung chuẩn quốc tế",
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Luyện nghe & viết",
      desc: "Phát triển kỹ năng toàn diện qua video, podcast và bài tập tương tác",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Theo dõi tiến trình",
      desc: "Biểu đồ chi tiết, streak học tập, gợi ý cá nhân hóa theo trình độ",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Cộng đồng sôi động",
      desc: "Tạo nhóm học tập, thi đấu thành tích, trao đổi kiến thức cùng bạn bè",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Flashcard thông minh",
      desc: "Spaced Repetition giúp ghi nhớ từ vựng hiệu quả và lâu dài",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Đa nền tảng",
      desc: "Học mọi lúc, mọi nơi với đồng bộ đa thiết bị tự động",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Đăng ký tài khoản",
      desc: "Tạo tài khoản miễn phí trong 30 giây",
    },
    {
      step: "02",
      title: "Chọn khóa học",
      desc: "Lựa chọn khóa học phù hợp với trình độ",
    },
    {
      step: "03",
      title: "Học và thực hành",
      desc: "Học theo lộ trình cá nhân hóa",
    },
    {
      step: "04",
      title: "Đạt mục tiêu",
      desc: "Nâng cao trình độ tiếng Anh của bạn",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "Sinh viên",
      content:
        "Tôi đã cải thiện TOEIC từ 650 lên 850 chỉ sau 3 tháng. Lộ trình học rất khoa học!",
      avatar: "👩‍🎓",
    },
    {
      name: "Trần Hoàng Long",
      role: "Nhân viên văn phòng",
      content:
        "Flashcard với Spaced Repetition giúp tôi nhớ từ vựng rất nhanh. Cộng đồng rất tích cực!",
      avatar: "👨‍💼",
    },
    {
      name: "Lê Thị Hương",
      role: "Giáo viên",
      content:
        "Nội dung phong phú, giao diện đẹp. Tôi giới thiệu cho tất cả học sinh của mình!",
      avatar: "👩‍🏫",
    },
  ];

  const faqs = [
    {
      q: "Evolingo có miễn phí không?",
      a: "Chúng tôi có gói miễn phí với các tính năng cơ bản. Các khóa học nâng cao sẽ có chi phí hợp lý.",
    },
    {
      q: "Tôi có thể học trên điện thoại không?",
      a: "Có, Evolingo hỗ trợ đầy đủ trên web, iOS và Android với đồng bộ tự động.",
    },
    {
      q: "Làm thế nào để theo dõi tiến trình học?",
      a: "Hệ thống tự động theo dõi và hiển thị biểu đồ tiến độ, streak, số từ đã học chi tiết.",
    },
    {
      q: "Có chứng chỉ sau khi hoàn thành khóa học không?",
      a: "Có, bạn sẽ nhận chứng chỉ điện tử khi hoàn thành mỗi khóa học.",
    },
  ];

  const stats = [
    { number: "50K+", label: "Học viên" },
    { number: "100+", label: "Khóa học" },
    { number: "10K+", label: "Bài học" },
    { number: "98%", label: "Hài lòng" },
  ];

  const Modal = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-3xl">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={() => setShowModal(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-40 transition-all duration-300 ${
          scrollY > 50
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => scrollToSection("hero")}
            >
              <BookOpen className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">Evolingo</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Về chúng tôi
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Tính năng
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Cách hoạt động
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Liên hệ
              </button>
              <button
                onClick={() => (window.location.href = "/authentication/login")}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Đăng nhập
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-900" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection("about")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg"
              >
                Về chúng tôi
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg"
              >
                Tính năng
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg"
              >
                Cách hoạt động
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg"
              >
                Liên hệ
              </button>
              <button
                onClick={() => (window.location.href = "/login")}
                className="block w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg text-center"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 left-10 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{
              transform: `translateY(${scrollY * -0.15}px)`,
              animationDelay: "1s",
            }}
          ></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-block mb-6 px-6 py-2 bg-green-100 rounded-full border-2 border-green-300 shadow-lg">
            <span className="text-green-700 font-semibold text-sm sm:text-base flex items-center gap-2">
              <Award className="w-5 h-5" />
              Nền tảng học tiếng Anh trực tuyến hàng đầu Việt Nam
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 mb-6 leading-tight">
            Tiến hóa tiếng Anh
            <br />
            <span className="text-4xl sm:text-5xl lg:text-6xl">
              cùng Evolingo
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            Học thông minh hơn với AI, kết nối cộng đồng học viên, nâng cao
            trình độ tiếng Anh từ cơ bản đến nâng cao
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => (window.location.href = "/authentication/login")}
              className="group relative px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Đăng nhập ngay
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>

            <button
              onClick={() => scrollToSection("about")}
              className="px-10 py-5 bg-white text-green-600 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-green-200 flex items-center gap-2"
            >
              Tìm hiểu thêm
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-green-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-green-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-green-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
                Về Evolingo
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                <strong className="text-green-600">Evolingo</strong> là nền tảng
                học tiếng Anh trực tuyến tiên tiến nhất Việt Nam, được thiết kế
                để giúp học viên <strong>tiến hóa</strong> kỹ năng ngôn ngữ một
                cách tự nhiên và hiệu quả.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Với công nghệ AI thông minh, phương pháp học Spaced Repetition
                và cộng đồng học viên sôi động, chúng tôi cam kết mang đến trải
                nghiệm học tập tối ưu cho mọi trình độ.
              </p>
              <div className="space-y-4">
                {[
                  "Nội dung được biên soạn bởi chuyên gia",
                  "Lộ trình học cá nhân hóa với AI",
                  "Cộng đồng học viên 50,000+",
                  "Hỗ trợ 24/7 từ đội ngũ giáo viên",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center p-8">
                    <BookOpen className="w-32 h-32 mx-auto mb-6 opacity-90" />
                    <p className="text-2xl font-bold">
                      Hơn 50,000 học viên tin tưởng
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-green-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600">
              Trải nghiệm học tập toàn diện và hiệu quả
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-green-200"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-xl text-gray-600">
              Bắt đầu hành trình học tập chỉ với 4 bước đơn giản
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 text-center border-2 border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="text-6xl font-extrabold text-green-600 mb-4 opacity-20">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg
                      className="w-8 h-8 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Học viên nói gì về chúng tôi
            </h2>
            <p className="text-xl text-gray-600">
              Hàng nghìn câu chuyện thành công
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((testimonial, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-3xl p-10 shadow-xl max-w-3xl mx-auto border-2 border-green-100">
                      <div className="flex items-center mb-6">
                        <div className="text-5xl mr-4">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">
                            {testimonial.name}
                          </h4>
                          <p className="text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-lg text-gray-700 leading-relaxed italic">
                        "{testimonial.content}"
                      </p>
                      <div className="flex gap-1 mt-6">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-6 h-6 text-yellow-400 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? "bg-green-600 w-8" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Câu hỏi thường gặp
            </h2>
            <p className="text-xl text-gray-600">
              Giải đáp mọi thắc mắc của bạn
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 overflow-hidden"
              >
                <button
                  onClick={() => setActiveTab(activeTab === idx ? -1 : idx)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-green-100/50 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-green-600 transition-transform ${
                      activeTab === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeTab === idx && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-green-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Liên hệ với chúng tôi
            </h2>
            <p className="text-xl text-gray-600">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-lg text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">support@evolingo.vn</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hotline</h3>
              <p className="text-gray-600">1900 xxxx</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Địa chỉ</h3>
              <p className="text-gray-600">Hồ Chí Minh, Việt Nam</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Sẵn sàng bắt đầu hành trình?
          </h2>
          <p className="text-xl text-green-50 mb-10">
            Tham gia cùng hàng nghìn học viên đã chinh phục tiếng Anh thành công
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-12 py-6 bg-white text-green-600 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          >
            Bắt đầu học ngay - Miễn phí
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold">Evolingo</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Nền tảng học tiếng Anh trực tuyến hàng đầu Việt Nam. Tiến hóa kỹ
                năng ngôn ngữ của bạn mỗi ngày.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Về Evolingo</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    Giới thiệu
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    Tính năng
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    Cách hoạt động
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    Đội ngũ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Pháp lý</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setShowModal("terms")}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    Điều khoản
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowModal("privacy")}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    Bảo mật
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    Chính sách hoàn tiền
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    Liên hệ
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 Evolingo. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showModal === "terms" && (
        <Modal title="Điều khoản sử dụng">
          <div className="prose prose-green max-w-none">
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              1. Chấp nhận điều khoản
            </h4>
            <p className="text-gray-700 mb-4">
              Bằng việc truy cập và sử dụng nền tảng Evolingo, bạn đồng ý tuân
              theo các điều khoản và điều kiện được quy định dưới đây.
            </p>

            <h4 className="text-xl font-bold text-gray-900 mb-4">
              2. Tài khoản người dùng
            </h4>
            <p className="text-gray-700 mb-4">
              Bạn có trách nhiệm bảo mật thông tin tài khoản và mật khẩu của
              mình. Mọi hoạt động thực hiện dưới tài khoản của bạn là trách
              nhiệm của bạn.
            </p>

            <h4 className="text-xl font-bold text-gray-900 mb-4">
              3. Nội dung và bản quyền
            </h4>
            <p className="text-gray-700 mb-4">
              Tất cả nội dung trên Evolingo bao gồm văn bản, hình ảnh, video, âm
              thanh đều thuộc quyền sở hữu của Evolingo hoặc các đối tác có bản
              quyền.
            </p>

            <h4 className="text-xl font-bold text-gray-900 mb-4">
              4. Thanh toán và hoàn tiền
            </h4>
            <p className="text-gray-700 mb-4">
              Các giao dịch thanh toán được xử lý an toàn qua cổng thanh toán
              của bên thứ ba. Chính sách hoàn tiền được áp dụng theo từng trường
              hợp cụ thể.
            </p>

            <h4 className="text-xl font-bold text-gray-900 mb-4">
              5. Quyền và nghĩa vụ
            </h4>
            <p className="text-gray-700 mb-4">
              Evolingo có quyền thay đổi, tạm ngưng hoặc chấm dứt dịch vụ bất kỳ
              lúc nào. Người dùng có nghĩa vụ sử dụng dịch vụ đúng mục đích và
              tuân thủ pháp luật.
            </p>
          </div>
        </Modal>
      )}

      {showModal === "privacy" && (
        <Modal title="Chính sách bảo mật">
          <div className="prose prose-green max-w-none">
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              1. Thu thập thông tin
            </h4>
            <p className="text-gray-700 mb-4">
              Chúng tôi thu thập thông tin cá nhân như tên, email, số điện thoại
              khi bạn đăng ký tài khoản và sử dụng dịch vụ của chúng tôi.
            </p>

            <h4 className="text-xl font-bold text-gray-900 mb-4">
              2. Sử dụng thông tin
            </h4>
            <p className="text-gray-700 mb-4">
              Thông tin của bạn được sử dụng để cung cấp dịch vụ, cải thiện trải
              nghiệm người dùng, gửi thông báo về khóa học và các ưu đãi.
            </p>

            <h4 className="text-xl font-bold text-gray-900 mb-4">
              3. Bảo mật thông tin
            </h4>
            <p className="text-gray-700 mb-4">
              Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ thông
              tin cá nhân của bạn khỏi truy cập trái phép, mất mát hoặc tiết lộ.
            </p>

            <h4 className="text-xl font-bold text-gray-900 mb-4">
              4. Chia sẻ thông tin
            </h4>
            <p className="text-gray-700 mb-4">
              Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên
              thứ ba, trừ khi được yêu cầu bởi pháp luật hoặc với sự đồng ý của
              bạn.
            </p>

            <h4 className="text-xl font-bold text-gray-900 mb-4">
              5. Quyền của người dùng
            </h4>
            <p className="text-gray-700 mb-4">
              Bạn có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của
              mình bất kỳ lúc nào thông qua trang cài đặt tài khoản.
            </p>

            <h4 className="text-xl font-bold text-gray-900 mb-4">
              6. Cookie và công nghệ theo dõi
            </h4>
            <p className="text-gray-700 mb-4">
              Chúng tôi sử dụng cookie để cải thiện trải nghiệm người dùng và
              phân tích lưu lượng truy cập website.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
