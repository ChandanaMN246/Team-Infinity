import React from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon, FolderIcon, ClipboardDocumentListIcon, UserIcon, ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const navLinks = [
  { name: "Dashboard", icon: HomeIcon, to: "/dashboard" },
  { name: "Projects", icon: FolderIcon, to: "/projects" },
  // { name: "Tasks", icon: ClipboardDocumentListIcon, to: "/tasks" },
  // { name: "Profile", icon: UserIcon, to: "/profile" },
];

export default function Sidebar({ user, logout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">DevHub</div>
        {user?.avatarUrl
          ? <img src={user.avatarUrl} alt="avatar" className="avatar" />
          : <UserCircleIcon className="avatar placeholder-avatar" />}
        <div className="user-name">{user?.username || "User"}</div>
        <div className="user-email">{user?.email || "user@email.com"}</div>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navLinks.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                title={item.name}
              >
                <item.icon className="nav-icon" />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button
          onClick={logout}
          className="logout-btn"
          title="Logout"
        >
          <ArrowLeftOnRectangleIcon className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>
      <div className="copyright">
        DevHub &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
} 