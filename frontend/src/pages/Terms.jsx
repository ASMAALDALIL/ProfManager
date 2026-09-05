import React from "react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1.5rem", fontFamily: "sans-serif", lineHeight: "1.6", color: "#2d3748" }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: "1rem", padding: "0.4rem 0.8rem", cursor: "pointer", background: "#edf2f7", border: "1px solid #cbd5e0", borderRadius: "4px" }}
      >
        ← Retour
      </button>

      <h1 style={{ color: "#1a202c" }}>Conditions Générales d'Utilisation</h1>
      
      <h2>1. Accès au service</h2>
      <p>ProfManager est une plateforme d'aide à la gestion pédagogique mise à disposition des enseignants. L'utilisation du service nécessite la création d'un compte personnel.</p>

      <h2>2. Responsabilité</h2>
      <p>L'utilisateur est responsable de la confidentialité de ses identifiants de connexion et de l'exactitude des évaluations et données saisies.</p>

      <h2>3. Propriété intellectuelle</h2>
      <p>Tous les éléments graphiques, modèles algorithmiques et fonctionnalités de ProfManager sont la propriété exclusive de leurs auteurs respectifs.</p>
    </div>
  );
};

export default Terms;
