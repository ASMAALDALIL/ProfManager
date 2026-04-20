import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/DemarrerSession.css";

const DemarrerSession = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState([]);

  const queryParams = new URLSearchParams(location.search);
  const initialClasseId = queryParams.get("classeId");

  const [formData, setFormData] = useState({
    date_session: new Date().toISOString().split("T")[0],
    heure_session: "",
    id_classe: initialClasseId || "",
    semestre: "",
  });

  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://profmanager.onrender.com/classes/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const resEtudiants = await axios.get(
        `https://profmanager.onrender.com/etudiants/classe/${formData.id_classe}`,
        { headers },
      );

      if (resEtudiants.data.length === 0) {
        alert(
          isAr
            ? "هذا القسم لا يحتوي على تلاميذ"
            : "Cette classe ne possède pas d'étudiants.",
        );
        return;
      }

      const res = await axios.post(
        "https://profmanager.onrender.com/sessions/",
        {
          ...formData,
          id_classe: parseInt(formData.id_classe),
          semestre: parseInt(formData.semestre),
        },
        { headers },
      );
      navigate(`/sessions/evaluation/${res.data.id}/${formData.id_classe}`);
    } catch {
      alert(
        isAr
          ? "خطأ أثناء بدء الحصة"
          : "Erreur lors de la création de la session",
      );
    }
  };

  return (
    <div className="ds-page">
      <div className="ds-card" dir={isAr ? "rtl" : "ltr"}>
        {/* Icon */}
        <div className="ds-icon-badge">
          <svg viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </div>

        <h1 className="ds-title">{isAr ? "حصة جديدة" : "Nouvelle Session"}</h1>

        <form onSubmit={handleSubmit} className="ds-form">
          {/* Date */}
          <div>
            <label className="ds-label">{isAr ? "التاريخ" : "Date"}</label>
            <input
              type="date"
              className="ds-input"
              value={formData.date_session}
              required
              onChange={(e) =>
                setFormData({ ...formData, date_session: e.target.value })
              }
            />
          </div>

          {/* Heure */}
          <div>
            <label className="ds-label">{isAr ? "الوقت" : "Heure"}</label>
            <input
              type="time"
              className="ds-input"
              value={formData.heure_session}
              required
              onChange={(e) =>
                setFormData({ ...formData, heure_session: e.target.value })
              }
            />
          </div>

          {/* Classe */}
          <div>
            <label className="ds-label">{isAr ? "القسم" : "Classe"}</label>
            <select
              className="ds-input"
              required
              value={formData.id_classe}
              disabled={!!initialClasseId}
              onChange={(e) =>
                setFormData({ ...formData, id_classe: e.target.value })
              }
            >
              <option value="">
                {isAr ? "اختر القسم" : "Choisir la classe"}
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Semestre — pill selector */}
          <div>
            <label className="ds-label">{isAr ? "الدورة" : "Semestre"}</label>
            <div className="ds-semestre-pills">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`ds-pill${formData.semestre === String(s) ? " active" : ""}`}
                  onClick={() =>
                    setFormData({ ...formData, semestre: String(s) })
                  }
                >
                  {isAr ? `الدورة ${s}` : `Semestre ${s}`}
                </button>
              ))}
            </div>
            {/* Hidden input for form validation */}
            <input
              type="text"
              required
              value={formData.semestre}
              onChange={() => {}}
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                width: 0,
                height: 0,
              }}
            />
          </div>

          {/* Actions */}
          <div className="ds-footer">
            <button
              type="button"
              className="ds-btn-cancel"
              onClick={() => navigate(-1)}
            >
              {isAr ? "إلغاء" : "Annuler"}
            </button>
            <button type="submit" className="ds-btn-submit">
              {isAr ? "بدء" : "Démarrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemarrerSession;
