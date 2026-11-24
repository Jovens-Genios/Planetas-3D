"""Planeta novo (ou atualizado) entra no projeto, com a documentação junto.

  python3 ferramentas/adicionar_planeta.py "<pasta de saída do otimizar_glb.py>"
  python3 ferramentas/adicionar_planeta.py            # sem pasta: só refaz a documentação

O que faz:
  1. copia o poster.webp e grava o planeta.glb comprimido (ferramentas/comprimir_glb.mjs, abaixo de 1 MB) em public/planetas/<id>/;
  2. põe a entrada no catálogo public/planetas/catalogo.json (substitui se o id já existe, senão vai para o fim);
  3. refaz a lista de planetas no README.md e no ferramentas/LEIA-ME.txt (entre as marcas "planetas:inicio/fim");
  4. refaz o GUIA-ENGENHARIA.pdf (ferramentas/guia/montar_guia.py).
Depois: commit, push, deploy e ferramentas/publicar_kit.sh.
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
PUB = RAIZ / 'public' / 'planetas'
CATALOGO = PUB / 'catalogo.json'


def numero(v):
    return int(v) if float(v).is_integer() else v


def entrar(saida: Path):
    info = json.loads((saida / 'info.json').read_text())
    e = dict(info['catalogo'])
    for k in ('inicio', 'elevacao', 'fov'):
        e[k] = numero(e[k])
    assert re.fullmatch(r'planeta-[a-z0-9-]+', e['id']), f'id fora do padrão planeta-<nome>: {e["id"]}'
    destino = PUB / e['id']
    destino.mkdir(parents=True, exist_ok=True)
    shutil.copy(saida / 'poster.webp', destino / 'poster.webp')
    subprocess.run(['node', str(RAIZ / 'ferramentas' / 'comprimir_glb.mjs'), str(saida / 'planeta.glb'), str(destino / 'planeta.glb')], check=True)
    cat = json.loads(CATALOGO.read_text())
    ids = [p['id'] for p in cat['planetas']]
    if e['id'] in ids:
        cat['planetas'][ids.index(e['id'])] = e
        print(f'{e["id"]}: atualizado no catálogo')
    else:
        cat['planetas'].append(e)
        print(f'{e["id"]}: novo no catálogo ({len(cat["planetas"])} planetas)')
    CATALOGO.write_text(json.dumps(cat, ensure_ascii=False, indent=2) + '\n')


def trocar_bloco(arquivo: Path, novo: str):
    s = arquivo.read_text()
    padrao = re.compile(r'(planetas:inicio[^\n]*\n).*?(^[^\n]*planetas:fim)', re.S | re.M)
    assert padrao.search(s), f'marcas planetas:inicio/fim não encontradas em {arquivo}'
    arquivo.write_text(padrao.sub(lambda m: m.group(1) + novo + '\n' + m.group(2), s))


def documentar():
    planetas = json.loads(CATALOGO.read_text())['planetas']
    linhas = ['| | Planeta | id |', '| --- | --- | --- |']
    linhas += [f'| <img src="public/planetas/{p["id"]}/poster.webp" width="64" alt=""> | {p["nome"]} | `{p["id"]}` |' for p in planetas]
    trocar_bloco(RAIZ / 'README.md', '\n'.join(linhas))
    trocar_bloco(RAIZ / 'ferramentas' / 'LEIA-ME.txt', '\n'.join(f'  {p["id"]:<26} {p["nome"]}' for p in planetas))
    subprocess.run([sys.executable, str(RAIZ / 'ferramentas' / 'guia' / 'montar_guia.py')], check=True)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        entrar(Path(sys.argv[1]).expanduser())
    documentar()
