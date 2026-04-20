import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./styles/GestionSessions.css";

const GestionSessions = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterClasse, setFilterClasse] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const resClasses = await axios.get("http://127.0.0.1:8000/classes/", {
          headers,
        });
        const resSessions = await axios.get(
          "http://127.0.0.1:8000/sessions/toutes",
          { headers },
        );
        setClasses(resClasses.data);
        setSessions(resSessions.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const matchClasse =
      filterClasse === "all" || s.id_classe === parseInt(filterClasse);
    const matchDate = !filterDate || s.date_session === filterDate;
    return matchClasse && matchDate;
  });

  return (
    <div className="gs-page" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="gs-header">
        <h1 className="gs-title">
          {isAr ? "سجل الحصص" : "Gestion des Sessions"}
        </h1>
        <button
          className="gs-btn-add"
          onClick={() => navigate("/sessions/demarrer")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span>{isAr ? "بدء حصة جديدة" : "Démarrer Session"}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="gs-filters">
        <input
          type="date"
          className="gs-input-date"
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select
          className="gs-select"
          onChange={(e) => setFilterClasse(e.target.value)}
        >
          <option value="all">
            {isAr ? "جميع الأقسام" : "Toutes les classes"}
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="gs-table-card">
        <div className="gs-table-scroll">
          <table className="gs-table">
            <thead>
              <tr>
                <th>{isAr ? "التاريخ" : "Date"}</th>
                <th>{isAr ? "الوقت" : "Heure"}</th>
                <th>{isAr ? "القسم" : "Classe"}</th>
                <th>{isAr ? "الدورة" : "Semestre"}</th>
                <th>{isAr ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length > 0 ? (
                filteredSessions.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="gs-date-cell">{s.date_session}</span>
                    </td>
                    <td>
                      <span className="gs-time-cell">
                        {s.heure_session
                          ? s.heure_session.slice(0, 5)
                          : "--:--"}
                      </span>
                    </td>
                    <td>
                      <span className="gs-class-badge">
                        {classes.find((c) => c.id === s.id_classe)?.nom ||
                          "---"}
                      </span>
                    </td>
                    <td>S{s.semestre || "—"}</td>
                    <td>
                      <button
                        className="gs-btn-eval"
                        onClick={() =>
                          navigate(
                            `/sessions/evaluation/${s.id}/${s.id_classe}`,
                          )
                        }
                      >
                        <svg viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                          />
                        </svg>
                        {isAr ? "عرض التقييمات" : "Voir Évals"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <div className="gs-empty">
                      {isAr ? "لا توجد حصص" : "Aucune session trouvée"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionSessions;
