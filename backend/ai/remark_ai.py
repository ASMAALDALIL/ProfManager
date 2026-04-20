def generate_remark(data, note, lang="fr"):
    """
    data = {
        "comportement_moy": float,
        "participation_moy": float,
        "absence_pct": float,
        "devoirs_oubli_pct": float,
        "materiel_oubli_pct": float
    }
    """

    lexicon = {
        "fr": {
            "abs_total": "Absence totale pendant le semestre.",
            "abs": "absences fréquentes",
            "comp": "comportement à améliorer",
            "part": "participation faible",
            "org": "manque d'organisation",
            "dev": "devoirs souvent non faits",
            "excellent": "Excellent élève, très sérieux et impliqué.",
            "good": "Bon travail dans l'ensemble.",
            "average": "Résultats moyens.",
            "insufficient": "Résultats insuffisants, plus d'efforts sont nécessaires.",
            "but": "toutefois"
        },
        "ar": {
            "abs_total": "غياب كلي خلال الفصل الدراسي.",
            "abs": "غيابات متكررة",
            "comp": "السلوك يحتاج إلى تحسين",
            "part": "مشاركة ضعيفة",
            "org": "نقص في التنظيم",
            "dev": "الواجبات غالباً غير منجزة",
            "excellent": "تلميذ ممتاز، جدي ومثابر جداً.",
            "good": "عمل جيد بشكل عام.",
            "average": "نتائج متوسطة.",
            "insufficient": "نتائج غير كافية، بذل المزيد من الجهد ضروري.",
            "but": "لكن"
        }
    }

    t = lexicon.get(lang, lexicon["fr"])
    issues = []

    # récupération sécurisée
    abs_pct = data.get("absence_pct", 0)
    comp = data.get("comportement_moy", 5)
    part = data.get("participation_moy", 5)
    devoir = data.get("devoirs_oubli_pct", 0)
    materiel = data.get("materiel_oubli_pct", 0)

    # cas absence totale
    if abs_pct >= 1:
        return t["abs_total"]

    # détection des points faibles
    if abs_pct >= 0.3:
        issues.append(t["abs"])

    if comp < 2.5:
        issues.append(t["comp"])

    if part < 2.5:
        issues.append(t["part"])

    if materiel >= 0.4:
        issues.append(t["org"])

    if devoir >= 0.4:
        issues.append(t["dev"])

    # remarque globale selon note
    if note >= 18:
        return t["excellent"]

    elif note >= 14:
        res = t["good"]
        if issues:
            res += f", {t['but']} : " + ", ".join(issues) + "."
        return res

    elif note >= 10:
        res = t["average"]
        if issues:
            res += f". {t['but']} : " + ", ".join(issues) + "."
        return res

    else:
        res = t["insufficient"]
        if issues:
            res += f" {t['but']} : " + ", ".join(issues) + "."
        return res