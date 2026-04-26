import { create } from "zustand";

const useAppStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },
  
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => 
      n._id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
}));

export default useAppStore;
