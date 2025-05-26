import React, { useState } from "react";
import { Badge, Dropdown } from "react-bootstrap";
import { BellFill } from "react-bootstrap-icons";
import { useNotifications } from "../contexts/NotificationContext";

export default function NotificationsBell() {
  const { notifications, unreadCount, markAllRead, clearReadNotifications } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const handleToggle = (isOpen) => {
    if (isOpen) {
      markAllRead(); // user is now viewing, mark them read
    } else {
      clearReadNotifications(); // user closed dropdown → remove read
    }
    setOpen(isOpen);
  };

  return (
    <Dropdown align="end" show={open} onToggle={handleToggle}>
      <Dropdown.Toggle
        variant="light"
        id="notif-dropdown"
        style={{ backgroundColor: "#f7f1e5" }}
      >
        <BellFill
          size={20}
          style={{ backgroundColor: "#f7f1e5", borderColor: "#f7f1e5" }}
        />
        {unreadCount > 0 && (
          <Badge
            bg="#c96f56"
            pill
            className="position-absolute top-0 start-60 down-2 translate-middle"
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: 300 }}>
        {notifications.length === 0 ? (
          <Dropdown.ItemText className="text-center text-muted">
            No notifications
          </Dropdown.ItemText>
        ) : (
          notifications.map((n) => (
            <Dropdown.ItemText
              key={n.id}
              className={!n.read ? "fw-bold" : undefined}
            >
              <div>{n.message}</div>
              <small className="text-muted">{n.timestamp}</small>
            </Dropdown.ItemText>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
