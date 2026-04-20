import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./i18n";
import Sidebar from "./components/Sidebar";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/Profile";
import GestionClasses from "./pages/GestionClasses";
import AjouterClasse from "./pages/AjouterClasse";
import ModifierClasse from "./pages/ModifierClasse";
import GestionEtudiants from "./pages/GestionEtudiants";
import AjouterEtudiant from "./pages/AjouterEtudiant";
import ModifierEtudiant from "./pages/ModifierEtudiant";
import GestionSessions from "./pages/GestionSessions";
import DemarrerSession from "./pages/DemarrerSession";
import EvaluationSession from "./pages/EvaluationSession";
import HistoriqueEtudiant from "./pages/HistoriqueEtudiant";
import CalculateurNotes from "./pages/CalculateurNotes";
import Dashboard from "./pages/Dashboard";
import "./App.css";

const SIDEBAR_W = 260;
const TOPBAR_H = 56;
const MOBILE_BP = 768;

export const LogoProfManager = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <rect width="100" height="100" rx="20" fill="#344C3D" />
    <rect x="22" y="18" width="14" height="64" rx="4" fill="#BFCFBB" />
    <rect x="36" y="18" width="38" height="13" rx="3" fill="#8EA58C" />
    <rect x="74" y="18" width="13" height="44" rx="3" fill="#8EA58C" />
    <rect x="36" y="49" width="38" height="13" rx="3" fill="#8EA58C" />
    <rect x="36" y="31" width="10" height="18" rx="2" fill="#344C3D" />
    <rect
      x="22"
      y="88"
      width="56"
      height="4"
      rx="2"
      fill="#738A6E"
      opacity="0.7"
    />
  </svg>
);

const IconGlobe = () => (
  <svg className="lang-btn-icon" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.284 14.253A8.959 8.959 0 0 1 3 12c0-1.21.24-2.367.668-3.427"
    />
  </svg>
);
const IconUser = () => (
  <svg
    style={{
      width: 15,
      height: 15,
      stroke: "currentColor",
      fill: "none",
      strokeWidth: 1.6,
    }}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
);
const IconLogoutSmall = () => (
  <svg
    style={{
      width: 15,
      height: 15,
      stroke: "currentColor",
      fill: "none",
      strokeWidth: 1.6,
    }}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
    />
  </svg>
);
const IconMenu = () => (
  <svg
    style={{
      width: 20,
      height: 20,
      stroke: "currentColor",
      fill: "none",
      strokeWidth: 2,
    }}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);
const IconClose = () => (
  <svg
    style={{
      width: 20,
      height: 20,
      stroke: "currentColor",
      fill: "none",
      strokeWidth: 2,
    }}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);

/* ── Vérification JWT ───────────────────────────────────── */
const checkToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem("token");
    return false;
  }
};

/* ── Hook mobile ────────────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BP);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BP);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

/* ════════════════════════════════════════════════════════════
   AppContent
   ════════════════════════════════════════════════════════════ */
function AppContent() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const isMobile = useIsMobile();

  const [isAuthenticated, setIsAuthenticated] = useState(checkToken());
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAr = i18n.language === "ar";
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const showSidebar = isAuthenticated && !isAuthPage;

  /* Sync dir/lang + vérif token à chaque navigation */
  useEffect(() => {
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
    const valid = checkToken();
    setIsAuthenticated(valid);
    if (!valid && !isAuthPage) {
      navigate("/login", { replace: true });
    }
  }, [i18n.language, location.pathname]);

  /* Fermer sidebar au changement de route */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* Fermer dropdown au clic extérieur */
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* Bloquer scroll quand drawer ouvert */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setProfileOpen(false);
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const sidebarFixedStyle = isMobile
    ? {
        position: "fixed",
        top: 0,
        bottom: 0,
        [isAr ? "right" : "left"]: sidebarOpen ? 0 : -SIDEBAR_W,
        width: SIDEBAR_W,
        zIndex: 300,
        overflowY: "auto",
        transition:
          "left 0.3s cubic-bezier(0.23,1,0.32,1), right 0.3s cubic-bezier(0.23,1,0.32,1)",
      }
    : {
        position: "fixed",
        top: 0,
        bottom: 0,
        [isAr ? "right" : "left"]: 0,
        width: SIDEBAR_W,
        zIndex: 100,
        overflowY: "auto",
      };

  const contentOffset =
    showSidebar && !isMobile
      ? isAr
        ? { marginRight: SIDEBAR_W }
        : { marginLeft: SIDEBAR_W }
      : {};

  const topbarStyle = {
    position: "fixed",
    top: 0,
    left: isAr ? 0 : showSidebar && !isMobile ? SIDEBAR_W : 0,
    right: isAr ? (showSidebar && !isMobile ? SIDEBAR_W : 0) : 0,
    height: TOPBAR_H,
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1rem",
    background: "rgba(240,244,240,0.88)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(142,165,140,0.15)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f0" }}>
      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(30,51,41,0.45)",
            backdropFilter: "blur(3px)",
            zIndex: 299,
            animation: "overlayFadeIn 0.2s ease both",
          }}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div style={sidebarFixedStyle}>
          <Sidebar onLogout={handleLogout} />
        </div>
      )}

      {/* Topbar */}
      {!isAuthPage && (
        <div style={topbarStyle}>
          {/* Gauche */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {showSidebar && isMobile && (
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="topbar-hamburger"
                aria-label="Menu"
              >
                {sidebarOpen ? <IconClose /> : <IconMenu />}
              </button>
            )}
            {isMobile && showSidebar && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <LogoProfManager size={28} />
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "#1e3329",
                    letterSpacing: "-0.3px",
                  }}
                >
                  ProfManager
                </span>
              </div>
            )}
          </div>

          {/* Droite */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              onClick={() => i18n.changeLanguage(isAr ? "fr" : "ar")}
              className="lang-btn"
            >
              <IconGlobe />
              <span>{isAr ? "Français" : "العربية"}</span>
            </button>

            {isAuthenticated && (
              <div style={{ position: "relative" }} ref={menuRef}>
                <button
                  className="profile-btn"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-label="Profil"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt="avatar"
                  />
                </button>
                {profileOpen && (
                  <div className={`profile-dropdown ${isAr ? "rtl" : "ltr"}`}>
                    <button
                      className="profile-dropdown-item"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/profil");
                      }}
                    >
                      <IconUser />
                      <span>{t("Profil")}</span>
                    </button>
                    <div className="profile-dropdown-sep" />
                    <button
                      className="profile-dropdown-item danger"
                      onClick={handleLogout}
                    >
                      <IconLogoutSmall />
                      <span>{t("Déconnexion")}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenu */}
      <div
        style={{
          ...contentOffset,
          paddingTop: isAuthPage ? 0 : TOPBAR_H,
          minHeight: "100vh",
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login setIsAuthenticated={setIsAuthenticated} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <Register />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/classes"
            element={
              isAuthenticated ? (
                <GestionClasses />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/classes/ajouter"
            element={
              isAuthenticated ? (
                <AjouterClasse />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/classes/modifier/:id"
            element={
              isAuthenticated ? (
                <ModifierClasse />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/etudiants"
            element={
              isAuthenticated ? (
                <GestionEtudiants />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/etudiant/ajouter"
            element={
              isAuthenticated ? (
                <AjouterEtudiant />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/etudiant/modifier/:id"
            element={
              isAuthenticated ? (
                <ModifierEtudiant />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/etudiant/evaluation/:etudiantId"
            element={
              isAuthenticated ? (
                <HistoriqueEtudiant />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/sessions"
            element={
              isAuthenticated ? (
                <GestionSessions />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/sessions/demarrer"
            element={
              isAuthenticated ? (
                <DemarrerSession />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/sessions/evaluation/:sessionId/:classeId"
            element={
              isAuthenticated ? (
                <EvaluationSession />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/calculateur-notes"
            element={
              isAuthenticated ? (
                <CalculateurNotes />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/profil"
            element={
              isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/login"}
                replace
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
