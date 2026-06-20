# -*- coding: utf-8 -*-
import io
f = "livres-blancs.html"
s = io.open(f, encoding="utf-8").read()

old = "          if (purl) { var a=document.createElement('a'); a.href=purl; a.setAttribute('download',''); a.style.display='none'; document.body.appendChild(a); a.click(); setTimeout(function(){ if(a.parentNode) a.parentNode.removeChild(a); }, 2500); }"
new = ("          try { msg.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch(e){}\n"
       "          if (purl) { window.location.assign(purl); }")
assert old in s, "bloc auto-download introuvable"
s = s.replace(old, new, 1)
io.open(f, "w", encoding="utf-8").write(s)
print("OK — window.location.assign + scrollIntoView")
print("window.location.assign:", s.count('window.location.assign(purl)'), "| scrollIntoView:", s.count('scrollIntoView'))
