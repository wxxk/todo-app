'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { Goal } from '@/types'
import Header from '@/components/layout/Header'
import GoalCard from '@/components/goals/GoalCard'
import GoalForm from '@/components/goals/GoalForm'
import Modal from '@/components/shared/Modal'

export default function GoalsClient() {
  const { goals, goalsLoading, fetchGoals, addGoal, updateGoal, deleteGoal } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(goal: Goal) {
    setEditing(goal)
    setModalOpen(true)
  }

  async function handleSubmit(input: { title: string; description?: string }) {
    if (editing) {
      await updateGoal(editing._id, input)
    } else {
      await addGoal(input)
    }
    setModalOpen(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Header title="1년 목표" description="장기 목표를 세우고 주간 계획과 연결하세요." />
        <button onClick={openCreate} className="btn-primary">
          + 새 목표
        </button>
      </div>

      {goalsLoading && <p className="text-body-sm text-muted">불러오는 중...</p>}
      {!goalsLoading && goals.length === 0 && <p className="text-body-sm text-muted">아직 등록된 목표가 없습니다.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard key={goal._id} goal={goal} onEdit={openEdit} onDelete={deleteGoal} />
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '목표 수정' : '새 목표'}>
        <GoalForm initial={editing} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
