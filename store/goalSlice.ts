import { StateCreator } from 'zustand'
import { Goal } from '@/types'

export interface GoalSlice {
  goals: Goal[]
  goalsLoading: boolean
  goalsError: string | null
  fetchGoals: () => Promise<void>
  addGoal: (input: { title: string; description?: string }) => Promise<void>
  updateGoal: (id: string, input: { title: string; description?: string }) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
}

export const createGoalSlice: StateCreator<GoalSlice, [], [], GoalSlice> = (set, get) => ({
  goals: [],
  goalsLoading: false,
  goalsError: null,

  fetchGoals: async () => {
    set({ goalsLoading: true, goalsError: null })
    try {
      const res = await fetch('/api/goals')
      if (!res.ok) throw new Error('목표 목록을 불러오지 못했습니다.')
      const goals: Goal[] = await res.json()
      set({ goals, goalsLoading: false })
    } catch (err) {
      set({ goalsError: (err as Error).message, goalsLoading: false })
    }
  },

  addGoal: async (input) => {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error('목표 생성에 실패했습니다.')
    const goal: Goal = await res.json()
    set({ goals: [{ ...goal, progress: 0 }, ...get().goals] })
  },

  updateGoal: async (id, input) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error('목표 수정에 실패했습니다.')
    const updated: Goal = await res.json()
    set({ goals: get().goals.map((g) => (g._id === id ? { ...updated, progress: g.progress } : g)) })
  },

  deleteGoal: async (id) => {
    const prev = get().goals
    set({ goals: prev.filter((g) => g._id !== id) })
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      set({ goals: prev })
      throw new Error('목표 삭제에 실패했습니다.')
    }
  },
})
