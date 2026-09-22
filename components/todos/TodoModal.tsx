'use client'

import { Todo, Goal, WeeklyPlan } from '@/types'
import Modal from '@/components/shared/Modal'
import TodoForm, { TodoFormValues } from './TodoForm'

interface TodoModalProps {
  open: boolean
  onClose: () => void
  initial?: Partial<Todo> | null
  goals: Goal[]
  weeklyPlans: WeeklyPlan[]
  onSubmit: (input: TodoFormValues) => Promise<void>
}

export default function TodoModal({ open, onClose, initial, goals, weeklyPlans, onSubmit }: TodoModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={initial?._id ? '할 일 수정' : '새 할 일'}>
      <TodoForm
        initial={initial}
        goals={goals}
        weeklyPlans={weeklyPlans}
        onSubmit={async (input) => {
          await onSubmit(input)
          onClose()
        }}
        onCancel={onClose}
      />
    </Modal>
  )
}
