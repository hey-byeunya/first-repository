#!/usr/bin/env bash
# 블로그 로컬 미리보기 — post-til 스킬용.
# Homebrew Ruby(3.4+)로 Jekyll serve 를 띄운다.
# 시스템 Ruby 2.6은 bundler 2.6.9가 없어 Chirpy 빌드가 실패하므로, Homebrew Ruby를 강제로 앞세운다.
#
# 사용법:
#   bash preview.sh [블로그경로] [포트]
#   기본: 블로그=~/Documents/ai-agent/hey-byeunya.github.io, 포트=4123
#
# 백그라운드로 띄우려면 호출 측에서 run_in_background 로 실행할 것.
set -e

BLOG="${1:-$HOME/Documents/ai-agent/hey-byeunya.github.io}"
PORT="${2:-4123}"

if [ ! -d "$BLOG" ]; then
  echo "블로그 폴더를 못 찾음: $BLOG" >&2
  echo "다음으로 찾아보세요: find ~/Documents -maxdepth 3 -type d -name 'hey-byeunya.github.io'" >&2
  exit 1
fi

# Homebrew Ruby 우선 (핵심)
if [ -d /opt/homebrew/opt/ruby/bin ]; then
  export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
fi

cd "$BLOG"
echo "Ruby: $(ruby -v)"
echo "Bundler: $(bundle -v)"

bundle install >/dev/null 2>&1 || bundle install
echo "미리보기 시작: http://127.0.0.1:${PORT}/"
exec bundle exec jekyll serve --port "$PORT" --host 127.0.0.1
