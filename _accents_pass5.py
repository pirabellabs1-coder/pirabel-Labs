"""5e passe d'accents et corrections orthographiques."""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))

# Corrections : mot sans accent -> mot avec accent
# Word boundaries pour eviter de modifier des sous-strings
CORRECTIONS = [
    # Verbes courants
    (r"\baccompagne\b", "accompagne"),  # déjà bien
    (r"\bdeja\b", "déjà"),
    (r"\bDeja\b", "Déjà"),
    (r"\bdedie\b", "dédié"),
    (r"\bDedie\b", "Dédié"),
    (r"\bdediee\b", "dédiée"),
    (r"\bDediee\b", "Dédiée"),
    (r"\bdedies\b", "dédiés"),
    (r"\bdediees\b", "dédiées"),
    (r"\bcree\b", "créé"),
    (r"\bcrees\b", "créés"),
    (r"\bcreee\b", "créée"),
    (r"\bcreees\b", "créées"),
    (r"\beprouvee\b", "éprouvée"),
    (r"\beprouvees\b", "éprouvées"),
    (r"\beprouve\b", "éprouvé"),
    (r"\beprouves\b", "éprouvés"),
    (r"\bcontextualisee\b", "contextualisée"),
    (r"\bcontextualisees\b", "contextualisées"),
    (r"\benrichies\b", "enrichies"),
    (r"\benrichie\b", "enrichie"),
    (r"\bcommence\b", "commencé"),  # only when past participle
    # Adjectifs courants
    (r"\bdetaille\b", "détaillé"),
    (r"\bDetaille\b", "Détaillé"),
    (r"\bdetaillee\b", "détaillée"),
    (r"\bDetaillee\b", "Détaillée"),
    (r"\bdetailles\b", "détaillés"),
    (r"\bdetaillees\b", "détaillées"),
    (r"\bdetaillee\b", "détaillée"),
    (r"\bspecifique\b", "spécifique"),
    (r"\bSpecifique\b", "Spécifique"),
    (r"\bspecifiques\b", "spécifiques"),
    (r"\bspecifiquement\b", "spécifiquement"),
    (r"\bspecialise\b", "spécialisé"),
    (r"\bspecialisee\b", "spécialisée"),
    (r"\bspecialises\b", "spécialisés"),
    (r"\bspecialisees\b", "spécialisées"),
    (r"\bspecialement\b", "spécialement"),
    (r"\bspeciale\b", "spéciale"),
    (r"\bspecial\b", "spécial"),
    (r"\bSpecial\b", "Spécial"),
    (r"\bspecialiste\b", "spécialiste"),
    (r"\bspecialistes\b", "spécialistes"),
    (r"\bspecialite\b", "spécialité"),
    (r"\bspecialites\b", "spécialités"),
    (r"\bgenerique\b", "générique"),
    (r"\bgeneriques\b", "génériques"),
    (r"\bgeneral\b", "général"),
    (r"\bgenerale\b", "générale"),
    (r"\bgeneralement\b", "généralement"),
    (r"\bgeneraux\b", "généraux"),
    (r"\bGeneraux\b", "Généraux"),
    (r"\bGeneral\b", "Général"),
    (r"\bGenerale\b", "Générale"),
    (r"\bcompetence\b", "compétence"),
    (r"\bcompetences\b", "compétences"),
    (r"\bCompetence\b", "Compétence"),
    (r"\bCompetences\b", "Compétences"),
    (r"\bperformant\b", "performant"),  # déjà ok
    (r"\bcoherent\b", "cohérent"),
    (r"\bcoherente\b", "cohérente"),
    (r"\bcoherents\b", "cohérents"),
    (r"\bcoherentes\b", "cohérentes"),
    (r"\bcoherence\b", "cohérence"),
    (r"\bcoherences\b", "cohérences"),
    (r"\bdifference\b", "différence"),
    (r"\bdifferences\b", "différences"),
    (r"\bdifferent\b", "différent"),
    (r"\bdifferents\b", "différents"),
    (r"\bdifferente\b", "différente"),
    (r"\bdifferentes\b", "différentes"),
    (r"\bdifferemment\b", "différemment"),
    (r"\bpreference\b", "préférence"),
    (r"\bpreferences\b", "préférences"),
    (r"\bprefere\b", "préfère"),
    (r"\bpreferer\b", "préférer"),
    (r"\bpreference\b", "préférence"),
    # Mots usuels
    (r"\bdejà\b", "déjà"),  # corrige typo
    (r"\breference\b", "référence"),
    (r"\breferences\b", "références"),
    (r"\bReference\b", "Référence"),
    (r"\bReferences\b", "Références"),
    (r"\bReferencement\b", "Référencement"),
    (r"\breferencement\b", "référencement"),
    (r"\bevaluation\b", "évaluation"),
    (r"\bevaluations\b", "évaluations"),
    (r"\bevaluer\b", "évaluer"),
    (r"\bevolution\b", "évolution"),
    (r"\bevolutions\b", "évolutions"),
    (r"\bEvolution\b", "Évolution"),
    (r"\bEvolutions\b", "Évolutions"),
    (r"\bevolutif\b", "évolutif"),
    (r"\bevolutive\b", "évolutive"),
    (r"\bevolutifs\b", "évolutifs"),
    (r"\bevolutivite\b", "évolutivité"),
    (r"\bexperimente\b", "expérimenté"),
    (r"\bexperimentee\b", "expérimentée"),
    (r"\bexperimentes\b", "expérimentés"),
    (r"\bexperimentees\b", "expérimentées"),
    (r"\bexperience\b", "expérience"),
    (r"\bexperiences\b", "expériences"),
    (r"\bExperience\b", "Expérience"),
    (r"\bExperiences\b", "Expériences"),
    (r"\bexpertise\b", "expertise"),  # ok
    # Reseau / reseaux
    (r"\breseau\b", "réseau"),
    (r"\breseaux\b", "réseaux"),
    (r"\bReseau\b", "Réseau"),
    (r"\bReseaux\b", "Réseaux"),
    # Reception
    (r"\breception\b", "réception"),
    (r"\bReception\b", "Réception"),
    # Realisation
    (r"\brealisation\b", "réalisation"),
    (r"\brealisations\b", "réalisations"),
    (r"\bRealisation\b", "Réalisation"),
    (r"\bRealisations\b", "Réalisations"),
    (r"\brealise\b", "réalisé"),
    (r"\brealisee\b", "réalisée"),
    (r"\brealises\b", "réalisés"),
    (r"\brealisees\b", "réalisées"),
    (r"\brealiser\b", "réaliser"),
    # Service / activite
    (r"\bactivite\b", "activité"),
    (r"\bactivites\b", "activités"),
    (r"\bActivite\b", "Activité"),
    (r"\bActivites\b", "Activités"),
    # Conformite
    (r"\bconformite\b", "conformité"),
    (r"\bconformites\b", "conformités"),
    # Securite
    (r"\bsecurite\b", "sécurité"),
    (r"\bSecurite\b", "Sécurité"),
    (r"\bsecurise\b", "sécurisé"),
    (r"\bsecurisee\b", "sécurisée"),
    (r"\bsecurises\b", "sécurisés"),
    (r"\bsecurisation\b", "sécurisation"),
    # Identite
    (r"\bidentite\b", "identité"),
    (r"\bidentites\b", "identités"),
    (r"\bIdentite\b", "Identité"),
    # Verite, qualite, etc.
    (r"\bqualite\b", "qualité"),
    (r"\bqualites\b", "qualités"),
    (r"\bQualite\b", "Qualité"),
    (r"\bQualites\b", "Qualités"),
    # Methode
    (r"\bmethode\b", "méthode"),
    (r"\bmethodes\b", "méthodes"),
    (r"\bMethode\b", "Méthode"),
    (r"\bMethodes\b", "Méthodes"),
    (r"\bmethodologie\b", "méthodologie"),
    (r"\bMethodologie\b", "Méthodologie"),
    # Categorie
    (r"\bcategorie\b", "catégorie"),
    (r"\bcategories\b", "catégories"),
    (r"\bCategorie\b", "Catégorie"),
    (r"\bCategories\b", "Catégories"),
    # Penurie
    (r"\bpenurie\b", "pénurie"),
    (r"\bPenurie\b", "Pénurie"),
    # Strategie
    (r"\bstrategie\b", "stratégie"),
    (r"\bstrategies\b", "stratégies"),
    (r"\bStrategie\b", "Stratégie"),
    (r"\bStrategies\b", "Stratégies"),
    (r"\bstrategique\b", "stratégique"),
    (r"\bstrategiques\b", "stratégiques"),
    # Etape
    (r"\betape\b", "étape"),
    (r"\betapes\b", "étapes"),
    (r"\bEtape\b", "Étape"),
    (r"\bEtapes\b", "Étapes"),
    # Premiere
    (r"\bpremiere\b", "première"),
    (r"\bpremieres\b", "premières"),
    (r"\bPremiere\b", "Première"),
    (r"\bPremieres\b", "Premières"),
    (r"\bderniere\b", "dernière"),
    (r"\bdernieres\b", "dernières"),
    # Probleme
    (r"\bprobleme\b", "problème"),
    (r"\bproblemes\b", "problèmes"),
    (r"\bProbleme\b", "Problème"),
    (r"\bProblemes\b", "Problèmes"),
    # Systeme
    (r"\bsysteme\b", "système"),
    (r"\bsystemes\b", "systèmes"),
    (r"\bSysteme\b", "Système"),
    (r"\bSystemes\b", "Systèmes"),
    # Modele
    (r"\bmodele\b", "modèle"),
    (r"\bmodeles\b", "modèles"),
    (r"\bModele\b", "Modèle"),
    (r"\bModeles\b", "Modèles"),
    # Decouvrir / Decouverte
    (r"\bdecouvrir\b", "découvrir"),
    (r"\bDecouvrir\b", "Découvrir"),
    (r"\bdecouverte\b", "découverte"),
    (r"\bDecouverte\b", "Découverte"),
    # Reponse
    (r"\breponse\b", "réponse"),
    (r"\breponses\b", "réponses"),
    (r"\bReponse\b", "Réponse"),
    (r"\bReponses\b", "Réponses"),
    (r"\brepondre\b", "répondre"),
    (r"\brepondent\b", "répondent"),
    (r"\brepond\b", "répond"),
    # Resultat / Resultats
    (r"\bresultat\b", "résultat"),
    (r"\bresultats\b", "résultats"),
    (r"\bResultat\b", "Résultat"),
    (r"\bResultats\b", "Résultats"),
    # Frequence
    (r"\bfrequent\b", "fréquent"),
    (r"\bfrequents\b", "fréquents"),
    (r"\bfrequente\b", "fréquente"),
    (r"\bfrequentes\b", "fréquentes"),
    (r"\bfrequemment\b", "fréquemment"),
    # Conseillere
    (r"\bconsidere\b", "considéré"),
    (r"\bconsiderer\b", "considérer"),
    # Materiel
    (r"\bmateriel\b", "matériel"),
    (r"\bmateriels\b", "matériels"),
    # Conseillere
    (r"\bMateriel\b", "Matériel"),
    # Plus etc.
    (r"\bdeveloppe\b", "développé"),
    (r"\bdeveloppee\b", "développée"),
    (r"\bdeveloppes\b", "développés"),
    (r"\bdeveloppees\b", "développées"),
    (r"\bdeveloppement\b", "développement"),
    (r"\bDeveloppement\b", "Développement"),
    (r"\bdeveloppeur\b", "développeur"),
    (r"\bdeveloppeurs\b", "développeurs"),
    (r"\bdevelopper\b", "développer"),
    # Production / produire
    (r"\bproduit\b", "produit"),  # ok
    # Modere
    (r"\bdere\b", "déré"),
]

# Filter to keep only changes (where x != y in lowercase ASCII vs accented)
# Some entries are pass-through (no change), skip those
FILTERED = []
for pat, repl in CORRECTIONS:
    # Skip if the unaccented pattern (stripped of \b) matches the accented replacement
    pattern_text = pat.replace(r"\b", "")
    if pattern_text != repl:
        FILTERED.append((pat, repl))

count = 0
total_changes = 0
for fn in sorted(os.listdir(ROOT)):
    if not fn.endswith(".html"):
        continue
    fpath = os.path.join(ROOT, fn)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    original = content
    file_changes = 0
    for pattern, repl in FILTERED:
        new_content, n = re.subn(pattern, repl, content)
        if n > 0:
            file_changes += n
            content = new_content
    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        count += 1
        total_changes += file_changes

print(f"Total: {count} fichiers modifies, {total_changes} accents corriges")
