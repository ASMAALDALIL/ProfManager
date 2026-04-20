import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      // --- Authentification ---
      "email": "Email",
      "password": "Mot de passe",
      "confirm_password": "Confirmer le mot de passe",
      "firstname": "Prénom",
      "lastname": "Nom",
      "phone": "Téléphone",
      "cycle_select": "Sélect. Cycle",
      "btn_login": "Se connecter",
      "btn_send_code": "Envoyer le code",
      "btn_verify": "Vérifier",
      "btn_finish": "Terminer l'inscription",
      "code_placeholder": "Code",
      "no_account": "Pas de compte ?",
      "link_register": "S'inscrire",

      // --- Sidebar (Menu) ---
      "Gestion des classes": "Gestion des classes",
      "Gestion des étudiants": "Gestion des étudiants",
      "Gestion des sessions": "Gestion des sessions",
      "Calculateur de Notes": "Calculateur de Notes",
      "Profil": "Profil",
      "Déconnexion": "Déconnexion"
    }
  },
  ar: {
    translation: {
      // --- Authentification ---
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "confirm_password": "تأكيد كلمة المرور",
      "firstname": "الاسم",
      "lastname": "النسب",
      "phone": "الهاتف",
      "cycle_select": "السلك الدراسي",
      "btn_login": "تسجيل الدخول",
      "btn_send_code": "إرسال الرمز",
      "btn_verify": "تحقق",
      "btn_finish": "إنهاء التسجيل",
      "code_placeholder": "الرمز",
      "no_account": "ليس لديك حساب؟",
      "link_register": "إنشاء حساب",

      // --- Sidebar (Menu) ---
      "Gestion des classes": "تسيير الأقسام",
      "Gestion des étudiants": "تسيير التلاميذ",
      "Gestion des sessions": "تسيير الحصص",
      "Calculateur de Notes": "حاسبة النقط",
      "Profil": "الملف الشخصي",
      "Déconnexion": "تسجيل الخروج"
    }
  }
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false }
});

export default i18n;