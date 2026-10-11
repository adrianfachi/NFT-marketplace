import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Input } from './ui/input'

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label: string
  children?: ReactNode
}

export function Field({ label, children, ...props }: FieldProps) {
  return (
    <label className="flex flex-col gap-2 mb-[9px]">
      <span className="text-[#eee]">{label}<em className="text-[#e78354] not-italic">*</em></span>
      {children ?? <Input {...props} className="bg-transparent border border-[var(--line)] text-white p-[10px] outline-[var(--primary)]" />}
    </label>
  )
}

export function SelectField({ label, children, ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-2 mb-[9px]">
      <span className="text-[#eee]">{label}<em className="text-[#e78354] not-italic">*</em></span>
      <select {...props} className="bg-transparent border border-[var(--line)] text-white p-[10px] outline-[var(--primary)]">{children}</select>
    </label>
  )
}

export function TextareaField({ label, children, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="flex flex-col gap-2 mb-[9px]">
      <span className="text-[#eee]">{label}</span>
      <textarea {...props} className="bg-transparent border border-[var(--line)] text-white p-[10px] outline-[var(--primary)] min-h-[80px]">{children}</textarea>
    </label>
  )
}