import React, { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Login.css";

const Login = ({ setIsAuthenticated }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const cleanLang = i18n.language?.startsWith("ar") ? "ar" : "fr";
      const res = await api.post(
        "auth/login",
        { email, mot_de_passe: password },
        { headers: { "Accept-Language": cleanLang } }
      );
      localStorage.setItem("token", res.data.access_token);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur de connexion");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-avatar">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>

        <h1 className="login-title">ProfManager</h1>
        <p className="login-subtitle">
          {i18n.language?.startsWith("ar") ? "تسجيل الدخول" : "Connexion"}
        </p>

        <form
          onSubmit={handleLogin}
          className="login-form"
          dir={i18n.language?.startsWith("ar") ? "rtl" : "ltr"}
        >
          <div className="login-field-wrapper">
            <input
              type="email"
              placeholder={t("email")}
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <svg className="login-field-icon" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>

          <div className="login-field-wrapper">
            <input
              type="password"
              placeholder={t("password")}
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <svg className="login-field-icon" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>

          <button type="submit" className="login-btn">
            {t("btn_login")}
          </button>
        </form>

        <p className="login-footer">
          {t("no_account")}
          <span onClick={() => navigate("/register")} className="login-link">
            {t("link_register")}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;