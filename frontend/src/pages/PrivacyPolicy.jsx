import React from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1.5rem", fontFamily: "sans-serif", lineHeight: "1.6", color: "#2d3748" }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: "1rem", padding: "0.4rem 0.8rem", cursor: "pointer", background: "#edf2f7", border: "1px solid #cbd5e0", borderRadius: "4px" }}
      >
        ← Retour
      </button>

      <h1 style={{ color: "#1a202c" }}>Politique de Confidentialité - ProfManager</h1>
      <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>

      <h2>1. Collecte des données</h2>
      <p>ProfManager collecte des données strictement nécessaires à la gestion pédagogique : nom, prénom, adresse e-mail, ainsi que les données relatives aux classes, aux séances et au suivi des élèves.</p>

      <h2>2. Utilisation des cookies et des services tiers</h2>
      <p>Nous pouvons faire appel à des régies publicitaires tierces, notamment <strong>Google AdSense</strong>, pour diffuser des annonces lors de vos visites sur notre site. Ces partenaires peuvent utiliser des cookies pour diffuser des annonces adaptées aux centres d'intérêt des utilisateurs.</p>

      <h2>3. Sécurité et protection des données</h2>
      <p>Les données scolaires et personnelles sont hébergées sur des bases de données chiffrées et sécurisées. Elles ne sont en aucun cas revendues à des tiers.</p>

      <h2>4. Contact</h2>
      <p>Pour toute question ou demande de rectification, contactez l'administration via l'application ou à l'adresse du support.</p>
    </div>
  );
};

export default PrivacyPolicy;
