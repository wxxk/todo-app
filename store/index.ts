import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { TodoSlice, createTodoSlice } from './todoSlice'
import { WeeklySlice, createWeeklySlice } from './weeklySlice'
import { GoalSlice, createGoalSlice } from './goalSlice'

export type AppStore = TodoSlice & WeeklySlice & GoalSlice

export const useAppStore = create<AppStore>()(
  devtools((...a) => ({
    ...createTodoSlice(...a),
    ...createWeeklySlice(...a),
    ...createGoalSlice(...a),
  }))
)
