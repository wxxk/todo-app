'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import Header from '@/components/layout/Header'
import WeeklyPlanCard from '@/components/weekly/WeeklyPlanCard'
import WeeklyPlanForm from '@/components/weekly/WeeklyPlanForm'
import Modal from '@/components/shared/Modal'

export default function WeeklyClient() {
  const { weeklyPlans, weeklyLoading, weeklyError, fetchWeeklyPlans, addWeeklyPlan, goals, fetchGoals } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchWeeklyPlans()
    fetchGoals()
  }, [fetchWeeklyPlans, fetchGoals])

  async function handleSubmit(input: Parameters<typeof addWeeklyPlan>[0]) {
    await addWeeklyPlan(input)
    setModalOpen(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Header title="주간 계획" description="최근 주간 계획 목록입니다." />
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          + 새 주간 계획
        </button>
      </div>

      {weeklyLoading && <p className="text-body-sm text-muted">불러오는 중...</p>}
      {!weeklyLoading && weeklyPlans.length === 0 && <p className="text-body-sm text-muted">아직 등록된 주간 계획이 없습니다.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {weeklyPlans.map((plan) => (
          <WeeklyPlanCard key={plan._id} plan={plan} />
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="새 주간 계획">
        <WeeklyPlanForm
          goals={goals}
          onSubmit={async (input) => {
            try {
              await handleSubmit(input)
            } catch (err) {
              alert((err as Error).message)
            }
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {weeklyError && <p className="mt-4 text-body-sm text-error">{weeklyError}</p>}
    </div>
  )
}
