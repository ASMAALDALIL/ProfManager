import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/ModifierClasse.css";

const ModifierClasse = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [niveaux, setNiveaux] = useState([]);
  const [formData, setFormData] = useState({ nom: "", niveau_id: "" });
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const resNiveaux = await axios.get(
          `https://profmanager.onrender.com/niveaux/?lang=${i18n.language}`, { headers }
        );
        setNiveaux(resNiveaux.data);
        const resClasse = await axios.get(
          `https://profmanager.onrender.com/classes/${id}`, { headers }
        );
        setFormData({ nom: resClasse.data.nom, niveau_id: resClasse.data.niveau_id });
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id, i18n.language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("nom", formData.nom);
    data.append("niveau_id", formData.niveau_id);
    if (selectedFile) data.append("file", selectedFile);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://profmanager.onrender.com/classes/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/classes");
    } catch {
      alert(isAr ? "خطأ أثناء التحديث" : "Erreur lors de la mise à jour");
    }
  };

  if (loading) return <div className="mc-loading">Chargement...</div>;

  return (
    <div className="mc-page">
      <div className="mc-card" dir={isAr ? "rtl" : "ltr"}>
        <h1 className="mc-title">
          {isAr ? "تعديل القسم" : "Modifier la classe"}
        </h1>

        <form onSubmit={handleSubmit} className="mc-form">
          {/* Nom */}
          <div>
            <label className="mc-label">
              {isAr ? "اسم القسم" : "Nom de la classe"}
            </label>
            <input
              type="text"
              className="mc-input"
              value={formData.nom}
              required
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            />
          </div>

          {/* Niveau */}
          <div>
            <label className="mc-label">{isAr ? "المستوى" : "Niveau"}</label>
            <select
              className="mc-input"
              value={formData.niveau_id}
              required
              onChange={(e) => setFormData({ ...formData, niveau_id: e.target.value })}
            >
              <option value="">{isAr ? "اختر المستوى" : "Choisir"}</option>
              {niveaux.map((n) => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>

          {/* File (optionnel) */}
          <div>
            <label className="mc-label">
              {isAr ? "تغيير ملف التلاميذ (اختياري)" : "Changer le fichier Excel (Optionnel)"}
            </label>
            <label className="mc-file-label">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <div className="mc-file-content">
                <span className="mc-file-btn">{isAr ? "اختر" : "Choisir"}</span>
                <span className="mc-file-name">
                  {selectedFile
                    ? selectedFile.name
                    : isAr
                      ? "اتركه فارغاً للحفاظ على القائمة"
                      : "Laisser vide pour garder la liste"}
                </span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="mc-footer">
            <button type="button" className="mc-btn-cancel" onClick={() => navigate("/classes")}>
              {isAr ? "إلغاء" : "Annuler"}
            </button>
            <button type="submit" className="mc-btn-submit">
              {isAr ? "حفظ" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierClasse;
