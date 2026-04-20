import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./styles/GestionEtudiants.css";

const GestionEtudiants = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [etudiants, setEtudiants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const resClasses = await axios.get("https://profmanager.onrender.com/classes/", {
          headers,
        });
        setClasses(resClasses.data);
        const resEtud = await axios.get(
          "https://profmanager.onrender.com/etudiants/tous",
          { headers },
        );
        setEtudiants(resEtud.data);
      } catch (err) {
        console.error("Erreur de chargement", err);
      }
    };
    fetchData();
  }, [i18n.language]);

  const handleDelete = async (id) => {
    const confirmMsg = isAr
      ? "هل أنت متأكد من حذف هذا التلميذ؟"
      : "Voulez-vous vraiment supprimer cet étudiant ?";
    if (window.confirm(confirmMsg)) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`https://profmanager.onrender.com/etudiants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEtudiants(etudiants.filter((e) => e.id !== id));
      } catch {
        alert(isAr ? "خطأ في الحذف" : "Erreur lors de la suppression");
      }
    }
  };

  const filteredEtudiants = etudiants.filter((e) => {
    const matchClasse =
      selectedClasse === "all" || e.id_classe === parseInt(selectedClasse);
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      e.nom_complet.toLowerCase().includes(searchLower) ||
      e.code_massar.toLowerCase().includes(searchLower);
    return matchClasse && matchSearch;
  });

  return (
    <div className="ge-page" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="ge-header">
        <h1 className="ge-title">
          {isAr ? "تسيير التلاميذ" : "Gestion des Étudiants"}
        </h1>
        <button
          className="ge-btn-add"
          onClick={() => navigate("/etudiant/ajouter")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          <span>{isAr ? "تلميذ جديد" : "Nouvel Étudiant"}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="ge-filters">
        <div className="ge-search-wrap">
          <input
            type="text"
            className="ge-search-input"
            placeholder={
              isAr ? "بحث بالاسم أو رمز مسار..." : "Chercher par nom ou code..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="ge-select"
          value={selectedClasse}
          onChange={(e) => setSelectedClasse(e.target.value)}
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
      <div className="ge-table-card">
        <div className="ge-table-scroll">
          <table className="ge-table">
            <thead>
              <tr>
                <th style={{ textAlign: isAr ? "right" : "left" }}>
                  {isAr ? "الاسم الكامل" : "Nom Complet"}
                </th>
                <th>{isAr ? "رقم مسار" : "Code Massar"}</th>
                <th>{isAr ? "القسم" : "Classe"}</th>
                <th>{isAr ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEtudiants.length > 0 ? (
                filteredEtudiants.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <span className="ge-student-name">{e.nom_complet}</span>
                    </td>
                    <td>
                      <span className="ge-code">{e.code_massar}</span>
                    </td>
                    <td>
                      <span className="ge-class-badge">
                        {classes.find((c) => c.id === e.id_classe)?.nom ||
                          "---"}
                      </span>
                    </td>
                    <td>
                      <div className="ge-actions">
                        <div className="ge-actions-row">
                          <button
                            className="ge-icon-btn edit"
                            onClick={() =>
                              navigate(`/etudiant/modifier/${e.id}`)
                            }
                            title={isAr ? "تعديل" : "Modifier"}
                          >
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.6}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            className="ge-icon-btn delete"
                            onClick={() => handleDelete(e.id)}
                            title={isAr ? "حذف" : "Supprimer"}
                          >
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.6}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <button
                          className="ge-btn-eval"
                          onClick={() =>
                            navigate(`/etudiant/evaluation/${e.id}`)
                          }
                        >
                          {isAr ? "عرض التقييم" : "Voir Éval"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
                    <div className="ge-empty">
                      {isAr ? "لا يوجد نتائج" : "Aucun étudiant trouvé"}
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

export default GestionEtudiants;
