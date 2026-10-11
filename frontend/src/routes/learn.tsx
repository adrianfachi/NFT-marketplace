import { Layout } from '@/components/Site'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/learn')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Layout><div /></Layout>
}