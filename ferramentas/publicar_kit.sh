#!/usr/bin/env bash
# Empacota o kit de instalação (só o componente: os planetas são lidos da web) e publica, junto com o
# guia em PDF, na release fixa "kit-planetas" deste repositório. Os links nunca mudam:
#   https://github.com/Jovens-Genios/Planetas-3D/releases/download/kit-planetas/kit-planetas.zip
#   https://github.com/Jovens-Genios/Planetas-3D/releases/download/kit-planetas/GUIA-ENGENHARIA.pdf
# Rodar depois do push, sempre que o componente, o LEIA-ME ou o guia mudarem (planeta novo muda o guia).
set -euo pipefail
raiz="$(git rev-parse --show-toplevel)"
repo="Jovens-Genios/Planetas-3D"
tmp="$(mktemp -d)"
mkdir -p "$tmp/components"
cp -R "$raiz/components/planetas" "$tmp/components/"
cp "$raiz/ferramentas/LEIA-ME.txt" "$tmp/"
find "$tmp" -name .DS_Store -delete
(cd "$tmp" && zip -qrX kit-planetas.zip components LEIA-ME.txt)
if ! gh release view kit-planetas -R "$repo" >/dev/null 2>&1; then
  gh release create kit-planetas -R "$repo" --target main --title "Kit de planetas 3D · Exploradores" \
    --notes "Kit dos planetas 3D para a engenharia: descompacte kit-planetas.zip na raiz do projeto Next.js e instale o three. Os planetas são lidos da web (https://planetas-3d.vercel.app) pelo id; planeta novo não exige baixar nada. Passo a passo no GUIA-ENGENHARIA.pdf."
fi
gh release upload kit-planetas -R "$repo" "$tmp/kit-planetas.zip" "$raiz/GUIA-ENGENHARIA.pdf" --clobber
echo "publicado: $(du -h "$tmp/kit-planetas.zip" | cut -f1) · $(unzip -l "$tmp/kit-planetas.zip" | tail -1)"
