import React, { createContext, useCallback, useMemo, useState } from 'react';

export const UIContext = createContext({
  notifications: [],
  pushNotification: () => {},
  removeNotification: () => {}
});

let notificationId = 0;

export const UIProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const pushNotification = useCallback((notification) => {
    notificationId += 1;
    const item = {
      id: notificationId,
      title: notification.title,
      message: notification.message,
      status: notification.status || 'info',
      duration: notification.duration || 4000
    };
    setNotifications((prev) => [...prev, item]);
    if (item.duration) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== item.id));
      }, item.duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      pushNotification,
      removeNotification
    }),
    [notifications, pushNotification, removeNotification]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
