import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import AdminDashboard from '../components/AdminDashboard';
import AdminUsers from '../components/AdminUsers';
import AdminCommunities from '../components/AdminCommunities';
import AdminPosts from '../components/AdminPosts';
import AdminModeration from '../components/AdminModeration';

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Login kontrolü
    const accessToken = localStorage.getItem('accessToken');
    const currentUser = localStorage.getItem('currentUser');

    if (!accessToken || !currentUser) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(currentUser);
      // Admin paneline sadece admin ve moderator erişebilir
      if (user.role !== 'admin' && user.role !== 'moderator') {
        navigate('/');
        return;
      }
      setLoading(false);
    } catch (err) {
      console.error('User data parse error:', err);
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Backend logout endpoint'ine istek gönder
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Sonra localStorage temizle
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      navigate('/login');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsers />;
      case 'communities':
        return <AdminCommunities />;
      case 'posts':
        return <AdminPosts />;
      case 'moderation':
        return <AdminModeration />;
      default:
        return <AdminDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex pt-20">
        {/* Sidebar */}
        <div className={`fixed left-0 top-20 h-[calc(100vh-80px)] bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'}`}>
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} onLogout={handleLogout} />
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;