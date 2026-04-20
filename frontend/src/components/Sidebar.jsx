import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogoProfManager } from "../App";
import "./Sidebar.css";

const IconClasses = () => (
  <svg className="sidebar-link-icon" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V9.75a2.25 2.25 0 0 0-2.25-2.25H9.75Z"
    />
  </svg>
);

const IconStudents = () => (
  <svg className="sidebar-link-icon" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);

const IconSessions = () => (
  <svg className="sidebar-link-icon" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </svg>
);

const IconCalc = () => (
  <svg className="sidebar-link-icon" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm2.498-4.501h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm2.504-4.501h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm2.498-4.501h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z"
    />
  </svg>
);

const IconLogout = () => (
  <svg
    className="sidebar-link-icon"
    style={{ width: 17, height: 17 }}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
    />
  </svg>
);

const Sidebar = ({ onLogout }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: t("Gestion des classes"), path: "/classes", icon: <IconClasses /> },
    {
      name: t("Gestion des étudiants"),
      path: "/etudiants",
      icon: <IconStudents />,
    },
    {
      name: t("Gestion des sessions"),
      path: "/sessions",
      icon: <IconSessions />,
    },
    {
      name: t("Calculateur de Notes"),
      path: "/calculateur-notes",
      icon: <IconCalc />,
    },
  ];

  return (
    <aside className="sidebar-glossy">
      {/* ── Brand avec logo ─────────────────────────────── */}
      <div
        className="sidebar-brand-wrap"
        onClick={() => navigate("/dashboard")}
        style={{ cursor: "pointer" }}
      >
        <LogoProfManager size={36} />
        <span className="sidebar-brand">ProfManager</span>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`sidebar-link ${location.pathname === item.path ? "sidebar-link-active" : ""}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </div>
        ))}
      </nav>

      {/* ── Logout ──────────────────────────────────────── */}
      <div className="sidebar-bottom">
        <button className="sidebar-logout" onClick={onLogout}>
          <IconLogout />
          <span>{t("Déconnexion")}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
