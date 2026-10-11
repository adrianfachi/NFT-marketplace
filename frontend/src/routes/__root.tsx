import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import type { RouterContext } from '../router-context'
import { RealtimeProvider } from '../lib/realtime'

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/router-devtools').then(module => ({ default: module.TanStackRouterDevtools })))
  : null

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <RealtimeProvider><Outlet /></RealtimeProvider>
      {TanStackRouterDevtools && <Suspense><TanStackRouterDevtools /></Suspense>}
    </>
  ),
  notFoundComponent: () => (
    <main className="max-w-[1080px] mx-auto min-h-[600px]">
      <section className="text-[var(--text-soft)] py-[25px]">
        <h1 className="text-xl font-bold">Página não encontrada</h1>
        <p>O endereço informado não existe no Kurio.</p>
      </section>
    </main>
  ),
})