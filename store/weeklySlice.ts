import { StateCreator } from 'zustand'
import { WeeklyPlan, WeeklyGoalItem } from '@/types'

export interface WeeklySlice {
  weeklyPlans: WeeklyPlan[]
  currentPlan: WeeklyPlan | null
  weeklyLoading: boolean
  weeklyError: string | null
  fetchWeeklyPlans: (goalId?: string) => Promise<void>
  fetchCurrentPlan: () => Promise<void>
  fetchWeeklyPlan: (id: string) => Promise<WeeklyPlan | null>
  addWeeklyPlan: (input: { weekStart: string; goals?: WeeklyGoalItem[]; memo?: string; goalId?: string }) => Promise<WeeklyPlan>
  updateWeeklyPlan: (id: string, input: Partial<WeeklyPlan>) => Promise<void>
  toggleWeeklyGoal: (id: string, goalIndex: number, done: boolean) => Promise<void>
}

export const createWeeklySlice: StateCreator<WeeklySlice, [], [], WeeklySlice> = (set, get) => ({
  weeklyPlans: [],
  currentPlan: null,
  weeklyLoading: false,
  weeklyError: null,

  fetchWeeklyPlans: async (goalId) => {
    set({ weeklyLoading: true, weeklyError: null })
    try {
      const qs = goalId ? `?goalId=${goalId}` : ''
      const res = await fetch(`/api/weekly${qs}`)
      if (!res.ok) throw new Error('주간 계획을 불러오지 못했습니다.')
      const weeklyPlans: WeeklyPlan[] = await res.json()
      set({ weeklyPlans, weeklyLoading: false })
    } catch (err) {
      set({ weeklyError: (err as Error).message, weeklyLoading: false })
    }
  },

  fetchCurrentPlan: async () => {
    set({ weeklyLoading: true, weeklyError: null })
    try {
      const res = await fetch('/api/weekly?current=true')
      if (!res.ok) throw new Error('이번 주 계획을 불러오지 못했습니다.')
      const plans: WeeklyPlan[] = await res.json()
      set({ currentPlan: plans[0] ?? null, weeklyLoading: false })
    } catch (err) {
      set({ weeklyError: (err as Error).message, weeklyLoading: false })
    }
  },

  fetchWeeklyPlan: async (id) => {
    const res = await fetch(`/api/weekly/${id}`)
    if (!res.ok) return null
    return res.json()
  },

  addWeeklyPlan: async (input) => {
    const res = await fetch('/api/weekly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? '주간 계획 생성에 실패했습니다.')
    }
    const plan: WeeklyPlan = await res.json()
    set({ weeklyPlans: [plan, ...get().weeklyPlans] })
    return plan
  },

  updateWeeklyPlan: async (id, input) => {
    const res = await fetch(`/api/weekly/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error('주간 계획 수정에 실패했습니다.')
    const updated: WeeklyPlan = await res.json()
    set({
      weeklyPlans: get().weeklyPlans.map((p) => (p._id === id ? updated : p)),
      currentPlan: get().currentPlan?._id === id ? updated : get().currentPlan,
    })
  },

  toggleWeeklyGoal: async (id, goalIndex, done) => {
    const prevPlans = get().weeklyPlans
    const prevCurrent = get().currentPlan
    const patchLocal = (p: WeeklyPlan): WeeklyPlan => ({
      ...p,
      goals: p.goals.map((g, i) => (i === goalIndex ? { ...g, done } : g)),
    })
    set({
      weeklyPlans: prevPlans.map((p) => (p._id === id ? patchLocal(p) : p)),
      currentPlan: prevCurrent && prevCurrent._id === id ? patchLocal(prevCurrent) : prevCurrent,
    })

    const res = await fetch(`/api/weekly/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalIndex, done }),
    })
    if (!res.ok) {
      set({ weeklyPlans: prevPlans, currentPlan: prevCurrent })
      throw new Error('주간 목표 상태 변경에 실패했습니다.')
    }
    const updated: WeeklyPlan = await res.json()
    set({
      weeklyPlans: get().weeklyPlans.map((p) => (p._id === id ? updated : p)),
      currentPlan: get().currentPlan?._id === id ? updated : get().currentPlan,
    })
  },
})
