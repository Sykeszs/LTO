// Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';

interface User {
  name?: string;
  email?: string;
}

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calendar');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (location.pathname.includes('appointments')) {
      setActiveTab('appointments');
    } else {
      setActiveTab('calendar');
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen max-h-screen min-w-screen max-w-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white p-6 flex flex-col justify-between">
          <div>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/dashboard"
                  className={`block py-2 px-4 rounded ${
                    activeTab === 'calendar' ? 'bg-gray-800' : 'hover:bg-gray-500'
                  }`}
                >
                  Calendar
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/appointments"
                  className={`block py-2 px-4 rounded ${
                    activeTab === 'appointments' ? 'bg-gray-800' : 'hover:bg-gray-500'
                  }`}
                >
                  My Appointments
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="flex h-[15%]">
        {/* Sidebar Footer */}
        <div className="w-64 bg-gray-900 text-white flex flex-col items-center justify-center">
          <button
            onClick={handleLogoutClick}
            className="bg-gray-800 hover:bg-gray-600 text-white w-full py-2 rounded text-sm"
          >
            Logout
          </button>
        </div>

        {/* Main Content Footer */}
        <div className="flex-1 bg-green-900 text-white flex items-center justify-center">
          <p className="text-sm">LTO NAIC ONLINE APPOINTMENT</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
