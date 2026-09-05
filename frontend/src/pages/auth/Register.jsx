import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    cycle_id: "",
    mot_de_passe: "",
  });

  const isAr = i18n.language?.startsWith("ar");

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const currentLang = i18n.language || "fr";
        const cleanLang = currentLang.startsWith("ar") ? "ar" : "fr";

        const res = await api.get(`cycles/?lang=${cleanLang}`);
        if (Array.isArray(res.data)) {
          setCycles(res.data);
        }
      } catch (err) {
        console.error("Erreur cycles:", err);
      }
    };
    fetchCycles();
  }, [i18n.language]);

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();

    if (formData.mot_de_passe !== confirmPassword) {
      alert(
        isAr
          ? "كلمات المرور غير متطابقة"
          : "Les mots de passe ne correspondent pas"
      );
      return;
    }

    setLoading(true);
    try {
      await api.post("auth/register", {
        ...formData,
        cycle_id: parseInt(formData.cycle_id),
      });
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur inscription");
    } finally {
      setLoading(false);
    }
  };

  const stepStatus = (n) =>
    step > n ? "done" : step === n ? "active" : "pending";
  const lineStatus = (n) => (step > n ? "done" : "");

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">ProfManager</h1>

        <div className="register-steps" style={{ marginBottom: "1.75rem" }}>
          <div className={`register-step-dot ${stepStatus(1)}`}>1</div>
          <div className={`register-step-line ${lineStatus(1)}`} />
          <div className={`register-step-dot ${stepStatus(2)}`}>2</div>
        </div>

        <div dir={isAr ? "rtl" : "ltr"}>
          {step === 1 && (
            <form
              onSubmit={handleNextStep}
              className="register-form register-step-enter"
            >
              <div className="register-grid-2">
                <input
                  type="text"
                  placeholder={t("firstname")}
                  className="register-input"
                  required
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder={t("lastname")}
                  className="register-input"
                  required
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                />
              </div>
              <input
                type="email"
                placeholder={t("email")}
                className="register-input"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder={t("phone")}
                className="register-input"
                required
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
              />
              <select
                className="register-input"
                value={formData.cycle_id}
                required
                onChange={(e) =>
                  setFormData({ ...formData, cycle_id: e.target.value })
                }
              >
                <option value="">{t("cycle_select")}</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="register-btn">
                {isAr ? "التالي" : "Suivant"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={handleFinalRegister}
              className="register-form register-step-enter"
            >
              <input
                type="password"
                placeholder={t("password")}
                className="register-input"
                required
                value={formData.mot_de_passe}
                onChange={(e) =>
                  setFormData({ ...formData, mot_de_passe: e.target.value })
                }
              />
              <input
                type="password"
                placeholder={t("confirm_password")}
                className="register-input"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? "..." : t("btn_finish")}
              </button>
              <button
                type="button"
                className="register-btn"
                style={{
                  background: "transparent",
                  border: "1px solid #ccc",
                  marginTop: "0.5rem",
                }}
                onClick={() => setStep(1)}
              >
                {isAr ? "رجوع" : "Retour"}
              </button>
            </form>
          )}
        </div>

        <p className="register-footer">
          {isAr ? "لديك حساب؟" : "Déjà un compte ?"}
          <span onClick={() => navigate("/login")} className="register-link">
            {isAr ? "تسجيل الدخول" : "Se connecter"}
          </span>
        </p>

        {/* Liens obligatoires pour Google AdSense */}
        <div
          style={{
            marginTop: "1.2rem",
            fontSize: "0.75rem",
            textAlign: "center",
            opacity: 0.7,
          }}
          dir={isAr ? "rtl" : "ltr"}
        >
          <span
            onClick={() => navigate("/privacy-policy")}
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              margin: "0 6px",
            }}
          >
            {isAr ? "سياسة الخصوصية" : "Politique de confidentialité"}
          </span>
          |
          <span
            onClick={() => navigate("/terms")}
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              margin: "0 6px",
            }}
          >
            {isAr ? "شروط الاستخدام" : "Conditions d'utilisation"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
