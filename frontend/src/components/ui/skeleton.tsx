import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="skeleton" className={cn('bg-muted rounded-md bg-gradient-to-r from-muted via-muted-foreground/12 to-muted bg-[length:200%_100%] animate-[kurio-shimmer_1.5s_ease-in-out_infinite]', className)} {...props} />
}