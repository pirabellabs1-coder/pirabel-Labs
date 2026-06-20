# -*- coding: utf-8 -*-
# Génère un livre blanc PDF brandé Pirabel Labs.
# Usage: python scripts/make_pdf.py <contenu.json> <sortie.pdf>
import sys, json, html
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, PageBreak, NextPageTemplate, KeepTogether)

DARK = colors.HexColor('#0e0e0e')
ORANGE = colors.HexColor('#FF5500')
INK = colors.HexColor('#1c1c1c')
MUTED = colors.HexColor('#666666')
PAGEW, PAGEH = A4

def esc(s):
    return html.escape(str(s or ''), quote=False)

def main():
    data = json.load(open(sys.argv[1], encoding='utf-8'))
    out = sys.argv[2]
    year = data.get('year', 2026)
    cat = data.get('category', 'Guide')

    def cover_bg(c, doc):
        c.saveState()
        c.setFillColor(DARK); c.rect(0, 0, PAGEW, PAGEH, fill=1, stroke=0)
        c.setFillColor(ORANGE); c.setFillAlpha(0.16)
        c.circle(PAGEW - 25*mm, PAGEH - 35*mm, 55*mm, fill=1, stroke=0)
        c.circle(15*mm, 45*mm, 38*mm, fill=1, stroke=0)
        c.setFillAlpha(1)
        c.setFillColor(ORANGE); c.rect(0, 0, PAGEW, 10*mm, fill=1, stroke=0)
        c.setFont('Helvetica-Bold', 13); c.setFillColor(colors.white)
        c.drawString(20*mm, PAGEH - 22*mm, 'Pirabel')
        c.setFillColor(ORANGE); c.drawString(20*mm + c.stringWidth('Pirabel', 'Helvetica-Bold', 13), PAGEH - 22*mm, 'Labs')
        c.restoreState()

    def body_bg(c, doc):
        c.saveState()
        c.setStrokeColor(colors.HexColor('#e2e2e2')); c.setLineWidth(0.5)
        c.line(20*mm, 15*mm, PAGEW - 20*mm, 15*mm)
        c.setFont('Helvetica', 8); c.setFillColor(MUTED)
        c.drawString(20*mm, 10*mm, 'Pirabel Labs  ·  Livre blanc')
        c.drawRightString(PAGEW - 20*mm, 10*mm, 'pirabellabs.com  ·  %d' % doc.page)
        c.restoreState()

    doc = BaseDocTemplate(out, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm,
                          topMargin=24*mm, bottomMargin=22*mm,
                          title=data['title'], author='Pirabel Labs')
    coverF = Frame(20*mm, 24*mm, PAGEW - 40*mm, PAGEH - 92*mm, id='c')
    bodyF = Frame(20*mm, 20*mm, PAGEW - 40*mm, PAGEH - 46*mm, id='b')
    doc.addPageTemplates([
        PageTemplate(id='cover', frames=[coverF], onPage=cover_bg),
        PageTemplate(id='body', frames=[bodyF], onPage=body_bg),
    ])

    eyebrow = ParagraphStyle('e', fontName='Helvetica-Bold', fontSize=11, textColor=ORANGE, leading=15, spaceAfter=4)
    ctitle = ParagraphStyle('ct', fontName='Helvetica-Bold', fontSize=29, textColor=colors.white, leading=34, spaceAfter=12)
    csub = ParagraphStyle('cs', fontName='Helvetica', fontSize=13.5, textColor=colors.HexColor('#cfcfcf'), leading=19)
    cmeta = ParagraphStyle('cm', fontName='Helvetica-Bold', fontSize=11, textColor=colors.HexColor('#9a9a9a'), leading=16)
    h2 = ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=15, textColor=ORANGE, leading=19, spaceBefore=16, spaceAfter=7)
    h3 = ParagraphStyle('h3', fontName='Helvetica-Bold', fontSize=11.5, textColor=INK, leading=15, spaceBefore=8, spaceAfter=3)
    body = ParagraphStyle('b', fontName='Helvetica', fontSize=10.5, textColor=INK, leading=15.5, spaceAfter=7, alignment=TA_JUSTIFY)
    intro = ParagraphStyle('in', fontName='Helvetica-Oblique', fontSize=12, textColor=colors.HexColor('#333333'), leading=18, spaceAfter=10)
    bullet = ParagraphStyle('bu', fontName='Helvetica', fontSize=10.5, textColor=INK, leading=15.5, spaceAfter=4, leftIndent=10, bulletIndent=0)
    toc = ParagraphStyle('toc', fontName='Helvetica', fontSize=11.5, textColor=INK, leading=22)

    f = []
    f.append(Spacer(1, 58*mm))
    f.append(Paragraph('LIVRE BLANC &nbsp;·&nbsp; ' + esc(cat).upper(), eyebrow))
    f.append(Paragraph(esc(data['title']), ctitle))
    if data.get('subtitle'):
        f.append(Paragraph(esc(data['subtitle']), csub))
    f.append(Spacer(1, 16*mm))
    f.append(Paragraph('Pirabel Labs &nbsp;·&nbsp; %d &nbsp;·&nbsp; %s pages' % (year, data.get('pages', '')), cmeta))
    f.append(NextPageTemplate('body'))
    f.append(PageBreak())

    if data.get('intro'):
        f.append(Paragraph(esc(data['intro']), intro))
        f.append(Spacer(1, 4*mm))
    f.append(Paragraph('Sommaire', h2))
    for i, s in enumerate(data['sections']):
        f.append(Paragraph('%d. &nbsp; %s' % (i + 1, esc(s['heading'])), toc))
    f.append(PageBreak())

    for i, s in enumerate(data['sections']):
        block = [Paragraph('%d. %s' % (i + 1, esc(s['heading'])), h2)]
        for p in s.get('paragraphs', []):
            block.append(Paragraph(esc(p), body))
        for b in s.get('bullets', []):
            block.append(Paragraph('•&nbsp;&nbsp;' + esc(b), bullet))
        f.append(KeepTogether(block) if len(block) <= 4 else block[0])
        if len(block) > 4:
            for fl in block[1:]:
                f.append(fl)

    f.append(PageBreak())
    f.append(Paragraph('Passez à l\'action avec Pirabel Labs', h2))
    f.append(Paragraph(esc(data.get('cta', "Besoin d'aide pour appliquer ce guide ? Notre équipe vous accompagne de la stratégie à l'exécution. Audit gratuit, réponse sous 24 h.")), intro))
    f.append(Spacer(1, 4*mm))
    f.append(Paragraph('<b>Contact</b> &nbsp;·&nbsp; contact@pirabellabs.com', body))
    f.append(Paragraph('<b>WhatsApp</b> &nbsp;·&nbsp; +1 (613) 927-3067', body))
    f.append(Paragraph('<b>Site</b> &nbsp;·&nbsp; pirabellabs.com', body))
    f.append(Paragraph('<b>Siège</b> &nbsp;·&nbsp; Abomey-Calavi, Bénin', body))

    doc.build(f)
    print('OK', out)

main()
