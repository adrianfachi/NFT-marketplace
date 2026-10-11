import { createFileRoute } from '@tanstack/react-router'
import { AuthModal, Layout } from '../components/Kurio'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <Layout footer={false}>
      <AuthModal />
    </Layout>
  )
}