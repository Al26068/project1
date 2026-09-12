import { useState } from 'react'
import Modal from '../components/common/Modal'
import AddWorkplaceButton from '../components/workplace/AddWorkplaceButton'
import WorkplaceCard from '../components/workplace/WorkplaceCard'
import WorkplaceForm from '../components/workplace/WorkplaceForm'
import { loadClockRecords } from '../lib/clockRecordStorage'
import { createWorkplaceId, loadWorkplaces, saveWorkplaces } from '../lib/workplaceStorage'
import type { Workplace } from '../types/workplace'
import './WorkplaceScreen.css'

type Tab = 'current' | 'history'

function WorkplaceScreen() {
  const [workplaces, setWorkplaces] = useState<Workplace[]>(() => loadWorkplaces())
  const [records] = useState(() => loadClockRecords())
  const [isModalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('current')
  const [retireTargetId, setRetireTargetId] = useState<string | null>(null)

  const currentWorkplaces = workplaces.filter((w) => w.status !== 'retired')
  const retiredWorkplaces = workplaces.filter((w) => w.status === 'retired')
  const retireTarget = workplaces.find((w) => w.id === retireTargetId) ?? null

  function updateWorkplace(id: string, changes: Partial<Workplace>) {
    const next = workplaces.map((w) => (w.id === id ? { ...w, ...changes } : w))
    setWorkplaces(next)
    saveWorkplaces(next)
  }

  function handleAdd(value: Omit<Workplace, 'id'>) {
    const newWorkplace: Workplace = { ...value, id: createWorkplaceId() }
    const next = [...workplaces, newWorkplace]
    setWorkplaces(next)
    saveWorkplaces(next)
    setModalOpen(false)
  }

  function confirmRetire() {
    if (!retireTargetId) return
    updateWorkplace(retireTargetId, { status: 'retired' })
    setRetireTargetId(null)
  }

  const listToShow = tab === 'current' ? currentWorkplaces : retiredWorkplaces

  return (
    <section className="workplace-screen">
      <div className="workplace-screen__header">
        <h2>職場管理</h2>
        <AddWorkplaceButton onClick={() => setModalOpen(true)} />
      </div>

      <div className="workplace-screen__tabs">
        <button
          type="button"
          className={
            'workplace-screen__tab' + (tab === 'current' ? ' workplace-screen__tab--active' : '')
          }
          onClick={() => setTab('current')}
        >
          現在の職場
        </button>
        <button
          type="button"
          className={
            'workplace-screen__tab' + (tab === 'history' ? ' workplace-screen__tab--active' : '')
          }
          onClick={() => setTab('history')}
        >
          履歴（退職済み）
        </button>
      </div>

      {listToShow.length === 0 ? (
        <p className="workplace-screen__empty">
          {tab === 'current'
            ? 'まだ職場が登録されていません。右上の＋から追加してください。'
            : '退職済みの職場はまだありません。'}
        </p>
      ) : (
        <div className="workplace-screen__list">
          {listToShow.map((workplace) =>
            tab === 'current' ? (
              <WorkplaceCard
                key={workplace.id}
                workplace={workplace}
                records={records}
                onRetire={() => setRetireTargetId(workplace.id)}
              />
            ) : (
              <WorkplaceCard
                key={workplace.id}
                workplace={workplace}
                records={records}
                onRestore={() => updateWorkplace(workplace.id, { status: 'active' })}
              />
            ),
          )}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title="職場を追加">
        <WorkplaceForm onSubmit={handleAdd} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal
        open={retireTarget !== null}
        onClose={() => setRetireTargetId(null)}
        title="退職済みにしますか？"
      >
        {retireTarget && (
          <div className="workplace-screen__confirm">
            <p>「{retireTarget.name}」を履歴（退職済み）に移動します。データは残るので、後から見返せます。</p>
            <div className="workplace-form__actions">
              <button
                type="button"
                className="workplace-form__btn workplace-form__btn--ghost"
                onClick={() => setRetireTargetId(null)}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="workplace-form__btn workplace-form__btn--primary"
                onClick={confirmRetire}
              >
                退職済みにする
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}

export default WorkplaceScreen
