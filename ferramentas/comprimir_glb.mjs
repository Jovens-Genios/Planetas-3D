// Deixa o planeta abaixo de 1 MB sem perda visível (o adicionar_planeta.py já chama este script).
//   node ferramentas/comprimir_glb.mjs <entrada.glb> <saida.glb>
//
// Parte do .glb que sai do otimizar_glb.py (meshopt, ~2,5 MB) e:
//   1. simplifica a malha onde a forma não muda (até 60% dos triângulos, erro máximo 0,05% do tamanho;
//      se o resultado passar de 1 MB, tenta 50% e cor em qualidade 50);
//   2. mapas de relevo e de brilho em 1024 px (WebP); a cor continua em 2048 px, em AVIF;
//   3. comprime a malha com Draco (posição 14 bits, normal 8, UV 12).
// Medido nos 12 primeiros planetas: 0,67–0,98 MB (antes 2,3–2,8 MB), com diferença média de cor de 1 a 1,5 em 255
// nos prints em tela retina. O componente decodifica o Draco com o decodificador em /draco/ do site dos planetas.
import { statSync } from 'node:fs'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { draco, prune, simplify, textureCompress, weld } from '@gltf-transform/functions'
import draco3d from 'draco3dgltf'
import { MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer'
import sharp from 'sharp'

const [ENTRADA, SAIDA] = process.argv.slice(2)
if (!ENTRADA || !SAIDA) {
  console.error('uso: node ferramentas/comprimir_glb.mjs <entrada.glb> <saida.glb>')
  process.exit(1)
}

await MeshoptDecoder.ready
await MeshoptSimplifier.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'draco3d.encoder': await draco3d.createEncoderModule(),
  'draco3d.decoder': await draco3d.createDecoderModule(),
})
const antes = statSync(ENTRADA).size

async function comprimir(ratio, qualidadeCor) {
  const doc = await io.read(ENTRADA)
  // a entrada vem com meshopt; a saída usa só Draco
  for (const ext of doc.getRoot().listExtensionsUsed())
    if (ext.extensionName === 'EXT_meshopt_compression') ext.dispose()
  await doc.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.0005 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 86, resize: [1024, 1024], slots: /^(normalTexture|metallicRoughnessTexture)$/ }),
    textureCompress({ encoder: sharp, targetFormat: 'avif', quality: qualidadeCor, slots: /^baseColorTexture$/ }),
    draco({ method: 'edgebreaker', quantizePosition: 14, quantizeNormal: 8, quantizeTexcoord: 12, quantizeGeneric: 12 }),
    prune(),
  )
  for (const m of doc.getRoot().listMaterials()) m.setName('planeta')
  await io.write(SAIDA, doc)
  return statSync(SAIDA).size
}

// padrão; se passar de 1 MB (planetas muito detalhados), um pouco mais de compressão
let depois
for (const [ratio, q] of [[0.6, 55], [0.5, 50], [0.45, 45]]) {
  depois = await comprimir(ratio, q)
  if (depois < 1e6) break
}
console.log(`${SAIDA}: ${(antes / 1e6).toFixed(2)} MB → ${(depois / 1e6).toFixed(2)} MB`)
if (depois >= 1e6) console.warn('atenção: continua acima de 1 MB')
