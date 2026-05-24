#!/usr/bin/env python3
"""Push toutes les env vars de .env.local vers le nouveau projet Vercel."""
import json
import os
import re
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / '.env.local'

TOKEN = os.environ.get('VERCEL_TOKEN')
TEAM_ID = os.environ.get('VERCEL_TEAM_ID')
PROJECT_ID = os.environ.get('VERCEL_PROJECT_ID')

if not (TOKEN and TEAM_ID and PROJECT_ID):
    raise SystemExit("VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID required")

# Skip Vercel-injected vars (they'll be auto-set by Vercel)
SKIP_KEYS = {
    'VERCEL', 'VERCEL_ENV', 'VERCEL_URL',
    'NX_DAEMON', 'TURBO_CACHE', 'TURBO_DOWNLOAD_LOCAL_ENABLED',
    'TURBO_REMOTE_ONLY', 'TURBO_RUN_SUMMARY',
}
SKIP_PREFIXES = ('VERCEL_GIT_', 'VERCEL_OIDC_', 'VERCEL_TARGET_', 'VERCEL_DEPLOYMENT_')

def parse_env(text):
    out = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        m = re.match(r'^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$', line)
        if not m:
            continue
        key, val = m.group(1), m.group(2)
        # Strip quotes
        if (val.startswith('"') and val.endswith('"')) or \
           (val.startswith("'") and val.endswith("'")):
            val = val[1:-1]
        out[key] = val
    return out

def post_env(key, value):
    url = f'https://api.vercel.com/v10/projects/{PROJECT_ID}/env?teamId={TEAM_ID}&upsert=true'
    body = json.dumps({
        'key': key,
        'value': value,
        'type': 'encrypted',
        'target': ['production', 'preview', 'development'],
    }).encode('utf-8')
    req = urllib.request.Request(url, data=body, method='POST', headers={
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json',
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return True, resp.status
    except urllib.error.HTTPError as e:
        return False, f"{e.code} {e.read().decode('utf-8', errors='ignore')[:200]}"

env = parse_env(ENV_FILE.read_text(encoding='utf-8'))
ok = fail = skip = 0
for key, val in env.items():
    if key in SKIP_KEYS or any(key.startswith(p) for p in SKIP_PREFIXES):
        print(f"  SKIP {key}")
        skip += 1
        continue
    success, info = post_env(key, val)
    if success:
        print(f"  OK   {key}")
        ok += 1
    else:
        print(f"  FAIL {key}: {info}")
        fail += 1

print(f"\nResume: {ok} OK, {fail} FAIL, {skip} SKIP")
