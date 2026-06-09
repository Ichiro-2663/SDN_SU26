import React, { useState, useEffect, useRef, useContext } from "react";
import { Navbar, Nav, Container, NavDropdown, Badge } from "react-bootstrap";
import { FaBell } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to English Quiz!", time: "Just now", read: false },
    { id: 2, text: "You have a new practice test available.", time: "1 hour ago", read: false },
    { id: 3, text: "Your previous exam results are ready.", time: "1 day ago", read: true },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useContext(AuthContext);
  const userName = user?.name || "Guest";

  const handleLogout = () => logout();

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        position: "relative",
        zIndex: 9999,
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
                style={{ cursor: "pointer", fontSize: "1.2rem", color: "#555" }}
                onClick={() => setIsOpen(!isOpen)}
              />
              {unreadCount > 0 && (
                <Badge 
                  bg="danger" 
                  pill 
                  style={{ 
                    position: "absolute", 
                    top: "-8px", 
                    right: "-8px", 
                    fontSize: "0.6rem" 
                  }}
                >
                  {unreadCount}
                </Badge>
              )}

              {isOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: "10px",
                    width: "320px",
                    background: "white",
                    borderRadius: "10px",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
                    zIndex: 10000,
                  }}
                >
                  <div className="p-3 fw-bold border-bottom d-flex justify-content-between align-items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span 
                        style={{ fontSize: "0.8rem", cursor: "pointer", color: "#0d6efd", fontWeight: "normal" }}
                        onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                      >
                        Mark all as read
                      </span>
                    )}
                  </div>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-bottom ${notification.read ? "bg-light text-muted" : "bg-white"}`}
                          style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <span style={{ fontSize: "0.9rem", flex: 1 }}>{notification.text}</span>
                            {!notification.read && (
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0d6efd", marginTop: "6px", marginLeft: "10px", flexShrink: 0 }}></div>
                            )}
                          </div>
                          <div style={{ fontSize: "0.75rem", marginTop: "5px" }} className={notification.read ? "text-muted" : "text-primary"}>
                            {notification.time}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-muted text-center">
                        No notifications
                      </div>
                    )}
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