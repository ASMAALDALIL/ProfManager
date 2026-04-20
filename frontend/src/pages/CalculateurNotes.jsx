import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./styles/CalculateurNotes.css";

const CalculateurNotes = () => {
  const { i18n } = useTranslation();
  const [classes, setClasses] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState("");
  const [selectedSemestre, setSelectedSemestre] = useState(1);
  const [bilans, setBilans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBilan, setCurrentBilan] = useState(null);
  const [editForm, setEditForm] = useState({
    note_finale: "",
    remarque_finale: "",
  });
  const isAr = i18n.language === "ar";

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://profmanager.onrender.com/classes/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
    } catch (err) {
      console.error("Erreur chargement classes", err);
    }
  };

  const handleCalculer = async () => {
    if (!selectedClasse) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Accept-Language": i18n.language,
      };
      await axios.post(
        `https://profmanager.onrender.com/bilans/generer-classe/${selectedClasse}?semestre=${selectedSemestre}`,
        {},
        { headers },
      );
      const res = await axios.get(
        `https://profmanager.onrender.com/export/bilans-excel/${selectedClasse}?json=true&semestre=${selectedSemestre}`,
        { headers },
      );
      setBilans(Array.isArray(res.data) ? res.data : []);
    } catch {
      alert(isAr ? "خطأ أثناء الحساب" : "Erreur lors du calcul");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedClasse) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://profmanager.onrender.com/export/bilans-excel/${selectedClasse}?semestre=${selectedSemestre}&langue=${i18n.language}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bilans_S${selectedSemestre}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Erreur Export");
    }
  };

  const handleUpdateAndLearn = async (e) => {
    e.preventDefault();
    if (!currentBilan?.id) {
      alert("Erreur ID manquant");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://profmanager.onrender.com/bilans/modifier/${currentBilan.id}`,
        {
          note_finale: parseFloat(editForm.note_finale),
          remarque_finale: editForm.remarque_finale,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowEditModal(false);
      handleCalculer();
    } catch {
      alert("Erreur lors de la modification");
    }
  };

  const filteredBilans = bilans.filter(
    (b) =>
      b.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code_massar?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="cn-page" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="cn-header">
        <h1 className="cn-title">
          {isAr ? "حاسبة النقط" : "Calculateur de Notes"}
        </h1>
        {bilans.length > 0 && (
          <button className="cn-btn-export" onClick={handleExport}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {isAr ? "تحميل Excel" : "Exporter Excel"}
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="cn-controls-card">
        <div className="cn-controls-row">
          {/* Classe */}
          <div className="cn-field cn-field-grow">
            <label className="cn-label">{isAr ? "القسم" : "Classe"}</label>
            <select
              className="cn-input"
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
            >
              <option value="">
                {isAr ? "--- اختر ---" : "--- Choisir ---"}
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Semestre */}
          <div className="cn-field cn-field-semestre">
            <label className="cn-label">{isAr ? "الدورة" : "Semestre"}</label>
            <select
              className="cn-input"
              value={selectedSemestre}
              onChange={(e) => setSelectedSemestre(parseInt(e.target.value))}
            >
              <option value="1">Semestre 1</option>
              <option value="2">Semestre 2</option>
            </select>
          </div>

          {/* Button */}
          <button className="cn-btn-calc" onClick={handleCalculer}>
            {loading ? "..." : isAr ? "حساب" : "Calculer"}
          </button>
        </div>

        {/* Search */}
        <div className="cn-search-wrap">
          <input
            type="text"
            className="cn-search-input"
            placeholder={isAr ? "بحث..." : "Rechercher un étudiant..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Results table */}
      {filteredBilans.length > 0 && (
        <div className="cn-table-card">
          <table className="cn-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th style={{ textAlign: isAr ? "right" : "left" }}>
                  {isAr ? "التلميذ" : "Étudiant"}
                </th>
                <th>{isAr ? "رقم مسار" : "Code Massar"}</th>
                <th>{isAr ? "النقطة" : "Note"}</th>
                <th style={{ textAlign: isAr ? "right" : "left" }}>
                  {isAr ? "الملاحظة" : "Remarque"}
                </th>
                <th>{isAr ? "تعديل" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBilans.map((b, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="cn-rank">{idx + 1}</span>
                  </td>
                  <td>
                    <span className="cn-student-name">{b.nom_complet}</span>
                  </td>
                  <td>
                    <span className="cn-massar">{b.code_massar}</span>
                  </td>
                  <td>
                    <span className="cn-note-badge">{b.note_finale}</span>
                  </td>
                  <td>
                    <div className="cn-remarque">"{b.remarque_finale}"</div>
                  </td>
                  <td>
                    <button
                      className="cn-btn-modify"
                      onClick={() => {
                        setCurrentBilan(b);
                        setEditForm({
                          note_finale: b.note_finale,
                          remarque_finale: b.remarque_finale,
                        });
                        setShowEditModal(true);
                      }}
                    >
                      {isAr ? "تعديل" : "Modifier"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && (
        <div className="cn-overlay">
          <div className="cn-modal" dir={isAr ? "rtl" : "ltr"}>
            <h2 className="cn-modal-title">
              {isAr ? "تعديل النقطة" : "Modifier la note"}
            </h2>
            <form onSubmit={handleUpdateAndLearn} className="cn-modal-form">
              <div>
                <label className="cn-modal-label">
                  {isAr ? "النقطة النهائية" : "Note Finale"}
                </label>
                <input
                  type="number"
                  step="0.25"
                  className="cn-modal-input"
                  required
                  value={editForm.note_finale}
                  onChange={(e) =>
                    setEditForm({ ...editForm, note_finale: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="cn-modal-label">
                  {isAr ? "الملاحظة" : "Remarque"}
                </label>
                <textarea
                  className="cn-modal-input"
                  required
                  value={editForm.remarque_finale}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      remarque_finale: e.target.value,
                    })
                  }
                />
              </div>
              <div className="cn-modal-footer">
                <button
                  type="button"
                  className="cn-modal-btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  {isAr ? "إلغاء" : "Annuler"}
                </button>
                <button type="submit" className="cn-modal-btn-save">
                  {isAr ? "حفظ" : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculateurNotes;
