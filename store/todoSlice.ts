import { StateCreator } from 'zustand'
import { Todo, TodoStatus } from '@/types'
import { keyBetween } from '@/lib/fractionalIndex'

export interface TodoSlice {
  todos: Todo[]
  todosLoading: boolean
  todosError: string | null
  fetchTodos: () => Promise<void>
  addTodo: (input: Partial<Todo> & { title: string }) => Promise<void>
  updateTodo: (id: string, input: Partial<Todo>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  moveTodo: (id: string, status: TodoStatus, beforeId: string | null, afterId: string | null) => Promise<void>
}

export const createTodoSlice: StateCreator<TodoSlice, [], [], TodoSlice> = (set, get) => ({
  todos: [],
  todosLoading: false,
  todosError: null,

  fetchTodos: async () => {
    set({ todosLoading: true, todosError: null })
    try {
      const res = await fetch('/api/todos')
      if (!res.ok) throw new Error('할 일 목록을 불러오지 못했습니다.')
      const todos: Todo[] = await res.json()
      set({ todos, todosLoading: false })
    } catch (err) {
      set({ todosError: (err as Error).message, todosLoading: false })
    }
  },

  addTodo: async (input) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error('할 일 생성에 실패했습니다.')
    const todo: Todo = await res.json()
    set({ todos: [...get().todos, todo] })
  },

  updateTodo: async (id, input) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error('할 일 수정에 실패했습니다.')
    const updated: Todo = await res.json()
    set({ todos: get().todos.map((t) => (t._id === id ? updated : t)) })
  },

  deleteTodo: async (id) => {
    const prev = get().todos
    set({ todos: prev.filter((t) => t._id !== id) })
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      set({ todos: prev })
      throw new Error('할 일 삭제에 실패했습니다.')
    }
  },

  moveTodo: async (id, status, beforeId, afterId) => {
    const prev = get().todos
    const before = beforeId ? prev.find((t) => t._id === beforeId) : undefined
    const after = afterId ? prev.find((t) => t._id === afterId) : undefined

    let order: string
    try {
      order = keyBetween(before?.order ?? null, after?.order ?? null)
    } catch {
      throw new Error('할 일 순서를 계산하지 못했습니다. 목록을 새로고침해주세요.')
    }

    set({
      todos: prev.map((t) => (t._id === id ? { ...t, status, order } : t)),
    })

    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, order }),
    })
    if (!res.ok) {
      set({ todos: prev })
      throw new Error('할 일 이동에 실패했습니다.')
    }
  },
})
