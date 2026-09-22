export type TodoStatus = 'todo' | 'doing' | 'done'
export type TodoPriority = 'high' | 'medium' | 'low'

export interface Goal {
  _id: string
  title: string
  description?: string
  progress: number
  createdAt: string
  updatedAt: string
}

export interface WeeklyGoalItem {
  text: string
  done: boolean
}

export interface WeeklyPlan {
  _id: string
  weekStart: string
  goals: WeeklyGoalItem[]
  memo?: string
  retrospective?: string
  goalId?: string
  progress?: number
  createdAt: string
  updatedAt: string
}

export interface Todo {
  _id: string
  title: string
  description?: string
  status: TodoStatus
  priority: TodoPriority
  dueDate?: string
  dayOfWeek?: number
  order: string
  weeklyPlanId?: string
  goalId?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface ApiError {
  error: string
}
