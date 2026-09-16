import { useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeftIcon, ImageIcon } from '../components/common/icons'
import ProgressRing from '../components/savings/ProgressRing'
import { loadClockRecords } from '../lib/clockRecordStorage'
import { resizeImageFile } from '../lib/imageResize'
import { loadSavingsGoals, saveSavingsGoals } from '../lib/savingsGoalStorage'
import { loadWorkplaces } from '../lib/workplaceStorage'
import { calculateTotalEarnings } from '../lib/wageCalculation'
import './SavingsGoalDetailScreen.css'

function SavingsGoalDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [goals, setGoals] = useState(() => loadSavingsGoals())
  const [workplaces] = useState(() => loadWorkplaces())
  const [records] = useState(() => loadClockRecords())

  const goal = goals.find((g) => g.id === id)
  const earnedAmount = calculateTotalEarnings(workplaces, records)

  async function handleBackgroundChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !goal) return
    const dataUrl = await resizeImageFile(file)
    const next = goals.map((g) => (g.id === goal.id ? { ...g, backgroundImage: dataUrl } : g))
    setGoals(next)
    saveSavingsGoals(next)
    event.target.value = ''
  }

  if (!goal) {
    return (
      <section className="savings-detail">
        <p>目標が見つかりませんでした。</p>
        <button type="button" className="savings-detail__back" onClick={() => navigate('/savings')}>
          <ChevronLeftIcon className="savings-detail__back-icon" />
          貯金一覧に戻る
        </button>
      </section>
    )
  }

  const percent = goal.targetAmount > 0 ? (earnedAmount / goal.targetAmount) * 100 : 0
  const shownAmount = Math.min(earnedAmount, goal.targetAmount)
  const remaining = Math.max(0, goal.targetAmount - earnedAmount)

  const bgStyle: CSSProperties = {
    backgroundImage: goal.backgroundImage ? `url(${goal.backgroundImage})` : undefined,
    ['--goal-color' as string]: goal.color,
  }

  return (
    <section className="savings-detail">
      <div
        className={'savings-detail__bg' + (!goal.backgroundImage ? ' savings-detail__bg--placeholder' : '')}
        style={bgStyle}
      />
      <div className="savings-detail__scrim" />

      <button type="button" className="savings-detail__back" onClick={() => navigate('/savings')}>
        <ChevronLeftIcon className="savings-detail__back-icon" />
        貯金一覧
      </button>

      <div className="savings-detail__content">
        <h2 className="savings-detail__name">{goal.name}</h2>

        <div className="savings-detail__ring-wrap">
          <ProgressRing percent={percent} color={goal.color} size={180} strokeWidth={12} />
          <div className="savings-detail__ring-label">
            <span className="savings-detail__percent">{Math.round(Math.min(100, percent))}%</span>
          </div>
        </div>

        <p className="savings-detail__amount">
          {shownAmount.toLocaleString()}円 / {goal.targetAmount.toLocaleString()}円
        </p>
        <p className="savings-detail__remaining">
          {remaining > 0 ? `あと${remaining.toLocaleString()}円` : '目標達成しました！'}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="savings-detail__file-input"
          onChange={handleBackgroundChange}
        />
        <button type="button" className="savings-detail__bg-button" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="savings-detail__bg-icon" />
          背景を選ぶ
        </button>
      </div>
    </section>
  )
}

export default SavingsGoalDetailScreen
