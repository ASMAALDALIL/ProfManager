import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/Dashboard.css";

/* ── Icons ──────────────────────────────────────────────── */
const IconStudents = () => (
  <svg viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);

const IconClasses = () => (
  <svg viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V9.75a2.25 2.25 0 0 0-2.25-2.25H9.75Z"
    />
  </svg>
);

const IconSessions = () => (
  <svg viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </svg>
);

const IconArrow = () => (
  <svg
    viewBox="0 0 24 24"
    style={{
      width: 14,
      height: 14,
      stroke: "currentColor",
      fill: "none",
      strokeWidth: 2,
    }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const IconCalendar = () => (
  <svg
    viewBox="0 0 24 24"
    style={{
      width: 30,
      height: 30,
      stroke: "#8EA58C",
      fill: "none",
      strokeWidth: 1.5,
    }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5M12 12h.008v.008H12V12Zm0 3h.008v.008H12V15Zm0 3h.008v.008H12V18Zm3-6h.008v.008H15V12Zm0 3h.008v.008H15V15Zm0 3h.008v.008H15V18Zm-6 0h.008v.008H9V18Zm0-3h.008v.008H9V15Z"
    />
  </svg>
);

/* ── Main component ─────────────────────────────────────── */
const Dashboard = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";

  const [profil, setProfil] = useState(null);
  const [stats, setStats] = useState({ etudiants: 0, classes: 0, sessions: 0 });
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resProfil, resClasses, resSessions, resEtudiants] =
        await Promise.all([
          axios.get("https://profmanager.onrender.com/professeur/me", { headers }),
          axios.get("https://profmanager.onrender.com/classes/", { headers }),
          axios.get("https://profmanager.onrender.com/sessions/toutes", { headers }),
          axios.get("https://profmanager.onrender.com/etudiants/tous", { headers }),
        ]);

      setProfil(resProfil.data);
      setClasses(resClasses.data);
      setSessions(resSessions.data);
      setStats({
        etudiants: resEtudiants.data.length,
        classes: resClasses.data.length,
        sessions: resSessions.data.length,
      });
    } catch (err) {
      console.error("Erreur dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  /* Format date nicely */
  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return d.toLocaleDateString(isAr ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* Today's greeting */
  const today = new Date().toLocaleDateString(isAr ? "ar-MA" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* Stat cards config */
  const statCards = [
    {
      cls: "card-students",
      icon: <IconStudents />,
      value: stats.etudiants,
      label: isAr ? "إجمالي التلاميذ" : "Total Étudiants",
      path: "/etudiants",
    },
    {
      cls: "card-classes",
      icon: <IconClasses />,
      value: stats.classes,
      label: isAr ? "الأقسام" : "Classes actives",
      path: "/classes",
    },
    {
      cls: "card-sessions",
      icon: <IconSessions />,
      value: stats.sessions,
      label: isAr ? "الحصص" : "Sessions",
      path: "/sessions",
    },
  ];

  return (
    <div className="dashboard-page" dir={isAr ? "rtl" : "ltr"}>
      {/* ── Greeting ───────────────────────────────────── */}
      <div className="dashboard-greeting">
        <h1>
          <p className="dashboard-greeting-sub">
            {isAr ? "مرحباً بك " : "Bienvenue "}
          </p>
        </h1>
        <p className="dashboard-greeting-date">{today}</p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div className="dashboard-stats-grid">
        {statCards.map((card) => (
          <div
            key={card.path}
            className={`dash-stat-card ${card.cls}`}
            onClick={() => navigate(card.path)}
            role="button"
            tabIndex={0}
          >
            <div className="dash-stat-card-header">
              <div className="dash-stat-card-icon">{card.icon}</div>
              <div className="dash-stat-card-arrow">
                <IconArrow />
              </div>
            </div>
            <div>
              {loading ? (
                <div
                  className="dash-skeleton"
                  style={{ width: 60, height: 48, marginBottom: 6 }}
                />
              ) : (
                <div className="dash-stat-card-value">{card.value}</div>
              )}
              <div className="dash-stat-card-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sessions section ────────────────────────────── */}
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">
          {isAr ? "آخر الحصص" : "Sessions récentes"}
        </h2>
        <button
          className="dashboard-new-session-btn"
          onClick={() => navigate("/sessions/demarrer")}
        >
          <IconPlus />
          <span>{isAr ? "حصة جديدة" : "Nouvelle session"}</span>
        </button>
      </div>

      <div className="dashboard-table-card">
        {loading ? (
          <div className="dashboard-empty">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="dash-skeleton"
                style={{ width: "100%", height: 52, borderRadius: 12 }}
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          /* ── Empty state ─────────────────────────────── */
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">
              <IconCalendar />
            </div>
            <p className="dashboard-empty-title">
              {isAr ? "لا توجد حصص بعد" : "Aucune session trouvée"}
            </p>
            <p className="dashboard-empty-sub">
              {isAr
                ? "لم يتم تسجيل أي حصة حتى الآن. ابدأ أول حصة لك الآن."
                : "Vous n'avez encore enregistré aucune session. Démarrez votre première séance."}
            </p>
            <button
              className="dashboard-new-session-btn"
              style={{ marginTop: "0.5rem" }}
              onClick={() => navigate("/sessions/demarrer")}
            >
              <IconPlus />
              <span>{isAr ? "ابدأ أول حصة" : "Créer une session"}</span>
            </button>
          </div>
        ) : (
          /* ── Table ───────────────────────────────────── */
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>{isAr ? "القسم" : "Classe"}</th>
                <th>{isAr ? "التاريخ" : "Date"}</th>
                <th>{isAr ? "الوقت" : "Heure"}</th>
                <th>{isAr ? "الدورة" : "Semestre"}</th>
                <th>{isAr ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 10).map((s) => {
                const classeNom =
                  classes.find((c) => c.id === s.id_classe)?.nom || "---";
                return (
                  <tr key={s.id}>
                    <td>
                      <span className="dash-badge">{classeNom}</span>
                    </td>
                    <td>{formatDate(s.date_session)}</td>
                    <td className="dash-time">
                      {s.heure_session ? s.heure_session.slice(0, 5) : "--:--"}
                    </td>
                    <td>S{s.semestre || "—"}</td>
                    <td>
                      <button
                        className="dash-action-btn"
                        onClick={() =>
                          navigate(
                            `/sessions/evaluation/${s.id}/${s.id_classe}`,
                          )
                        }
                      >
                        <IconArrow />
                        {isAr ? "عرض" : "Voir"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* If more sessions, show link to full list */}
      {sessions.length > 10 && (
        <div style={{ textAlign: isAr ? "right" : "left", marginTop: "1rem" }}>
          <button
            className="dash-action-btn"
            style={{ padding: "0.6rem 1.25rem" }}
            onClick={() => navigate("/sessions")}
          >
            <IconArrow />
            {isAr
              ? `عرض جميع الحصص (${sessions.length})`
              : `Voir toutes les sessions (${sessions.length})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
