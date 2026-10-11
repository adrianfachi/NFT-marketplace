import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react'

export type FeedbackState = { type: 'success' | 'error'; message: string } | null

export function Feedback({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) return null
  const success = feedback.type === 'success'
  return (
    <div className={`flex items-center gap-2 p-[10px_12px] my-3 text-[11px] border rounded ${success ? 'text-[#73d6ae] border-[#286e54] bg-[#123126]' : 'text-[#f19a87] border-[#873c30] bg-[#351b17]'}`} role={success ? 'status' : 'alert'} aria-live={success ? 'polite' : 'assertive'}>
      {success ? <CheckCircle2 size={16} className="shrink-0" /> : <XCircle size={16} className="shrink-0" />}
      <span>{feedback.message}</span>
    </div>
  )
}

export function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button className="border-0 bg-primary text-ink font-bold py-2.75 px-6.25 inline-block text-center w-full mt-5.5 disabled:opacity-60 disabled:cursor-wait hover:bg-[var(--primary-light)]" type="submit" disabled={loading}>
      {loading && <LoaderCircle className="animate-spin inline-block align-middle mr-1.75" size={14} />}
      {loading ? 'Salvando...' : children}
    </button>
  )
}