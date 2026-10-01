import { AlertTriangle, LoaderCircle, SearchX } from 'lucide-react'

export function LoadingState({ label = 'Loading mission data' }: { label?: string }) {
  return <div className="data-state" role="status"><LoaderCircle size={16} className="spinner" aria-hidden="true" /><span>{label}</span></div>
}

export function ErrorState({ message = 'The requested data could not be loaded.' }: { message?: string }) {
  return <div className="data-state error-state" role="alert"><AlertTriangle size={16} aria-hidden="true" /><span>{message}</span></div>
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="data-state empty-state" role="status"><SearchX size={16} aria-hidden="true" /><span><strong>{title}</strong><small>{detail}</small></span></div>
}