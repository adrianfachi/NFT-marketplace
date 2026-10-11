import { Layout } from '@/components/Site'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/creators')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Layout><div /></Layout>
}