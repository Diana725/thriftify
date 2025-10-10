import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { QuestionCircleFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

export default function HelpMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown align="end" show={open} onToggle={setOpen}>
      <Dropdown.Toggle
        variant="light"
        id="help-dropdown"
        aria-label="Help & Support"
        style={{ backgroundColor: "#f7f1e5", position: "relative" }}
      >
        <QuestionCircleFill
          size={20}
          style={{ backgroundColor: "#f7f1e5", borderColor: "#f7f1e5" }}
        />
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: 220 }}>
        <Dropdown.Item as={Link} to="/contact" onClick={() => setOpen(false)}>
          Contact Us
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
