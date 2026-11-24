'use client'

import { useEffect, useState } from 'react'
import Vitrine from './Vitrine'

/** Lê ?screen= (na URL ou depois do #, como na plataforma de jornadas) e abre a vitrine nele. */
export function VitrineCliente() {
  const [tela, setTela] = useState<string | undefined | null>(null)
  useEffect(() => {
    const daBusca = new URLSearchParams(window.location.search).get('screen')
    const doHash = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('screen')
    setTela(daBusca ?? doHash ?? undefined)
  }, [])
  if (tela === null) return null
  return <Vitrine startScreen={tela} />
}
