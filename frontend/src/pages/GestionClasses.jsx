import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./styles/GestionClasses.css";

const GestionClasses = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [cycleData, setCycleData] = useState({});
  const [counts, setCounts] = useState({});
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [exportClasseId, setExportClasseId] = useState(null);
  const isAr = i18n.language === "ar";

  const moisAnnee = [
    { id: 9, fr: "Sept.", ar: "شتنبر" },
    { id: 10, fr: "Oct.", ar: "أكتوبر" },
    { id: 11, fr: "Nov.", ar: "نونبر" },
    { id: 12, fr: "Déc.", ar: "دجنبر" },
    { id: 1, fr: "Janv.", ar: "يناير" },
    { id: 2, fr: "Févr.", ar: "فبراير" },
    { id: 3, fr: "Mars", ar: "مارس" },
    { id: 4, fr: "Avr.", ar: "أبريل" },
    { id: 5, fr: "Mai", ar: "ماي" },
    { id: 6, fr: "Juin", ar: "يونيو" },
  ];

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [resClasses, resNiveaux, resCycles] = await Promise.all([
        axios.get("http://127.0.0.1:8000/classes/", { headers }),
        axios.get(`http://127.0.0.1:8000/niveaux/?lang=${i18n.language}`, {
          headers,
        }),
        axios.get(`http://127.0.0.1:8000/cycles/?lang=${i18n.language}`, {
          headers,
        }),
      ]);
      const cyclesMap = {};
      resCycles.data.forEach((c) => (cyclesMap[c.id] = c.label));
      setCycleData(cyclesMap);
      setClasses(resClasses.data);
      setNiveaux(resNiveaux.data);
      resClasses.data.forEach(async (cls) => {
        try {
          const res = await axios.get(
            `http://127.0.0.1:8000/etudiants/classe/${cls.id}`,
            { headers },
          );
          setCounts((prev) => ({ ...prev, [cls.id]: res.data.length }));
        } catch (e) {
          console.error(e);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [i18n.language]);

  const handleDelete = async (id) => {
    const msg = isAr
      ? "هل أنت متأكد من حذف هذا القسم؟"
      : "Voulez-vous vraiment supprimer cette classe ?";
    if (!window.confirm(msg)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch {
      alert("Erreur");
    }
  };

  const handleExportAbs = async (classeId, mois = null) => {
    try {
      const token = localStorage.getItem("token");
      let url = `http://127.0.0.1:8000/export/absences-excel/${classeId}?langue=${i18n.language}`;
      if (mois) url += `&mois=${mois}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute(
        "download",
        `absences_${mois ? "mois_" + mois : "total"}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowMonthModal(false);
    } catch {
      alert(isAr ? "خطأ في التصدير" : "Erreur d'exportation");
    }
  };

  const openStudents = async (cls) => {
    setEtudiants([]);
    setSelectedClasse(cls);
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/etudiants/classe/${cls.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setEtudiants(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`gc-page`} dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="gc-header">
        <h1 className="gc-title">
          {isAr ? "تسيير الأقسام" : "Gestion des Classes"}
        </h1>
        <button
          className="gc-btn-add"
          onClick={() => navigate("/classes/ajouter")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>{isAr ? "قسم جديد" : "Nouvelle Classe"}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="gc-grid">
        {classes.map((cls) => {
          const niveauLabel =
            niveaux.find((n) => n.id === cls.niveau_id)?.label || "---";
          return (
            <div key={cls.id} className="gc-card">
              {/* Top row */}
              <div className="gc-card-top" dir="ltr">
                <div>
                  <h3 className="gc-card-name">{cls.nom}</h3>
                  <span className="gc-cycle-badge">
                    {cycleData[cls.cycle_id] || "---"}
                  </span>
                </div>
                <div className="gc-card-actions">
                  <button
                    className="gc-icon-btn edit"
                    onClick={() => navigate(`/classes/modifier/${cls.id}`)}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    className="gc-icon-btn delete"
                    onClick={() => handleDelete(cls.id)}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="gc-card-details" dir={isAr ? "rtl" : "ltr"}>
                <span className="gc-detail">
                  {counts[cls.id] || 0} {isAr ? "تلاميذ" : "Étudiants"}
                </span>
                <span className="gc-detail">
                  {isAr ? "المستوى" : "Niveau"} : {niveauLabel}
                </span>
              </div>

              {/* Session button */}
              <button
                className="gc-btn-session"
                onClick={() =>
                  navigate(`/sessions/demarrer?classeId=${cls.id}`)
                }
              >
                {isAr ? "تدبير الحصة" : "Gérer la séance"}
              </button>

              {/* Footer */}
              <div className="gc-card-footer" dir={isAr ? "rtl" : "ltr"}>
                <button
                  className="gc-btn-outline"
                  onClick={() => openStudents(cls)}
                >
                  {isAr ? "لائحة التلاميذ" : "Liste Étudiants"}
                </button>
                <button
                  className="gc-btn-outline"
                  onClick={() => {
                    setExportClasseId(cls.id);
                    setShowMonthModal(true);
                  }}
                >
                  {isAr ? "تصدير الغياب" : "Export Abs"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Month export modal */}
      {showMonthModal && (
        <div className="gc-overlay">
          <div className="gc-modal" dir={isAr ? "rtl" : "ltr"}>
            <h2 className="gc-modal-title">
              {isAr ? "اختر شهر التصدير" : "Mois d'exportation"}
            </h2>
            <div className="gc-months-grid">
              {moisAnnee.map((m) => (
                <button
                  key={m.id}
                  className="gc-month-btn"
                  onClick={() => handleExportAbs(exportClasseId, m.id)}
                >
                  {isAr ? m.ar : m.fr}
                </button>
              ))}
            </div>
            <button
              className="gc-btn-annual"
              onClick={() => handleExportAbs(exportClasseId)}
            >
              {isAr ? "تصدير المجموع السنوي" : "Export Annuel Complet"}
            </button>
            <button
              className="gc-btn-cancel"
              onClick={() => setShowMonthModal(false)}
            >
              {isAr ? "إلغاء" : "Annuler"}
            </button>
          </div>
        </div>
      )}

      {/* Students list modal */}
      {selectedClasse && (
        <div className="gc-overlay">
          <div className="gc-modal-large" dir="ltr">
            <div className="gc-modal-header">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "#1e3329",
                }}
              >
                {selectedClasse.nom}
              </h2>
              <button
                className="gc-modal-close"
                onClick={() => setSelectedClasse(null)}
              >
                &times;
              </button>
            </div>
            <div className="gc-table-wrap">
              <table className="gc-table">
                <thead>
                  <tr>
                    <th>{isAr ? "الاسم" : "Nom"}</th>
                    <th>{isAr ? "رقم مسار" : "Code Massar"}</th>
                  </tr>
                </thead>
                <tbody>
                  {etudiants.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.nom_complet}</td>
                      <td>{e.code_massar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionClasses;
