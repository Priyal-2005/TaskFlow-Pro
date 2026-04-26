import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Bell, LogOut } from "lucide-react";
import useAuthStore from "../../store/authStore";
import useAppStore from "../../store/appStore";

export function Sidebar() {
  const { pathname } = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const unreadCount = useAppStore((state) => state.unreadCount);

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "My Tasks", href: "/tasks", icon: CheckSquare },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <CheckSquare size={18} className="text-white" />
          </div>
          TaskFlow Pro
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
          Overview
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              to={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}
