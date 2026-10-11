import { createFileRoute } from '@tanstack/react-router'
import { AuthModal, Layout } from '../components/Kurio'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <Layout footer={false}>
      <AuthModal register />
    </Layout>
  )
}
