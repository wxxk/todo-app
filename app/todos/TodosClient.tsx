'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAppStore } from '@/store'
import { Todo, TodoStatus } from '@/types'
import Header from '@/components/layout/Header'
import TodoModal from '@/components/todos/TodoModal'
import { TodoFormValues } from '@/components/todos/TodoForm'

const KanbanBoard = dynamic(() => import('@/components/todos/KanbanBoard'), { ssr: false })

export default function TodosClient() {
  const { todos, todosLoading, fetchTodos, addTodo, updateTodo, deleteTodo, moveTodo, goals, fetchGoals, weeklyPlans, fetchWeeklyPlans } =
    useAppStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Todo | null>(null)

  useEffect(() => {
    fetchTodos()
    fetchGoals()
    fetchWeeklyPlans()
  }, [fetchTodos, fetchGoals, fetchWeeklyPlans])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(todo: Todo) {
    setEditing(todo)
    setModalOpen(true)
  }

  async function handleSubmit(input: TodoFormValues) {
    if (editing) {
      await updateTodo(editing._id, input)
    } else {
      await addTodo(input)
    }
  }

  async function handleMove(id: string, status: TodoStatus, beforeId: string | null, afterId: string | null) {
    try {
      await moveTodo(id, status, beforeId, afterId)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Header title="할 일" description="드래그하여 상태를 변경할 수 있습니다." />
        <button onClick={openCreate} className="btn-primary">
          + 새 할 일
        </button>
      </div>

      {todosLoading && <p className="text-body-sm text-muted">불러오는 중...</p>}

      <KanbanBoard todos={todos} onEdit={openEdit} onDelete={deleteTodo} onMove={handleMove} />

      <TodoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        goals={goals}
        weeklyPlans={weeklyPlans}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
