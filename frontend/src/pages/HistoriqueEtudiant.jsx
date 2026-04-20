import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/HistoriqueEtudiant.css";

const HistoriqueEtudiant = () => {
  const { etudiantId } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [historique, setHistorique] = useState([]);
  const [etudiant, setEtudiant] = useState(null);
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const resEtud = await axios.get(
          `http://127.0.0.1:8000/etudiants/${etudiantId}`, { headers }
        );
        setEtudiant(resEtud.data);
        const resHist = await axios.get(
          `http://127.0.0.1:8000/evaluations/etudiant/${etudiantId}/historique`, { headers }
        );
        setHistorique(resHist.data);
      } catch (err) {
        console.error("Erreur de récupération", err);
      }
    };
    fetchData();
  }, [etudiantId]);

  return (
    <div className="he-page" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="he-header">
        <h1 className="he-title">
          {isAr ? "سجل التقييم: " : "Historique : "}
          <span>{etudiant?.nom_complet || "..."}</span>
        </h1>
        <button className="he-btn-back" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {isAr ? "عودة" : "Retour"}
        </button>
      </div>

      {/* Table */}
      <div className="he-table-card">
        <div className="he-table-scroll">
          <table className="he-table">
            <thead>
              <tr>
                <th>{isAr ? "التاريخ" : "Date"}</th>
                <th>{isAr ? "الوقت" : "Heure"}</th>
                <th>{isAr ? "الحضور" : "Présence"}</th>
                <th>Partic.</th>
                <th>Comp.</th>
                <th>{isAr ? "نسيان الأدوات" : "Matériel oublié"}</th>
                <th>{isAr ? "واجب غير منجز" : "Devoir non fait"}</th>
              </tr>
            </thead>
            <tbody>
              {historique.length > 0 ? (
                historique.map((h, idx) => (
                  <tr key={idx} className={!h.absences ? "absent" : ""}>
                    <td><span className="he-date">{h.date}</span></td>
                    <td><span className="he-time">{h.heure?.slice(0, 5)}</span></td>
                    <td>
                      {h.absences
                        ? <span className="he-badge-present">{isAr ? "حاضر" : "Présent"}</span>
                        : <span className="he-badge-absent">{isAr ? "غائب" : "Absent"}</span>
                      }
                    </td>
                    <td>
                      <span className="he-score-partic">
                        {h.absences ? h.participation : "—"}
                      </span>
                    </td>
                    <td>
                      <span className="he-score-comp">
                        {h.absences ? h.comportement : "—"}
                      </span>
                    </td>
                    <td>
                      {h.organisation_oublis
                        ? <span className="he-check">✔</span>
                        : <span className="he-dash">—</span>
                      }
                    </td>
                    <td>
                      {h.devoirs_non_fait
                        ? <span className="he-check">✔</span>
                        : <span className="he-dash">—</span>
                      }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="he-empty">
                      {isAr ? "لا يوجد سجل تقييم" : "Aucun historique trouvé"}
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

export default HistoriqueEtudiant;
