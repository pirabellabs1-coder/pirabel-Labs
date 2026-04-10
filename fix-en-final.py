#!/usr/bin/env python3
"""Final cleanup of remaining French fragments in /en/."""
import os

EN_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "en")

FIXES = [
    # Remaining fragments found in city pages
    ("UNE AGENCY QUI CONNAIT", "AN AGENCY THAT KNOWS"),
    ("UNE AGENCY QUI CONNA&Icirc;T", "AN AGENCY THAT KNOWS"),
    ("Paris est the French capital", "Paris is the French capital"),
    ("Lyon est the French capital", "Lyon is"),
    ("Marseille est", "Marseille is"),
    ("Cotonou est", "Cotonou is"),
    ("Casablanca est", "Casablanca is"),
    ("Dakar est", "Dakar is"),
    ("Abidjan est", "Abidjan is"),
    ("Tunis est", "Tunis is"),
    ("Bruxelles est", "Brussels is"),
    ("Montréal est", "Montreal is"),
    ("Montr&eacute;al est", "Montreal is"),
    ("Looking for an agency Websites in", "Looking for a web agency in"),
    ("Looking for an agency SEO in", "Looking for an SEO agency in"),
    ("Looking for an agency Design in", "Looking for a design agency in"),
    ("Looking for an agency IA in", "Looking for an AI agency in"),
    ("Looking for an agency Social Media in", "Looking for a social media agency in"),
    ("Looking for an agency Email in", "Looking for an email marketing agency in"),
    ("Looking for an agency Video in", "Looking for a video agency in"),
    ("Looking for an agency Websites", "Looking for a web agency"),
    ("Looking for an agency SEO", "Looking for an SEO agency"),
    ("Our services Websites", "Our web services"),
    ("Our services Websites", "Our web services"),
    ("your Websites strategy", "your web strategy"),
    ("your SEO strategy", "your SEO strategy"),
    ("your Design strategy", "your design strategy"),
    ("your IA strategy", "your AI strategy"),
    # Schema.org
    ('"name":"Pirabel Labs Paris"', '"name":"Pirabel Labs Paris"'),
    ("Agence digitale premium a ", "Premium digital agency in "),
    ("agence Websites", "web agency"),
    ("agence SEO", "SEO agency"),
    ("agence Design", "design agency"),
    # Mixed language in meta
    ("tailored pour businesses in", "tailored solutions for businesses in"),
    ("Solutions Website Creation tailored", "Tailored Website Creation solutions"),
    ("Solutions SEO tailored", "Tailored SEO solutions"),
    ("Solutions Design tailored", "Tailored Design solutions"),
    # "est" fragments in city descriptions
    (" est la capitale economique", " is the economic capital"),
    (" est la capitale &eacute;conomique", " is the economic capital"),
    (" est la capital francaise", " is the French capital"),
    (" est la capitale francaise", " is the French capital"),
    (" est la plus grande ville", " is the largest city"),
    (" est un hub economique", " is an economic hub"),
    (" est un hub &eacute;conomique", " is an economic hub"),
    (" est le poumon economique", " is the economic engine"),
    (" est le poumon &eacute;conomique", " is the economic engine"),
    (" est la porte d entree", " is the gateway"),
    (" est la porte d&rsquo;entr&eacute;e", " is the gateway"),
    (" est un carrefour strategique", " is a strategic crossroads"),
    (" est un carrefour strat&eacute;gique", " is a strategic crossroads"),
    (" est une metropole dynamique", " is a dynamic metropolis"),
    (" est une m&eacute;tropole dynamique", " is a dynamic metropolis"),
    (" est une ville en plein essor", " is a booming city"),
    (" est la deuxieme ville", " is the second city"),
    (" est la deuxi&egrave;me ville", " is the second city"),
    (" est la troisieme ville", " is the third city"),
    (" est la troisi&egrave;me ville", " is the third city"),
    # Fix double "in in" from cascading replacements
    ("in in Paris", "in Paris"),
    ("in in Lyon", "in Lyon"),
    ("in in Marseille", "in Marseille"),
    ("in in Cotonou", "in Cotonou"),
    ("in in Casablanca", "in Casablanca"),
    ("in in Dakar", "in Dakar"),
    ("in in Abidjan", "in Abidjan"),
    ("in in Tunis", "in Tunis"),
    ("in in Brussels", "in Brussels"),
    ("in in Montreal", "in Montreal"),
]

count = 0
for root, dirs, files in os.walk(EN_DIR):
    for f in files:
        if not f.endswith('.html'):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8', errors='replace') as fh:
            content = fh.read()
        original = content
        for fr, en in FIXES:
            content = content.replace(fr, en)
        if content != original:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(content)
            count += 1

print(f"Final fixes: {count} files")
