import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-card text-card-foreground rounded-xl border border-border p-6 shadow-sm ${className}`.trim()} {...props} />
}