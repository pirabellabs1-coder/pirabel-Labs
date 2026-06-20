# -*- coding: utf-8 -*-
import io
f = "livres-blancs.html"
s = io.open(f, encoding="utf-8").read()

old_msg = "msg.innerHTML = '<strong>C\\'est prêt !</strong> Votre téléchargement démarre, et une copie part par e-mail (vérifiez les indésirables si besoin).';"
new_msg = "msg.innerHTML = '<strong>C\\'est prêt !</strong> Votre téléchargement va démarrer. S\\'il ne démarre pas, <a href=\"'+(json.pdfUrl||'#')+'\" target=\"_blank\" rel=\"noopener\" style=\"color:#fff;text-decoration:underline;font-weight:700;\">cliquez ici pour télécharger le PDF</a>. Une copie part aussi par e-mail (pensez à vérifier les spams).';"
assert old_msg in s, "old_msg introuvable"
s = s.replace(old_msg, new_msg, 1)

s = s.replace("setTimeout(closeModal, 4500);", "setTimeout(closeModal, 12000);", 1)

io.open(f, "w", encoding="utf-8").write(s)
print("OK — lien visible + délai 12s")
print("lien visible:", "cliquez ici pour télécharger" in s, "| délai:", "12000" in s)
