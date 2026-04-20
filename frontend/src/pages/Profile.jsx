import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./styles/Profile.css";

const formatText = (str) => {
  if (!str) return "---";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const Profile = () => {
  const { i18n } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [cycleNames, setCycleNames] = useState({ fr: "---", ar: "---" });
  const [cyclesList, setCyclesList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    cycle_id: "",
  });

  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm: "",
  });

  // isAr is read live from i18n so labels switch language,
  // but fetchData is called only once on mount — data stays stable.
  const isAr = i18n.language === "ar";

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const profRes = await axios.get("http://127.0.0.1:8000/professeur/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(profRes.data);
      setFormData({
        nom: profRes.data.nom,
        prenom: profRes.data.prenom,
        email: profRes.data.email,
        telephone: profRes.data.telephone,
        cycle_id: profRes.data.cycle_id || "",
      });

      // Always fetch both languages so the cycle display is bilingual
      const [resFr, resAr] = await Promise.all([
        axios.get("http://127.0.0.1:8000/cycles/?lang=fr"),
        axios.get("http://127.0.0.1:8000/cycles/?lang=ar"),
      ]);
      setCyclesList(
        resFr.data.map((f) => ({
          id: f.id,
          fr: f.label,
          ar: resAr.data.find((a) => a.id === f.id)?.label || "",
        })),
      );

      if (profRes.data.cycle_id) {
        const cycleDetails = await axios.get(
          `http://127.0.0.1:8000/cycles/${profRes.data.cycle_id}`,
        );
        setCycleNames({
          fr: formatText(cycleDetails.data.fr),
          ar: cycleDetails.data.ar || "---",
        });
      }
    } catch (err) {
      console.error("Erreur API:", err);
    }
  };

  // Fetch only on mount — NOT on language change
  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://127.0.0.1:8000/professeur/me", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditing(false);
      fetchData();
    } catch {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm) {
      return alert(
        isAr
          ? "كلمتا المرور غير متطابقتين"
          : "Les nouveaux mots de passe ne correspondent pas",
      );
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://127.0.0.1:8000/professeur/me/password",
        {
          old_password: passwords.old_password,
          new_password: passwords.new_password,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(
        isAr
          ? "تم تغيير كلمة المرور بنجاح"
          : "Mot de passe mis à jour avec succès",
      );
      setShowPasswordModal(false);
      setPasswords({ old_password: "", new_password: "", confirm: "" });
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          (isAr
            ? "كلمة المرور القديمة غير صحيحة"
            : "Ancien mot de passe incorrect"),
      );
    }
  };

  return (
    <div className="pf-page" dir={isAr ? "rtl" : "ltr"}>
      <div className="pf-card">
        {/* Header */}
        <div className="pf-header">
          <div className="pf-avatar">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="avatar"
            />
          </div>
          <h2 className="pf-name">
            {formatText(userData?.nom)} {formatText(userData?.prenom)}
          </h2>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="pf-grid">
            {/* Prénom */}
            <div>
              <div className="pf-field-label">
                <span>Prénom</span>
                <span dir="rtl">الاسم الشخصي</span>
              </div>
              {isEditing ? (
                <input
                  className="pf-input"
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                />
              ) : (
                <div className="pf-info-box">
                  {formatText(userData?.prenom)}
                </div>
              )}
            </div>

            {/* Nom */}
            <div>
              <div className="pf-field-label">
                <span>Nom</span>
                <span dir="rtl">الاسم العائلي</span>
              </div>
              {isEditing ? (
                <input
                  className="pf-input"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                />
              ) : (
                <div className="pf-info-box">{formatText(userData?.nom)}</div>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="pf-field-label">
                <span>Email</span>
                <span dir="rtl">البريد الإلكتروني</span>
              </div>
              {isEditing ? (
                <input
                  type="email"
                  className="pf-input email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              ) : (
                <div className="pf-info-box email">{userData?.email}</div>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <div className="pf-field-label">
                <span>Téléphone</span>
                <span dir="rtl">رقم الهاتف</span>
              </div>
              {isEditing ? (
                <input
                  className="pf-input"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                />
              ) : (
                <div className="pf-info-box">{userData?.telephone}</div>
              )}
            </div>

            {/* Cycle */}
            <div className="pf-field-full">
              <div className="pf-field-label">
                <span>Cycle</span>
                <span dir="rtl">السلك الدراسي</span>
              </div>
              {isEditing ? (
                <select
                  className="pf-input"
                  value={formData.cycle_id}
                  onChange={(e) =>
                    setFormData({ ...formData, cycle_id: e.target.value })
                  }
                >
                  {cyclesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {formatText(c.fr)} | {c.ar}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="pf-info-box bilingual">
                  <span>{cycleNames.fr}</span>
                  <span className="pf-sep">|</span>
                  <span dir="rtl">{cycleNames.ar}</span>
                </div>
              )}
            </div>

            {/* Password (view only) */}
            {!isEditing && (
              <div className="pf-field-full">
                <div className="pf-field-label">
                  <span>Mot de passe</span>
                  <span dir="rtl">كلمة المرور</span>
                </div>
                <div className="pf-password-row">
                  <div
                    className="pf-info-box"
                    style={{ letterSpacing: "0.15em", color: "#8EA58C" }}
                  >
                    ••••••••
                  </div>
                  <button
                    type="button"
                    className="pf-lock-btn"
                    onClick={() => setShowPasswordModal(true)}
                    title={
                      isAr ? "تغيير كلمة المرور" : "Changer le mot de passe"
                    }
                  >
                    <svg viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons — centered */}
          <div className="pf-footer">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="pf-btn-cancel"
                  onClick={() => setIsEditing(false)}
                >
                  {isAr ? "إلغاء" : "Annuler"}
                </button>
                <button type="submit" className="pf-btn-save">
                  {isAr ? "حفظ" : "Enregistrer"}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="pf-btn-modify"
                onClick={() => setIsEditing(true)}
              >
                {isAr ? "تعديل" : "Modifier"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="pf-overlay">
          <div className="pf-modal" dir={isAr ? "rtl" : "ltr"}>
            <h3 className="pf-modal-title">
              {isAr ? "تغيير كلمة المرور" : "Changer le mot de passe"}
            </h3>
            <form onSubmit={handlePasswordChange} className="pf-modal-form">
              <div>
                <label className="pf-modal-label">
                  {isAr ? "القديمة" : "Ancien"}
                </label>
                <input
                  type="password"
                  className="pf-modal-input"
                  required
                  value={passwords.old_password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, old_password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="pf-modal-label">
                  {isAr ? "الجديدة" : "Nouveau"}
                </label>
                <input
                  type="password"
                  className="pf-modal-input"
                  required
                  value={passwords.new_password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new_password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="pf-modal-label">
                  {isAr ? "تأكيد" : "Confirmer"}
                </label>
                <input
                  type="password"
                  className="pf-modal-input"
                  required
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                />
              </div>
              <div className="pf-modal-footer">
                <button
                  type="button"
                  className="pf-modal-btn-cancel"
                  onClick={() => setShowPasswordModal(false)}
                >
                  {isAr ? "إلغاء" : "Annuler"}
                </button>
                <button type="submit" className="pf-modal-btn-save">
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

export default Profile;
