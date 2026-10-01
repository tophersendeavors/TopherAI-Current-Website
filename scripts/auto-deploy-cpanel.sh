#!/bin/sh
# cPanel cron: pull the authorized main branch and deploy when any managed file differs.
set -eu
repo=/home/soluykqf/repositories/TopherAI-Current-Website
public=/home/soluykqf/topherai.com
cd "$repo"
printf '[%s] Checking Topher AI deployment\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
# flock is optional; when available it prevents overlapping cron executions.
if command -v flock >/dev/null 2>&1; then
  exec 9>"$repo/.git/topher-auto-deploy.lock"
  flock -n 9 || exit 0
fi
/usr/bin/git pull --ff-only
if [ -n "$(/usr/bin/git status --porcelain)" ]; then
  printf 'Deployment blocked: repository has uncommitted changes.\n' >&2
  exit 1
fi
needs_deploy=0
for path in index.html es-home.html sitemap.xml knowledge/index.html knowledge/cost-of-missed-calls.html knowledge/law-firms/ai-intake-for-law-firms.html solutions/ai-answering-service/index.html solutions/ai-client-intake/index.html industries/law-firms/index.html tools/missed-call-cost-calculator/index.html; do
  if ! /usr/bin/cmp -s "$repo/$path" "$public/$path"; then
    needs_deploy=1
    printf 'Changed: %s\n' "$path"
  fi
done
if [ "$needs_deploy" -eq 0 ]; then
  printf 'Managed public files match the repository.\n'
  exit 0
fi
/usr/local/cpanel/bin/uapi VersionControlDeployment create repository_root="$repo"
printf 'Deployment requested. The next cron run checks the public files again.\n'
