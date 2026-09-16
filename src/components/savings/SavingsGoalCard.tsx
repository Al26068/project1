import type { SavingsGoal } from '../../types/savingsGoal'
import './SavingsGoalCard.css'

interface SavingsGoalCardProps {
  goal: SavingsGoal
  earnedAmount: number
  onClick: () => void
}

function SavingsGoalCard({ goal, earnedAmount, onClick }: SavingsGoalCardProps) {
  const percent =
    goal.targetAmount > 0 ? Math.min(100, Math.round((earnedAmount / goal.targetAmount) * 100)) : 0
  const shownAmount = Math.min(earnedAmount, goal.targetAmount)

  return (
    <button type="button" className="savings-goal-card" onClick={onClick}>
      <div className="savings-goal-card__battery">
        <div className="savings-goal-card__battery-body">
          <span
            className="savings-goal-card__battery-fill"
            style={{ width: `${percent}%`, background: goal.color }}
          />
        </div>
        <span className="savings-goal-card__battery-nub" />
      </div>

      <p className="savings-goal-card__name">{goal.name}</p>
      <p className="savings-goal-card__percent" style={{ color: goal.color }}>
        {percent}%
      </p>
      <p className="savings-goal-card__amount">
        {shownAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}円
      </p>
    </button>
  )
}

export default SavingsGoalCard
