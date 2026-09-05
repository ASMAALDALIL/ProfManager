import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/AjouterClasse.css";

const AjouterClasse = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [niveaux, setNiveaux] = useState([]);
  const [cycleProf, setCycleProf] = useState(null);
  const [formData, setFormData] = useState({ nom: "", niveau_id: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Normalisation stricte de la langue : "ar" ou "fr"
  const langActive = (i18n.language || "fr").toLowerCase().startsWith("ar") ? "ar" : "fr";
  const isAr = langActive === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Récupération des informations de l'enseignant connecté
        const profRes = await api.get("professeur/me", { headers });
        const userCycleId = profRes.data?.cycle_id;
        setCycleProf(userCycleId);

        // 2. Récupération des niveaux avec la langue normalisée
        const resNiveaux = await api.get(`niveaux/?lang=${langActive}`, { headers });
        const dataNiveaux = Array.isArray(resNiveaux.data) ? resNiveaux.data : [];

        // 3. Filtrage selon le cycle
        if (userCycleId) {
          const filtered = dataNiveaux.filter((n) => n.cycle_id === userCycleId);
          setNiveaux(filtered.length > 0 ? filtered : dataNiveaux);
        } else {
          setNiveaux(dataNiveaux);
        }
      } catch (err) {
        console.error("Erreur lors de l'initialisation des données :", err);
      }
    };
    fetchData();
  }, [langActive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return alert(isAr ? "الرجاء اختيار ملف" : "Veuillez choisir un fichier");
    }

    if (!formData.niveau_id) {
      return alert(isAr ? "الرجاء اختيار المستوى" : "Veuillez choisir un niveau");
    }

    setLoading(true);
    const data = new FormData();
    data.append("nom", formData.nom.trim());
    data.append("niveau_id", formData.niveau_id);
    if (cycleProf) {
      data.append("cycle_id", cycleProf);
    }
    data.append("file", selectedFile);

    try {
      const token = localStorage.getItem("token");
      await api.post("classes/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/classes");
    } catch (err) {
      console.error("Erreur lors de l'ajout de la classe :", err);

      // Récupération du message d'erreur précis renvoyé par FastAPI (HTTP 400)
      let errorMsg = isAr ? "حدث خطأ أثناء إضافة القسم" : "Erreur lors de l'ajout de la classe";
      if (err.response && err.response.data && err.response.data.detail) {
        errorMsg = typeof err.response.data.detail === "string" 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail);
      }

      alert(`${isAr ? "خطأ" : "Erreur"} : ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ac-page">
      <div className="ac-card" dir={isAr ? "rtl" : "ltr"}>
        <h1 className="ac-title">
          {isAr ? "إضافة قسم جديد" : "Ajouter une classe"}
        </h1>

        <form onSubmit={handleSubmit} className="ac-form">
          {/* Nom de la classe */}
          <div>
            <label className="ac-label">
              {isAr ? "اسم القسم" : "Nom de la classe"}
            </label>
            <input
              type="text"
              className="ac-input"
              required
              placeholder={isAr ? "مثال: 3أ" : "Ex: 3A"}
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
            />
          </div>

          {/* Sélection du niveau */}
          <div>
            <label className="ac-label">{isAr ? "المستوى" : "Niveau"}</label>
            <select
              className="ac-input"
              required
              value={formData.niveau_id}
              onChange={(e) =>
                setFormData({ ...formData, niveau_id: e.target.value })
              }
            >
              <option value="">
                {isAr ? "اختر المستوى" : "Choisir le niveau"}
              </option>
              {niveaux.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          {/* Import du fichier Excel */}
          <div>
            <label className="ac-label">
              {isAr ? "ملف التلاميذ (Excel)" : "Fichier étudiants (Excel)"}
            </label>
            <label className="ac-file-label">
              <input
                type="file"
                accept=".xlsx,.xls"
                required
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <div className="ac-file-content">
                <span className="ac-file-btn">
                  {isAr ? "اختر ملفاً" : "Choisir"}
                </span>
                <span className="ac-file-name">
                  {selectedFile
                    ? selectedFile.name
                    : isAr
                      ? "لم يتم اختيار ملف"
                      : "Aucun fichier sélectionné"}
                </span>
              </div>
            </label>
          </div>

          {/* Boutons d'action */}
          <div className="ac-footer">
            <button
              type="button"
              className="ac-btn-cancel"
              disabled={loading}
              onClick={() => navigate("/classes")}
            >
              {isAr ? "إلغاء" : "Annuler"}
            </button>
            <button type="submit" className="ac-btn-submit" disabled={loading}>
              {loading
                ? isAr
                  ? "جاري الإضافة..."
                  : "Ajout en cours..."
                : isAr
                  ? "إضافة"
                  : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterClasse;