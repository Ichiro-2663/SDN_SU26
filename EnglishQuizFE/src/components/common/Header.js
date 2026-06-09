import React, { useState, useEffect, useRef, useContext } from "react";
import { Navbar, Nav, Container, NavDropdown, Badge } from "react-bootstrap";
import { FaBell } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useContext(AuthContext);
  const userName = user?.name || "Guest";

  const handleLogout = () => logout();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Navbar
      expand="lg"
      className="px-3 shadow-sm"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Container fluid>
        <Navbar.Brand className="fw-bold text-primary">
          English Quiz
        </Navbar.Brand>

        <Navbar.Collapse className="justify-content-end">
          <Nav className="align-items-center">

            {/* Notification */}
            <div className="position-relative me-3" ref={dropdownRef}>
              <FaBell
                style={{ cursor: "pointer" }}
                onClick={() => setIsOpen(!isOpen)}
              />
              {notifications.length > 0 && (
                <Badge bg="danger" pill>
                  {notifications.length}
                </Badge>
              )}

              {isOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: "10px",
                    width: "300px",
                    background: "white",
                    borderRadius: "10px",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="p-3 fw-bold border-bottom">
                    Notifications
                  </div>
                  <div className="p-3 text-muted text-center">
                    No notifications
                  </div>
                </div>
              )}
            </div>

            {/* User */}
            <NavDropdown title={userName} align="end">
              <NavDropdown.Item onClick={handleLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;