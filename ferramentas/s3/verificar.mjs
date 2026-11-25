// Confere se um endereço serve os planetas do jeito que o componente precisa.
//   node ferramentas/s3/verificar.mjs https://<cdn>/<pasta>/
// O endereço é o mesmo de NEXT_PUBLIC_PLANETAS_URL (a raiz onde ficam planetas/ e draco/).
// Para cada arquivo, confere: resposta 200, tipo (Content-Type) e CORS (Access-Control-Allow-Origin).
// Termina com erro (código 1) se algo falhar, então serve também no CI.
const base = (process.argv[2] || '').replace(/\/?$/, '/')
if (base === '/') {
  console.error('uso: node ferramentas/s3/verificar.mjs https://<cdn>/<pasta>/')
  process.exit(1)
}
const ORIGEM = 'https://exemplo.jovensgenios.com.br' // qualquer site de outro domínio
let falhas = 0

async function conferir(caminho, tipo, { limite } = {}) {
  const url = base + caminho
  const erros = []
  let r
  try {
    r = await fetch(url, { headers: { Origin: ORIGEM } })
  } catch (e) {
    console.log(`✗ ${caminho}  (${e.cause?.code || e.message})`)
    falhas++
    return null
  }
  const corpo = Buffer.from(await r.arrayBuffer())
  const ct = r.headers.get('content-type') || '—'
  const cors = r.headers.get('access-control-allow-origin')
  if (r.status !== 200) erros.push(`HTTP ${r.status}`)
  const tipos = [].concat(tipo)
  if (!tipos.some((t) => ct.startsWith(t))) erros.push(`Content-Type ${ct} (esperado ${tipos.join(' ou ')})`)
  if (cors !== '*' && cors !== ORIGEM) erros.push('sem CORS (Access-Control-Allow-Origin)')
  if (limite && corpo.length >= limite) erros.push(`${(corpo.length / 1e6).toFixed(2)} MB (limite ${limite / 1e6} MB)`)
  const kb = corpo.length > 1e6 ? `${(corpo.length / 1e6).toFixed(2)} MB` : `${Math.round(corpo.length / 1e3)} KB`
  const cache = r.headers.get('cache-control') || 'sem Cache-Control'
  console.log(`${erros.length ? '✗' : '✓'} ${caminho}  ${kb} · ${cache}${erros.length ? '  → ' + erros.join('; ') : ''}`)
  falhas += erros.length ? 1 : 0
  return r.status === 200 ? corpo : null
}

console.log(`Conferindo ${base}\n`)
const cat = await conferir('planetas/catalogo.json', 'application/json')
for (const f of ['draco_wasm_wrapper.js', 'draco_decoder.wasm', 'draco_decoder.js'])
  await conferir(`draco/${f}`, f.endsWith('.wasm') ? 'application/wasm' : ['text/javascript', 'application/javascript'])
let planetas = []
if (cat) {
  try {
    planetas = JSON.parse(cat.toString()).planetas
  } catch {
    console.log('✗ catálogo não é um JSON válido')
    falhas++
  }
}
for (const p of planetas) {
  await conferir(`${p.pasta}/${p.modelo}`, 'model/gltf-binary', { limite: 1e6 })
  await conferir(`${p.pasta}/${p.poster}`, 'image/webp')
}
console.log(
  falhas
    ? `\n${falhas} arquivo(s) com problema.`
    : `\nTudo certo: ${planetas.length} planetas. Use NEXT_PUBLIC_PLANETAS_URL=${base}`,
)
process.exit(falhas ? 1 : 0)
