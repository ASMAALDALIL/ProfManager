import React, { useState, useEffect } from "react";
import axios from "axios";
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
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const profRes = await axios.get("http://127.0.0.1:8000/professeur/me", {
          headers,
        });
        setCycleProf(profRes.data.cycle_id);
        const resNiveaux = await axios.get(
          `http://127.0.0.1:8000/niveaux/?lang=${i18n.language}`,
          { headers },
        );
        setNiveaux(
          resNiveaux.data.filter((n) => n.cycle_id === profRes.data.cycle_id),
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [i18n.language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile)
      return alert(isAr ? "الرجاء اختيار ملف" : "Veuillez choisir un fichier");
    const data = new FormData();
    data.append("nom", formData.nom);
    data.append("niveau_id", formData.niveau_id);
    data.append("cycle_id", cycleProf);
    data.append("file", selectedFile);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://127.0.0.1:8000/classes/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/classes");
    } catch {
      alert("Erreur");
    }
  };

  return (
    <div className="ac-page">
      <div className="ac-card" dir={isAr ? "rtl" : "ltr"}>
        <h1 className="ac-title">
          {isAr ? "إضافة قسم جديد" : "Ajouter une classe"}
        </h1>

        <form onSubmit={handleSubmit} className="ac-form">
          {/* Nom */}
          <div>
            <label className="ac-label">
              {isAr ? "اسم القسم" : "Nom de la classe"}
            </label>
            <input
              type="text"
              className="ac-input"
              required
              placeholder={isAr ? "مثال: 3أ" : "Ex: 3A"}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
            />
          </div>

          {/* Niveau */}
          <div>
            <label className="ac-label">{isAr ? "المستوى" : "Niveau"}</label>
            <select
              className="ac-input"
              required
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

          {/* File upload */}
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

          {/* Actions */}
          <div className="ac-footer">
            <button
              type="button"
              className="ac-btn-cancel"
              onClick={() => navigate("/classes")}
            >
              {isAr ? "إلغاء" : "Annuler"}
            </button>
            <button type="submit" className="ac-btn-submit">
              {isAr ? "إضافة" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterClasse;
