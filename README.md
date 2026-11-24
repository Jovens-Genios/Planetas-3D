# Planetas 3D · Exploradores

Os planetas de massinha dos Exploradores (Jovens Gênios) em 3D, girando no eixo vertical: uma volta a cada 40 s, com giro pela mão, pelo teclado e pelo toque.

| | |
| --- | --- |
| **Vitrine** | https://planetas-3d.vercel.app |
| **Kit para a engenharia (.zip)** | https://github.com/nandopandp-cloud/Planetas-3D/releases/download/kit-planetas/kit-planetas.zip |
| **Guia em PDF** | https://github.com/nandopandp-cloud/Planetas-3D/releases/download/kit-planetas/GUIA-ENGENHARIA.pdf |
| **Catálogo ao vivo** | https://planetas-3d.vercel.app/planetas/catalogo.json |

## Para a engenharia: instalar uma vez e usar pelo id

```bash
# 1. baixe e descompacte na raiz do projeto Next.js: cria components/planetas/
REPO=https://github.com/nandopandp-cloud/Planetas-3D
curl -LO $REPO/releases/download/kit-planetas/kit-planetas.zip
unzip -o kit-planetas.zip -x LEIA-ME.txt && rm kit-planetas.zip

# 2. instale o three.js
npm i three
npm i -D @types/three
```

```tsx
// 3. use onde o planeta aparece (funciona em Server Components)
import { Planeta } from '@/components/planetas'

<Planeta id="planeta-emocoes" tamanho={240} alt="Planeta Emoções" />
```

- **Arquivos:** os modelos e os pôsteres vêm deste site (`https://planetas-3d.vercel.app/planetas/`, com CORS liberado). O .zip traz só o componente.
- **Planeta novo:** é só usar o id novo, sem baixar nada.
- **Se o projeto usa `src/`:** mova a pasta para `src/components/planetas`.

Props, perguntas frequentes e CSP estão no [guia em PDF](https://github.com/nandopandp-cloud/Planetas-3D/releases/download/kit-planetas/GUIA-ENGENHARIA.pdf).

## Planetas

<!-- planetas:inicio (tabela gerada por ferramentas/adicionar_planeta.py) -->
| | Planeta | id |
| --- | --- | --- |
| <img src="public/planetas/planeta-mitologia/poster.webp" width="64" alt=""> | Mitologia | `planeta-mitologia` |
| <img src="public/planetas/planeta-empreendedorismo/poster.webp" width="64" alt=""> | Empreendedorismo | `planeta-empreendedorismo` |
| <img src="public/planetas/planeta-emocoes/poster.webp" width="64" alt=""> | Emoções | `planeta-emocoes` |
| <img src="public/planetas/planeta-artes/poster.webp" width="64" alt=""> | Artes | `planeta-artes` |
| <img src="public/planetas/planeta-computacao/poster.webp" width="64" alt=""> | Computação | `planeta-computacao` |
| <img src="public/planetas/planeta-fantasia/poster.webp" width="64" alt=""> | Fantasia | `planeta-fantasia` |
| <img src="public/planetas/planeta-musica/poster.webp" width="64" alt=""> | Música | `planeta-musica` |
| <img src="public/planetas/planeta-terra/poster.webp" width="64" alt=""> | Terra | `planeta-terra` |
| <img src="public/planetas/planeta-alfabetizacao/poster.webp" width="64" alt=""> | Alfabetização | `planeta-alfabetizacao` |
| <img src="public/planetas/planeta-transito/poster.webp" width="64" alt=""> | Trânsito | `planeta-transito` |
| <img src="public/planetas/planeta-esportes/poster.webp" width="64" alt=""> | Esportes | `planeta-esportes` |
<!-- planetas:fim -->

O id é sempre `planeta-<nome>`, sem acentos. No código, `await carregarPlanetas()` devolve a lista com `id` e `nome`.

## Adicionar um planeta

1. **Otimizar** o `.glb` do planeta no Blender 5.3. O script reduz de ~65 MB para ~2,5 MB, centraliza a esfera e gera o pôster:

   ```bash
   blender -b --factory-startup -P ferramentas/otimizar_glb.py -- \
     --entrada esportes.glb --saida saida/planeta-esportes \
     --id planeta-esportes --nome "Esportes" --inicio 0
   ```

   - `--inicio` é o ângulo em que o planeta aparece primeiro (o mesmo do pôster).
   - `--elevacao` é a altura da câmera, em graus (padrão 12).
   - `--forma ilha` e `--rosto x,y,z` são para modelos fora do padrão.
2. **Registrar:** `python3 ferramentas/adicionar_planeta.py "<pasta de saída>"`. Copia os arquivos, atualiza o catálogo e refaz a tabela acima, o LEIA-ME do kit e o PDF.
3. **Publicar:**
   1. commit e push;
   2. deploy na Vercel, que coloca o planeta no ar para todas as plataformas;
   3. `bash ferramentas/publicar_kit.sh`, que atualiza o .zip e o PDF da release.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `components/planetas/` | O componente que vai no kit: `<Planeta id>`, `PlanetaGirando` (three.js), catálogo remoto |
| `public/planetas/` | `catalogo.json` (fonte única) e `<id>/planeta.glb` + `poster.webp` de cada planeta |
| `vitrine/`, `app/` | A vitrine (Next.js): seletor de planeta, tamanhos e aba de código para a engenharia |
| `ferramentas/` | Otimizador (Blender), `adicionar_planeta.py`, gerador do guia em PDF e publicação do kit |
| `GUIA-ENGENHARIA.pdf` | O guia, gerado a partir do catálogo |
| `vercel.json` | CORS e revalidação em `/planetas/*` |

## Rodar localmente

```bash
npm install
npm run dev   # http://localhost:3000 · ?screen=planeta-esportes abre direto num planeta
```

Stack: Next.js 15, React 19, three 0.170 e lucide-react.

## Comportamento

- **Giro:** uma velocidade só.
- **Mão:** arrastar gira, com embalo ao soltar; no celular, deslizar na vertical rola a página.
- **Teclado:** setas ← e →.
- **"Reduzir movimento":** o planeta não gira sozinho, mas a mão continua funcionando.
- **Carregamento:** o pôster aparece na hora e o 3D só carrega quando o planeta está na tela.
- **Sem WebGL ou sem rede:** fica o pôster.
- **Desempenho:** para de desenhar fora da tela e baixa a resolução sozinho em aparelho lento.
