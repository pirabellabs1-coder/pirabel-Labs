# -*- coding: utf-8 -*-
import io
f = "livres-blancs.html"
s = io.open(f, encoding="utf-8").read()

old = (
"        if (r.ok && json.success) {\n"
"          msg.className = 'lb-form__msg is-show is-success';\n"
"          msg.innerHTML = '<strong>C\\'est prêt !</strong> Votre téléchargement va démarrer. S\\'il ne démarre pas, <a href=\"'+(json.pdfUrl||'#')+'\" target=\"_blank\" rel=\"noopener\" style=\"color:#fff;text-decoration:underline;font-weight:700;\">cliquez ici pour télécharger le PDF</a>. Une copie part aussi par e-mail (pensez à vérifier les spams).';\n"
"          if (submitText) submitText.textContent = 'Téléchargé ✓';\n"
"          if (json.pdfUrl) { var a=document.createElement('a'); a.href=json.pdfUrl; a.target='_blank'; a.rel='noopener'; document.body.appendChild(a); a.click(); a.remove(); }\n"
"          setTimeout(closeModal, 12000);"
)
new = (
"        if (r.ok && json.success) {\n"
"          var purl = json.pdfUrl || '';\n"
"          msg.className = 'lb-form__msg is-show is-success';\n"
"          msg.innerHTML = '<strong>C\\'est prêt !</strong> Votre PDF se télécharge.' + (purl ? ' <a href=\"'+purl+'\" download style=\"display:inline-block;margin-top:.55rem;padding:.7rem 1.3rem;background:#fff;color:#0a0a0a;font-weight:800;border-radius:8px;text-decoration:none;\">Télécharger le PDF</a>' : '') + '<br><span style=\"font-size:.85rem;opacity:.85;\">Une copie part aussi par e-mail (pensez à vérifier les spams).</span>';\n"
"          if (submitText) submitText.textContent = 'Téléchargé ✓';\n"
"          if (purl) { var a=document.createElement('a'); a.href=purl; a.setAttribute('download',''); a.style.display='none'; document.body.appendChild(a); a.click(); setTimeout(function(){ if(a.parentNode) a.parentNode.removeChild(a); }, 2500); }\n"
"          setTimeout(closeModal, 15000);"
)
assert old in s, "bloc succès introuvable"
s = s.replace(old, new, 1)
io.open(f, "w", encoding="utf-8").write(s)
print("OK — bouton download visible + attribut download + suppression différée")
print("download attr:", s.count('download style='), "| purl:", s.count('var purl'))
