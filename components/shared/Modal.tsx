'use client'

import { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/50 p-4">
      <div className="card-surface shadow-card w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-title-md font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="닫기" className="rounded-full p-1 text-muted hover:bg-surface-soft hover:text-ink">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
