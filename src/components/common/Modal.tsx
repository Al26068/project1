import type { ReactNode } from 'react'
import { CloseIcon } from './icons'
import './Modal.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content__header">
          {title && <h3>{title}</h3>}
          <button
            type="button"
            className="modal-content__close"
            onClick={onClose}
            aria-label="閉じる"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="modal-content__body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
