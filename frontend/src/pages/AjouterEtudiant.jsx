import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/AjouterEtudiant.css";

const AjouterEtudiant = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    nom_complet: "",
    code_massar: "",
    id_classe: "",
  });
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://127.0.0.1:8000/classes/", {
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
      await axios.post("http://127.0.0.1:8000/etudiants/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/etudiants");
    } catch {
      alert(isAr ? "كود مسار موجود مسبقا" : "Ce code Massar existe déjà");
    }
  };

  return (
    <div className="ae-page">
      <div className="ae-card" dir={isAr ? "rtl" : "ltr"}>
        <h1 className="ae-title">
          {isAr ? "إضافة تلميذ جديد" : "Ajouter un étudiant"}
        </h1>

        <form onSubmit={handleSubmit} className="ae-form">
          {/* Nom complet */}
          <div>
            <label className="ae-label">
              {isAr ? "الاسم الكامل" : "Nom Complet"}
            </label>
            <input
              type="text"
              className="ae-input"
              required
              placeholder={isAr ? "الاسم الكامل للتلميذ" : "Nom et prénom"}
              onChange={(e) =>
                setFormData({ ...formData, nom_complet: e.target.value })
              }
            />
          </div>

          {/* Code Massar */}
          <div>
            <label className="ae-label">
              {isAr ? "رقم مسار" : "Code Massar"}
            </label>
            <input
              type="text"
              className="ae-input"
              required
              placeholder={isAr ? "رقم مسار التلميذ" : "Ex: J135792468"}
              onChange={(e) =>
                setFormData({ ...formData, code_massar: e.target.value })
              }
            />
          </div>

          {/* Classe */}
          <div>
            <label className="ae-label">{isAr ? "القسم" : "Classe"}</label>
            <select
              className="ae-input"
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  id_classe: parseInt(e.target.value),
                })
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

          {/* Actions */}
          <div className="ae-footer">
            <button
              type="button"
              className="ae-btn-cancel"
              onClick={() => navigate("/etudiants")}
            >
              {isAr ? "إلغاء" : "Annuler"}
            </button>
            <button type="submit" className="ae-btn-submit">
              {isAr ? "تأكيد" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterEtudiant;
