"""
dev-server.py
Local development HTTP server for Pirabel Labs static site.
Mimics Vercel's URL resolution:
  /a-propos       -> /a-propos.html
  /en/services    -> /en/services.html
  /en/blog/       -> /en/blog/index.html
  /agence-seo-...  -> /agence-seo-.../index.html

Usage:
  python scripts/dev-server.py [port]
Default port: 8080
"""
import http.server
import os
import socketserver
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        # Strip query string for path resolution
        path = self.path.split("?", 1)[0]
        # Strip fragment if any
        path = path.split("#", 1)[0]

        # Translate URL path to filesystem path
        full = (ROOT / path.lstrip("/")).resolve()

        # Security: prevent directory traversal
        try:
            full.relative_to(ROOT)
        except ValueError:
            self.send_error(403, "Forbidden")
            return

        # If path exists as a file, serve it normally
        if full.is_file():
            return super().do_GET()

        # If path is a directory, look for index.html inside; if missing, fall through to .html sibling
        if full.is_dir():
            index = full / "index.html"
            if index.is_file():
                rel = index.relative_to(ROOT).as_posix()
                self.path = "/" + rel
                return super().do_GET()
            # Folder exists but has no index.html. Try .html sibling (e.g. /en/blog/ -> /en/blog.html)
            sibling = full.parent / (full.name + ".html")
            if sibling.is_file():
                rel = sibling.relative_to(ROOT).as_posix()
                self.path = "/" + rel
                return super().do_GET()
            self.send_error(404, "Directory has no index.html and no .html sibling")
            return

        # Try appending .html (Vercel-style clean URLs)
        candidate = full.parent / (full.name + ".html")
        if candidate.is_file():
            rel = candidate.relative_to(ROOT).as_posix()
            self.path = "/" + rel
            return super().do_GET()

        # Fallback to default 404 handler
        self.send_error(404, "File not found")

    def end_headers(self):
        # Disable caching for dev
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()


def main():
    os.chdir(ROOT)
    handler = Handler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Pirabel Labs dev server running at http://localhost:{PORT}/")
        print(f"Serving directory: {ROOT}")
        print("Clean URLs enabled: /a-propos -> /a-propos.html, /en/blog/ -> /en/blog/index.html")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down...")
            httpd.shutdown()


if __name__ == "__main__":
    main()
