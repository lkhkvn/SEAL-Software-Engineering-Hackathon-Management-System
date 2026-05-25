import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess?: () => void; // Thêm callback tùy chọn sau khi đăng ký thành công
}

export function RegisterPage({
  onNavigateToLogin,
  onRegisterSuccess,
}: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    agreeTerms: false,
  });

  // Trạng thái xử lý API
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert("Vui lòng đồng ý với điều khoản dịch vụ.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Đã cập nhật URL gọn sạch, khớp chính xác với bộ định tuyến Router của index.php mới
      const response = await fetch(
        "http://localhost:8000/index.php/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Map 'fullName' từ giao diện thành 'username' gửi lên DTO của Backend
          body: JSON.stringify({
            username: formData.fullName,
            email: formData.email,
            password: formData.password,
          }),
        },
      );

      const result = await response.json();

      // Kiểm tra phản hồi lỗi từ hệ thống
      if (!response.ok || result.status === "error") {
        throw new Error(
          result.message || "Đăng ký thất bại. Vui lòng thử lại!",
        );
      }

      // Đăng ký thành công
      setSuccessMsg("Đăng ký tài khoản thành công! Đang chuyển hướng...");

      // Tự động chuyển hướng sang trang đăng nhập sau 2 giây
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else {
          onNavigateToLogin();
        }
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto w-full max-w-md">
        <div className="flex justify-center text-blue-600 font-bold text-3xl mb-2 tracking-wider">
          SEAL
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Tạo tài khoản mới của bạn
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <button
            onClick={onNavigateToLogin}
            disabled={isLoading}
            type="button"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            Đăng nhập ngay
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-200">
          {/* Thông báo lỗi từ Backend (Lỗi trùng email, thiếu ký tự...) */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {/* Thông báo thành công */}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Họ và tên */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Họ và tên
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  disabled={isLoading}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Địa chỉ Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={isLoading}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Tối thiểu 6 ký tự"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Điều khoản sử dụng */}
            <div className="flex items-center">
              <input
                id="agree-terms"
                type="checkbox"
                required
                disabled={isLoading}
                checked={formData.agreeTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeTerms: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label
                htmlFor="agree-terms"
                className="ml-2 block text-sm text-gray-900"
              >
                Tôi đồng ý với{" "}
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Chính sách bảo mật
                </a>
              </label>
            </div>

            {/* Nút Đăng Ký */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
