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
      markAllRead();
    } else {
      clearReadNotifications();
    }
    setOpen(isOpen);
  };

  return (
    <Dropdown align="end" show={open} onToggle={handleToggle}>
      <Dropdown.Toggle
        variant="light"
        id="notif-dropdown"
        style={{ backgroundColor: "#f7f1e5", position: "relative" }} // 👈 add position: relative here
      >
        <BellFill
          size={20}
          style={{
            backgroundColor: "#f7f1e5",
            borderColor: "#4E5A56",
          }}
        />
        {unreadCount > 0 && (
          <Badge
            bg="#c96f56"
            pill
            className="position-absolute top-0 start-100 d-inline-flex justify-content-center align-items-center"
            style={{
              transform: "translate(-60%, -30%)",
              minWidth: "1.2rem",
              height: "1.2rem",
              fontSize: "0.75rem",
            }}
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
