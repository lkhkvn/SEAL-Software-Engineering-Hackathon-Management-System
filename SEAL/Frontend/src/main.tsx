
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Global Fetch Interceptor
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const response = await originalFetch(input, init);
  if (response.status === 401) {
    console.warn("Global Intercept: Token expired or unauthorized. Redirecting to login...");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    // Chỉ alert nếu chưa ở trang login
    if (window.location.pathname !== '/login') {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      window.location.href = "/login";
    }
  }
  return response;
};

createRoot(document.getElementById("root")!).render(<App />);
  