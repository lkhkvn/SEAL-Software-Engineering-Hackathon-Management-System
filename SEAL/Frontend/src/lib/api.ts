/**
 * Wrapper cho fetch API để tự động xử lý lỗi Token hết hạn (401 Unauthorized)
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);

  // Nếu Backend trả về 401 Unauthorized (Token hết hạn hoặc không hợp lệ)
  if (response.status === 401) {
    console.warn("Token expired or unauthorized. Redirecting to login...");
    
    // Xóa session cũ
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    // Thông báo cho user biết
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");

    // Điều hướng về trang login (cách an toàn nhất ngoài scope React component)
    window.location.href = "/login";
  }

  return response;
}
