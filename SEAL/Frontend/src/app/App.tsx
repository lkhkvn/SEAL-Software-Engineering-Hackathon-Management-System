import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { EventsPage } from './components/EventsPage';
import { EventDetailPage } from './components/EventDetailPage';
import { TeamsPage } from './components/TeamsPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { AdminPage } from './components/AdminPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ProfilePage } from './components/ProfilePage';
import { JudgingPage } from './components/JudgingPage';
import { JudgingTeamsPage } from './components/JudgingTeamsPage';
import { JudgingDetailPage } from './components/JudgingDetailPage';
import { SubmissionPage } from './components/SubmissionPage';

// Component Layout chung bọc thanh điều hướng Navigation
function MainLayout({ currentUser, onLogout }: { currentUser: any, onLogout: () => void }) {
  return (
    <>
      <Navigation currentUser={currentUser} onLogout={onLogout} />
      <Outlet /> {/* Khu vực hiển thị nội dung của các trang con */}
    </>
  );
}

// Hợp nhất các tuyến đường vào đây để sử dụng được hook useNavigate() hợp lệ của React Router
function AppRoutes() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Xử lý khi đăng nhập thành công từ API Backend
  const handleLoginSuccess = (userData: any) => {
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log("Đăng nhập thành công! Dữ liệu User:", userData);
    
    // Điều hướng về trang chủ sau khi xác thực thành công
    navigate('/');
  };

  // Xử lý khi đăng xuất
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    console.log("Đã đăng xuất khỏi hệ thống!");
    navigate('/login');
  };

  return (
    <Routes>
      {/* Nhóm 1: Các trang CÓ hiển thị thanh Navigation phía trên */}
      <Route element={<MainLayout currentUser={currentUser} onLogout={handleLogout} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/judging" element={<JudgingPage />} />
        <Route path="/judging/hackathon/:hackathonId" element={<JudgingTeamsPage />} />
        <Route path="/judging/hackathon/:hackathonId/team/:teamId" element={<JudgingDetailPage />} />
        <Route path="/submit" element={<SubmissionPage />} />
        <Route path="/admin" element={<AdminPage currentUser={currentUser} onLogout={handleLogout} />} />
      </Route>

      {/* Nhóm 2: Các trang KHÔNG hiển thị thanh Navigation (Ẩn hoàn toàn) */}
      <Route 
        path="/login" 
        element={
          <LoginPage 
            onNavigateToRegister={() => navigate('/register')} 
            onLoginSuccess={handleLoginSuccess} // Đã bổ sung prop này để fix triệt để lỗi gạch đỏ TypeScript
          />
        } 
      />
      <Route 
        path="/register" 
        element={
          <RegisterPage 
            onNavigateToLogin={() => navigate('/login')} 
          />
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </Router>
  );
}