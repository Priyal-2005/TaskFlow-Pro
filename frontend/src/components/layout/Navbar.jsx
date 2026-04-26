import { useState, useEffect } from "react";
import { Bell, User } from "lucide-react";
import useAuthStore from "../../store/authStore";
import useAppStore from "../../store/appStore";
import api from "../../services/api";

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const { notifications, unreadCount, setNotifications, markAsRead } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        setNotifications(data.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();
  }, [setNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      markAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} New
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`p-3 text-sm border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${notif.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                      onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                    >
                      <p className="text-gray-800">{notif.message}</p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-1">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
