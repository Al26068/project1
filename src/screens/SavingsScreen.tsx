import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/common/Modal'
import { PlusIcon } from '../components/common/icons'
import SavingsGoalCard from '../components/savings/SavingsGoalCard'
import SavingsGoalForm from '../components/savings/SavingsGoalForm'
import { loadClockRecords } from '../lib/clockRecordStorage'
import { createSavingsGoalId, loadSavingsGoals, saveSavingsGoals } from '../lib/savingsGoalStorage'
import { loadWorkplaces } from '../lib/workplaceStorage'
import { calculateTotalEarnings } from '../lib/wageCalculation'
import type { SavingsGoal } from '../types/savingsGoal'
import './SavingsScreen.css'

function SavingsScreen() {
  const navigate = useNavigate()
  const [goals, setGoals] = useState<SavingsGoal[]>(() => loadSavingsGoals())
  const [workplaces] = useState(() => loadWorkplaces())
  const [records] = useState(() => loadClockRecords())
  const [isModalOpen, setModalOpen] = useState(false)

  const earnedAmount = calculateTotalEarnings(workplaces, records)

  function handleAdd(value: Omit<SavingsGoal, 'id'>) {
    const goal: SavingsGoal = { ...value, id: createSavingsGoalId() }
    const next = [...goals, goal]
    setGoals(next)
    saveSavingsGoals(next)
    setModalOpen(false)
  }

  return (
    <section className="savings-screen">
      <div className="savings-screen__header">
        <h2>貯金</h2>
        <button
          type="button"
          className="savings-screen__add-button"
          onClick={() => setModalOpen(true)}
          aria-label="貯金目標を追加"
        >
          <PlusIcon className="savings-screen__add-icon" />
        </button>
      </div>

      {goals.length === 0 ? (
        <p className="savings-screen__empty">まだ目標が登録されていません。右上の＋から追加してください。</p>
      ) : (
        <div className="savings-screen__grid">
          {goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              earnedAmount={earnedAmount}
              onClick={() => navigate(`/savings/${goal.id}`)}
            />
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title="貯金目標を追加">
        <SavingsGoalForm onSubmit={handleAdd} onCancel={() => setModalOpen(false)} />
      </Modal>
    </section>
  )
}

export default SavingsScreen
