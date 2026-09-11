import { useState } from 'react'
import type { FormEvent } from 'react'
import { loadWorkplaces } from '../../lib/workplaceStorage'
import type { ClockRecord } from '../../types/clockRecord'
import './ClockInForm.css'

type ClockInInput = Omit<ClockRecord, 'id'>

function todayDateKey(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}

interface ClockInFormProps {
  onSubmit: (value: ClockInInput) => void
  onCancel?: () => void
}

function ClockInForm({ onSubmit, onCancel }: ClockInFormProps) {
  const [workplaces] = useState(() => loadWorkplaces().filter((w) => w.status === 'active'))
  const [workplaceId, setWorkplaceId] = useState(workplaces[0]?.id ?? '')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ workplaceId, date: todayDateKey(), startTime, endTime })
  }

  if (workplaces.length === 0) {
    return (
      <p className="clock-in-form__empty">
        先に「職場管理」から職場を登録してください。
      </p>
    )
  }

  return (
    <form className="clock-in-form" onSubmit={handleSubmit}>
      <label className="clock-in-form__field">
        <span>職場</span>
        <select value={workplaceId} onChange={(e) => setWorkplaceId(e.target.value)}>
          {workplaces.map((workplace) => (
            <option key={workplace.id} value={workplace.id}>
              {workplace.name}
            </option>
          ))}
        </select>
      </label>

      <label className="clock-in-form__field">
        <span>始業時間</span>
        <input
          type="time"
          required
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </label>

      <label className="clock-in-form__field">
        <span>終業時間</span>
        <input
          type="time"
          required
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </label>

      <div className="clock-in-form__actions">
        {onCancel && (
          <button
            type="button"
            className="clock-in-form__btn clock-in-form__btn--ghost"
            onClick={onCancel}
          >
            キャンセル
          </button>
        )}
        <button type="submit" className="clock-in-form__btn clock-in-form__btn--primary">
          お疲れさまでした☕
        </button>
      </div>
    </form>
  )
}

export default ClockInForm
