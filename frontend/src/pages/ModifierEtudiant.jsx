import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/ModifierEtudiant.css";

const ModifierEtudiant = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    nom_complet: "",
    code_massar: "",
    id_classe: "",
  });
  const [loading, setLoading] = useState(true);
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const resClasses = await axios.get("http://127.0.0.1:8000/classes/", { headers });
        setClasses(resClasses.data);
        const resEtud = await axios.get(`http://127.0.0.1:8000/etudiants/${id}`, { headers });
        setFormData({
          nom_complet: resEtud.data.nom_complet,
          code_massar: resEtud.data.code_massar,
          id_classe: resEtud.data.id_classe,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://127.0.0.1:8000/etudiants/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/etudiants");
    } catch {
      alert(isAr ? "خطأ أثناء التعديل" : "Erreur lors de la modification");
    }
  };

  if (loading) return <div className="me-loading">Chargement...</div>;

  return (
    <div className="me-page">
      <div className="me-card" dir={isAr ? "rtl" : "ltr"}>
        <h1 className="me-title">
          {isAr ? "تعديل معلومات التلميذ" : "Modifier l'étudiant"}
        </h1>

        <form onSubmit={handleSubmit} className="me-form">
          {/* Nom complet */}
          <div>
            <label className="me-label">{isAr ? "الاسم الكامل" : "Nom Complet"}</label>
            <input
              type="text"
              className="me-input"
              value={formData.nom_complet}
              required
              onChange={(e) => setFormData({ ...formData, nom_complet: e.target.value })}
            />
          </div>

          {/* Code Massar */}
          <div>
            <label className="me-label">{isAr ? "رقم مسار" : "Code Massar"}</label>
            <input
              type="text"
              className="me-input"
              value={formData.code_massar}
              required
              onChange={(e) => setFormData({ ...formData, code_massar: e.target.value })}
            />
          </div>

          {/* Classe */}
          <div>
            <label className="me-label">{isAr ? "القسم" : "Classe"}</label>
            <select
              className="me-input"
              value={formData.id_classe}
              required
              onChange={(e) => setFormData({ ...formData, id_classe: parseInt(e.target.value) })}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="me-footer">
            <button type="button" className="me-btn-cancel" onClick={() => navigate("/etudiants")}>
              {isAr ? "إلغاء" : "Annuler"}
            </button>
            <button type="submit" className="me-btn-submit">
              {isAr ? "حفظ" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierEtudiant;
