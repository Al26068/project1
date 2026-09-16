import { useState } from 'react'
import type { FormEvent } from 'react'
import type { SavingsGoal } from '../../types/savingsGoal'
import './SavingsGoalForm.css'

const COLOR_OPTIONS = [
  { label: '赤', value: 'var(--color-accent-red)' },
  { label: '青', value: 'var(--color-accent-blue)' },
  { label: '黄', value: 'var(--color-accent-yellow)' },
  { label: '緑', value: 'var(--color-accent-green)' },
  { label: 'ブルー', value: 'var(--color-primary)' },
  { label: 'パープル', value: 'var(--color-secondary)' },
]

type SavingsGoalInput = Omit<SavingsGoal, 'id'>

interface SavingsGoalFormProps {
  initialValue?: SavingsGoalInput
  submitLabel?: string
  onSubmit: (value: SavingsGoalInput) => void
  onCancel?: () => void
}

function SavingsGoalForm({ initialValue, submitLabel = '追加する', onSubmit, onCancel }: SavingsGoalFormProps) {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [targetAmount, setTargetAmount] = useState<number | undefined>(initialValue?.targetAmount)
  const [color, setColor] = useState(initialValue?.color ?? COLOR_OPTIONS[0].value)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name || !targetAmount) return
    onSubmit({ name, targetAmount, color })
  }

  return (
    <form className="savings-goal-form" onSubmit={handleSubmit}>
      <label className="savings-goal-form__field">
        <span>目標名</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：沖縄旅行"
        />
      </label>

      <label className="savings-goal-form__field">
        <span>目標金額（円）</span>
        <input
          type="number"
          required
          min={1}
          step={1}
          value={targetAmount ?? ''}
          onChange={(e) => setTargetAmount(e.target.value === '' ? undefined : Number(e.target.value))}
          placeholder="例：50000"
        />
      </label>

      <div className="savings-goal-form__field">
        <span>カラー</span>
        <div className="savings-goal-form__color-list">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                'savings-goal-form__color-swatch' +
                (color === option.value ? ' savings-goal-form__color-swatch--active' : '')
              }
              style={{ background: option.value }}
              aria-label={option.label}
              onClick={() => setColor(option.value)}
            />
          ))}
        </div>
      </div>

      <div className="savings-goal-form__actions">
        {onCancel && (
          <button type="button" className="savings-goal-form__btn savings-goal-form__btn--ghost" onClick={onCancel}>
            キャンセル
          </button>
        )}
        <button type="submit" className="savings-goal-form__btn savings-goal-form__btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default SavingsGoalForm
