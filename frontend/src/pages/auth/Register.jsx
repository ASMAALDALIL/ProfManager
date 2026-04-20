import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    cycle_id: "",
    code: "",
    mot_de_passe: "",
  });

  const isAr = i18n.language === "ar";

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/cycles/?lang=${i18n.language}`,
        );
        if (Array.isArray(res.data)) setCycles(res.data);
      } catch (err) {
        console.error("Erreur cycles:", err);
      }
    };
    fetchCycles();
  }, [i18n.language]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/auth/send-code", null, {
        params: { email: formData.email },
        headers: { "Accept-Language": i18n.language },
      });
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur d'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/auth/verify-code", null, {
        params: { email: formData.email, code: formData.code },
      });
      setStep(3);
    } catch (err) {
      alert(isAr ? "الرمز غير صحيح" : "Code incorrect");
    }
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/auth/register", {
        ...formData,
        cycle_id: parseInt(formData.cycle_id),
      });
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur inscription");
    }
  };

  /* Step indicator helpers */
  const stepStatus = (n) =>
    step > n ? "done" : step === n ? "active" : "pending";
  const lineStatus = (n) => (step > n ? "done" : "");

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">ProfManager</h1>

        {/* Step indicator */}
        <div className="register-steps" style={{ marginBottom: "1.75rem" }}>
          <div className={`register-step-dot ${stepStatus(1)}`}>1</div>
          <div className={`register-step-line ${lineStatus(1)}`} />
          <div className={`register-step-dot ${stepStatus(2)}`}>2</div>
          <div className={`register-step-line ${lineStatus(2)}`} />
          <div className={`register-step-dot ${stepStatus(3)}`}>3</div>
        </div>

        <div dir={isAr ? "rtl" : "ltr"}>
          {/* ── Step 1 : Informations ─────────────────────── */}
          {step === 1 && (
            <form
              onSubmit={handleSendCode}
              className="register-form register-step-enter"
            >
              <div className="register-grid-2">
                <input
                  type="text"
                  placeholder={t("firstname")}
                  className="register-input"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder={t("lastname")}
                  className="register-input"
                  required
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder={t("phone")}
                className="register-input"
                required
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
              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? "..." : t("btn_send_code")}
              </button>
            </form>
          )}

          {/* ── Step 2 : Code vérification ────────────────── */}
          {step === 2 && (
            <div className="register-form register-step-enter">
              <p className="register-code-hint">
                {isAr
                  ? "أدخل الرمز المرسل إلى بريدك"
                  : "Entrez le code envoyé à votre email"}
              </p>
              <input
                type="text"
                placeholder="0000"
                className="register-code-input"
                maxLength={6}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
              <button onClick={handleVerifyCode} className="register-btn">
                {t("btn_verify")}
              </button>
            </div>
          )}

          {/* ── Step 3 : Mot de passe ─────────────────────── */}
          {step === 3 && (
            <form
              onSubmit={handleFinalRegister}
              className="register-form register-step-enter"
            >
              <input
                type="password"
                placeholder={t("password")}
                className="register-input"
                required
                onChange={(e) =>
                  setFormData({ ...formData, mot_de_passe: e.target.value })
                }
              />
              <input
                type="password"
                placeholder={t("confirm_password")}
                className="register-input"
                required
              />
              <button type="submit" className="register-btn">
                {t("btn_finish")}
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
      </div>
    </div>
  );
};

export default Register;
