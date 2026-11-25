#!/usr/bin/env bash
# Envia os planetas para a S3 da Jovens Gênios, com a mesma estrutura do site (planetas/ e draco/).
#
#   BUCKET=<bucket> PREFIXO=<pasta> CLOUDFRONT_ID=<id> bash ferramentas/s3/publicar_s3.sh
#
#   BUCKET         obrigatório: nome do bucket
#   PREFIXO        opcional: pasta dentro do bucket (ex.: exploradores → <cdn>/exploradores/planetas/…)
#   CLOUDFRONT_ID  opcional: distribuição do CloudFront a invalidar depois do envio
#   SECO=1         opcional: só mostra o que seria enviado (--dryrun)
#
# Precisa do AWS CLI v2 com credenciais (aws configure, AWS_PROFILE ou o GitHub Action
# .github/workflows/publicar-s3.yml, que roda este script a cada push na main).
# Envia só o que mudou. Não apaga nada no bucket: um id que saiu do catálogo continua respondendo.
set -euo pipefail
: "${BUCKET:?defina BUCKET=<nome do bucket>}"
raiz="$(cd "$(dirname "$0")/../.." && pwd)"
prefixo="${PREFIXO:-}"
prefixo="${prefixo#/}"
prefixo="${prefixo%/}"
destino="s3://$BUCKET${prefixo:+/$prefixo}"

# planeta atualizado mantém o nome do arquivo: cache curto (o navegador revalida pelo ETag)
curto='public, max-age=300'
# o decodificador da malha não muda
longo='public, max-age=31536000, immutable'

envia() { # <pasta em public/> <arquivos> <Content-Type> <Cache-Control>
  aws s3 sync "$raiz/public/$1" "$destino/$1" --exclude '*' --include "$2" \
    --content-type "$3" --cache-control "$4" --only-show-errors ${SECO:+--dryrun}
}

echo "enviando para $destino/"
# 1. decodificador da malha (Draco)
envia draco '*.wasm' application/wasm "$longo"
envia draco '*.js' 'text/javascript; charset=utf-8' "$longo"
# 2. modelos e pôsteres, antes do catálogo: ele nunca aponta para um arquivo que ainda não subiu
envia planetas '*.glb' model/gltf-binary "$curto"
envia planetas '*.webp' image/webp "$curto"
# 3. catálogo por último
envia planetas 'catalogo.json' 'application/json; charset=utf-8' "$curto"

if [[ -n "${CLOUDFRONT_ID:-}" && -z "${SECO:-}" ]]; then
  aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_ID" \
    --paths "/${prefixo:+$prefixo/}planetas/*" --query 'Invalidation.Id' --output text
fi
n=$(grep -c '"id"' "$raiz/public/planetas/catalogo.json")
echo "pronto: $n planetas em $destino/planetas/"
