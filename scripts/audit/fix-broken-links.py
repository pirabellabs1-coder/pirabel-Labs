"""
fix-broken-links.py
Apply curated string replacements to fix the broken hrefs identified by
check-404.py. Operates on every .html file outside node_modules.

The replacements are deliberately narrow — full-string href values, not
partial text — so they cannot accidentally match unrelated content.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKIP_DIRS = ("node_modules", ".git", ".vercel", "scratch")

# Pairs are applied verbatim against the entire HTML text. Each replacement
# is a precise href / src value, not a generic substring, so collisions are
# extremely unlikely.
REPLACEMENTS = [
    # 1) "agency-*" → "agence-*" typos (English-style spelling kept by mistake)
    ('../../../agency-ia-automatisation/', '/en/agence-ia-automatisation/'),
    ('../../agency-ia-automatisation/', '/en/agence-ia-automatisation/'),
    ('../../agency-ia-automation/', '/en/agence-ia-automatisation/'),
    ('../../agency-creation-sites-web/', '/en/agence-creation-sites-web/'),
    ('../../agency-design-branding/', '/en/agence-design-branding/'),
    ('../../agency-email-marketing-crm/', '/en/agence-email-marketing-crm/'),
    ('../../agency-publicite-payante-sea-ads/', '/en/agence-publicite-payante-sea-ads/'),
    ('../../agency-redaction-content-marketing/', '/en/agence-redaction-content-marketing/'),
    ('../../agency-sales-funnels-cro/', '/en/agence-sales-funnels-cro/'),
    ('../../agency-seo-referencement-naturel/', '/en/agence-seo-referencement-naturel/'),
    ('../../agency-social-media/', '/en/agence-social-media/'),
    ('../../agency-video-motion-design/', '/en/agence-video-motion-design/'),

    # Same typos may also appear in absolute /en/ form
    ('/en/agency-ia-automatisation/', '/en/agence-ia-automatisation/'),
    ('/en/agency-creation-sites-web/', '/en/agence-creation-sites-web/'),
    ('/en/agency-design-branding/', '/en/agence-design-branding/'),
    ('/en/agency-email-marketing-crm/', '/en/agence-email-marketing-crm/'),
    ('/en/agency-publicite-payante-sea-ads/', '/en/agence-publicite-payante-sea-ads/'),
    ('/en/agency-redaction-content-marketing/', '/en/agence-redaction-content-marketing/'),
    ('/en/agency-sales-funnels-cro/', '/en/agence-sales-funnels-cro/'),
    ('/en/agency-seo-referencement-naturel/', '/en/agence-seo-referencement-naturel/'),
    ('/en/agency-social-media/', '/en/agence-social-media/'),
    ('/en/agency-video-motion-design/', '/en/agence-video-motion-design/'),

    # 2) /en/agence-video-wordion-design/  (wordion → motion typo)
    ('/en/agence-video-wordion-design/', '/en/agence-video-motion-design/'),
    ('agence-video-wordion-design', 'agence-video-motion-design'),

    # 3) /en/results → /en/resultats (no /en/results.html or vercel route)
    ('"/en/results"', '"/en/resultats"'),
    ("'/en/results'", "'/en/resultats'"),
    ('href="/en/results">', 'href="/en/resultats">'),

    # 4) /en/appointment → /en/rendez-vous (en/rendez-vous.html exists)
    ('"/en/appointment"', '"/en/rendez-vous"'),
    ("'/en/appointment'", "'/en/rendez-vous'"),

    # 5) /en/status → /status (status.html only exists at root)
    ('"/en/status"', '"/status"'),
    ("'/en/status'", "'/status'"),

    # 6) Stray typo "completeeee" (5 e's) → "complet" (matches existing file)
    ('influence-marketing-guide-completeeee.html', 'influence-marketing-guide-complet.html'),

    # 7) Service sub-pages from city pages: ../../<file>.html → ../<file>.html
    #    The city pages live at /en/agence-X/<service>/<city>.html so going up
    #    one level lands on /en/agence-X/ where the service.html lives.
    #    These are listed individually so we never touch unrelated `..` links.
]

# All ../../ → ../ for the specific service files identified by the audit.
# Listed individually for safety.
TWO_UP_TO_ONE_UP = [
    'ab-testing.html', 'agents-ia.html', 'articles-blog-seo.html',
    'audit-seo.html', 'campaigns-emailing.html', 'charte-graphique.html',
    'chatbots-ia.html', 'community-management.html', 'copywriting.html',
    'creation-contenu-social.html', 'creation-logo.html', 'crm-setup.html',
    'developpement-sur-mesure.html', 'direction-artistique.html',
    'figma-ui-design.html', 'google-ads.html', 'identite-visuelle.html',
    'influence-marketing.html', 'landing-pages.html', 'linkedin-ads.html',
    'make-automation.html', 'marketing-automation.html',
    'meta-ads-facebook-instagram.html', 'montage-video.html',
    'motion-design.html', 'n8n-automation.html', 'netlinking.html',
    'optimisation-conversion.html', 'packaging-design.html',
    'pages-de-vente.html', 'redaction-seo.html', 'seo-local.html',
    'seo-technique.html', 'sequences-nurturing.html', 'shopify.html',
    'strategie-editorial.html', 'strategie-social-media.html',
    'tiktok-ads.html', 'tunnels-de-vente.html', 'video-corporate.html',
    'video-reseaux-sociaux.html', 'webflow.html', 'wordpress.html',
    'zapier-automation.html',
]
for f in TWO_UP_TO_ONE_UP:
    REPLACEMENTS.append((f'href="../../{f}"', f'href="../{f}"'))


# === Pass 2 fixes — typos & wrong slugs ===
TYPO_FIXES = [
    # Service hub-page sub-pages — EN slugs that don't exist; use FR slug.
    ('strategie-editorial.html', 'strategie-editoriale.html'),
    ('make-automation.html', 'make-automatisation.html'),
    ('n8n-automation.html', 'n8n-automatisation.html'),
    ('zapier-automation.html', 'zapier-automatisation.html'),
    ('campaigns-emailing.html', 'campagnes-emailing.html'),

    # Guide / blog filename typos & EN-pseudo-slugs
    ('seo-local-google-entreprise.html', 'seo-local-google-business.html'),
    ('retargeting-stratégies-avancées.html', 'retargeting-strategies-avancees.html'),
    ('retargeting-strategys-advanced.html', 'retargeting-strategies-avancees.html'),
    ('automation-marketing-ia-guide.html', 'automatisation-marketing-ia-guide.html'),
    ('chatbot-ia-business-guide.html', 'chatbot-ia-entreprise-guide.html'),
    ('strategy-netlinking-ethique.html', 'strategie-netlinking-ethique.html'),
    ('guide-completeeee-seo-debutant.html', 'guide-complet-seo-debutant.html'),
    ('guide-complete-seo-debutant.html', 'guide-complet-seo-debutant.html'),
    ('meta-ads-king-maximize.html', 'meta-ads-roi-maximiser.html'),
    ('how-create-site-web-high-performing-2026.html', 'comment-creer-site-web-performant-2026.html'),
    ('budget-publicitaire-optimize.html', 'budget-publicitaire-optimiser.html'),
    ('audit-seo-checklist-completeeeee.html', 'audit-seo-checklist-complete.html'),
    ('tunnel-vente-create-optimize.html', 'tunnel-vente-creer-optimiser.html'),
    ('ab-testing-guide-completeeee.html', 'ab-testing-guide-complet.html'),
    ('claude-ia-business.html', 'claude-ia-entreprise.html'),
    ('comment-create-site-web-high-performing-2026.html', 'comment-creer-site-web-performant-2026.html'),
    ('meta-ads-roi-maximize.html', 'meta-ads-roi-maximiser.html'),
    ('retargeting-strategys-avancées.html', 'retargeting-strategies-avancees.html'),
    ('ab-testing-guide-complete.html', 'ab-testing-guide-complet.html'),
    ('strategy-social-media-2026.html', 'strategie-social-media-2026.html'),
    ('email-marketing-guide-complete.html', 'email-marketing-guide-complet.html'),
    ('content-marketing-strategy-guide.html', 'content-marketing-strategie-guide.html'),
    ('identite-visuelle-create-guide.html', 'identite-visuelle-creer-guide.html'),
]
REPLACEMENTS.extend(TYPO_FIXES)


# === Pass 3 fixes — admin/app route aliases ===
# Each pair: (English-named route inside an HTML, the FR-named route that the
# Vercel config actually understands). The HTML usually has these as exact
# href values like /manage-appointments, /modify-quote, etc.
ROUTE_FIXES = [
    ('href="/manage-appointments"', 'href="/gerer-rendez-vous"'),
    ("href='/manage-appointments'", "href='/gerer-rendez-vous'"),
    ('href="/modify-quote"', 'href="/modifier-devis"'),
    ("href='/modify-quote'", "href='/modifier-devis'"),
    ('href="/appointment"', 'href="/rendez-vous"'),
    ("href='/appointment'", "href='/rendez-vous'"),
]
REPLACEMENTS.extend(ROUTE_FIXES)


def should_skip(p: Path) -> bool:
    s = str(p).replace("\\", "/")
    return any(("/" + x + "/") in ("/" + s + "/") for x in SKIP_DIRS)


def main():
    changed = 0
    same = 0
    total_replacements = 0

    for f in ROOT.rglob("*.html"):
        if should_skip(f):
            continue
        try:
            html = f.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        new = html
        file_replacements = 0
        for src, dst in REPLACEMENTS:
            if src in new:
                file_replacements += new.count(src)
                new = new.replace(src, dst)
        if new != html:
            f.write_text(new, encoding="utf-8", newline="")
            changed += 1
            total_replacements += file_replacements
        else:
            same += 1

    print(f"Files changed: {changed}")
    print(f"Files unchanged: {same}")
    print(f"Replacements applied: {total_replacements}")


if __name__ == "__main__":
    main()
