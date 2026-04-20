import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/EvaluationSession.css";

const EvaluationSession = () => {
  const { sessionId, classeId } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [etudiants, setEtudiants] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const resEtud = await axios.get(
          `http://127.0.0.1:8000/etudiants/classe/${classeId}`,
          { headers },
        );
        setEtudiants(resEtud.data);

        const resEval = await axios.get(
          `http://127.0.0.1:8000/evaluations/session/${sessionId}`,
          { headers },
        );

        if (resEval.data && resEval.data.length > 0) {
          setEvaluations(resEval.data);
          setIsReadOnly(true);
        } else {
          setEvaluations(
            resEtud.data.map((e) => ({
              id_etudiant: e.id,
              absences: true,
              participation: 0,
              comportement: 5,
              organisation_oublis: false,
              devoirs_non_fait: false,
            })),
          );
          setIsReadOnly(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [sessionId, classeId]);

  const filteredEtudiants = etudiants.filter(
    (etud) =>
      etud.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etud.code_massar.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const updateEval = (idEtud, field, value) => {
    if (isReadOnly) return;
    if (
      (field === "participation" || field === "comportement") &&
      value !== ""
    ) {
      if (parseInt(value) < 0 || parseInt(value) > 5) {
        alert(isAr ? "التقييم بين 0 و 5" : "L'intervalle est de 0 à 5");
        return;
      }
    }
    setEvaluations((prev) =>
      prev.map((ev) =>
        ev.id_etudiant === idEtud
          ? {
              ...ev,
              [field]:
                value === ""
                  ? ""
                  : typeof value === "boolean"
                    ? value
                    : parseInt(value),
            }
          : ev,
      ),
    );
  };

  const handleAction = async () => {
    if (isReadOnly) return setIsReadOnly(false);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://127.0.0.1:8000/evaluations/save-session",
        {
          id_session: parseInt(sessionId),
          id_classe: parseInt(classeId),
          evaluations,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsReadOnly(true);
      alert(isAr ? "تم الحفظ" : "Enregistré avec succès");
    } catch {
      alert("Erreur");
    }
  };

  return (
    <div className="ev-page" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="ev-header">
        <h1 className="ev-title">
          {isAr ? "تقييم الحصة" : "Évaluation de la séance"}
        </h1>
        <button
          onClick={handleAction}
          className={`ev-btn-action ${isReadOnly ? "edit" : "save"}`}
        >
          {isReadOnly
            ? isAr
              ? "تعديل"
              : "Modifier"
            : isAr
              ? "حفظ"
              : "Enregistrer"}
        </button>
      </div>

      {/* Search */}
      <div className="ev-search-wrap">
        <div className="ev-search-inner">
          <input
            type="text"
            className="ev-search-input"
            placeholder={
              isAr
                ? "البحث بالاسم أو رمز مسار..."
                : "Rechercher par nom ou code Massar..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="ev-table-card">
        <div className="ev-table-scroll">
          <table className="ev-table">
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: isAr ? "right" : "left",
                    paddingLeft: isAr ? "1.1rem" : "1.5rem",
                  }}
                >
                  {isAr ? "التلميذ" : "Étudiant"}
                </th>
                <th>{isAr ? "حاضر" : "Présent"}</th>
                <th>Partic. (0-5)</th>
                <th>Comp. (0-5)</th>
                <th>{isAr ? "نسيان الأدوات" : "Matériel oublié"}</th>
                <th>{isAr ? "واجب ناقص" : "Devoir non fait"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEtudiants.map((etud) => {
                const ev =
                  evaluations.find((e) => e.id_etudiant === etud.id) || {};
                return (
                  <tr key={etud.id} className={!ev.absences ? "absent" : ""}>
                    <td
                      style={{
                        textAlign: isAr ? "right" : "left",
                        paddingLeft: isAr ? "1.1rem" : "1.5rem",
                      }}
                    >
                      <div className="ev-student-name">{etud.nom_complet}</div>
                      <div className="ev-student-code">{etud.code_massar}</div>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="ev-checkbox"
                        checked={!!ev.absences}
                        disabled={isReadOnly}
                        onChange={(e) =>
                          updateEval(etud.id, "absences", e.target.checked)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="ev-num-input"
                        value={ev.participation ?? 0}
                        disabled={isReadOnly || !ev.absences}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          updateEval(etud.id, "participation", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="ev-num-input"
                        value={ev.comportement ?? 5}
                        disabled={isReadOnly || !ev.absences}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          updateEval(etud.id, "comportement", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="ev-checkbox"
                        checked={!!ev.organisation_oublis}
                        disabled={isReadOnly || !ev.absences}
                        onChange={(e) =>
                          updateEval(
                            etud.id,
                            "organisation_oublis",
                            e.target.checked,
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="ev-checkbox"
                        checked={!!ev.devoirs_non_fait}
                        disabled={isReadOnly || !ev.absences}
                        onChange={(e) =>
                          updateEval(
                            etud.id,
                            "devoirs_non_fait",
                            e.target.checked,
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredEtudiants.length === 0 && (
            <div className="ev-empty">
              {isAr ? "لا يوجد نتائج" : "Aucun étudiant trouvé"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationSession;
