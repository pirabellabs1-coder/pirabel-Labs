"""Inject the Microsoft Clarity tracking snippet before </head> in every HTML file."""
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
EXCLUDE_DIRS = {"node_modules", "scratch", ".git"}

CLARITY_ID = "w6joqzqtx3"
SNIPPET = (
    "<!-- Microsoft Clarity -->\n"
    "<script type=\"text/javascript\">\n"
    "    (function(c,l,a,r,i,t,y){\n"
    "        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};\n"
    "        t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;\n"
    "        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);\n"
    f"    }})(window, document, \"clarity\", \"script\", \"{CLARITY_ID}\");\n"
    "</script>\n"
)

MARKER = "clarity.ms/tag/"
HEAD_CLOSE_RE = re.compile(r"</head\s*>", re.IGNORECASE)


def process(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            html = f.read()
    except UnicodeDecodeError:
        return "skip-encoding"

    if MARKER in html:
        return "already"

    match = HEAD_CLOSE_RE.search(html)
    if not match:
        return "no-head"

    insert_at = match.start()
    new_html = html[:insert_at] + SNIPPET + html[insert_at:]

    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(new_html)
    return "patched"


def main():
    counts = {"patched": 0, "already": 0, "no-head": 0, "skip-encoding": 0}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for name in filenames:
            if not name.lower().endswith(".html"):
                continue
            full = os.path.join(dirpath, name)
            result = process(full)
            counts[result] = counts.get(result, 0) + 1
            if result == "no-head":
                print(f"  no <head> in: {os.path.relpath(full, ROOT)}")

    print("---")
    for k, v in counts.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
