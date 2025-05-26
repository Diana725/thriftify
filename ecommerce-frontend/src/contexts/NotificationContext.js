// src/contexts/NotificationContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext();
const STORAGE_KEY = "my-notifs";

export function NotificationProvider({ children }) {
  const [notifications, _setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));

  // wrap setNotifications so we always persist
  const setNotifications = (next) => {
    _setNotifications(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUnreadCount(next.filter((n) => !n.read).length);
  };

  // hydrate once on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    _setNotifications(saved);
    setUnreadCount(saved.filter((n) => !n.read).length);
  }, []);

  // subscribe to Pusher events
  useEffect(() => {
    if (!user || !window.Echo) return;
    const channel = window.Echo.private(`orders.${user.id}`);
    channel.listen(".order.status.updated", (e) => {
      const message = `Order #${e.id} status changed to ${
        e.status.charAt(0).toUpperCase() + e.status.slice(1)
      }`;
      const newNotif = {
        id: Date.now(),
        message,
        timestamp: new Date().toLocaleString(),
        read: false,
      };
      setNotifications([newNotif, ...notifications]);
    });
    return () => window.Echo.leave(`orders.${user.id}`);
  }, [user, notifications]);

  // only mark read, don’t remove
  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // clear out read ones (call on dropdown close)
  const clearReadNotifications = () => {
    setNotifications(notifications.filter((n) => !n.read));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllRead,
        clearReadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
