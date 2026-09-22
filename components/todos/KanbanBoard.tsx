'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { Todo, TodoStatus } from '@/types'
import KanbanColumn from './KanbanColumn'
import TodoCard from './TodoCard'

const STATUSES: TodoStatus[] = ['todo', 'doing', 'done']

interface KanbanBoardProps {
  todos: Todo[]
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onMove: (id: string, status: TodoStatus, beforeId: string | null, afterId: string | null) => Promise<void>
}

export default function KanbanBoard({ todos, onEdit, onDelete, onMove }: KanbanBoardProps) {
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function columnTodos(status: TodoStatus, excludeId?: string) {
    return todos
      .filter((t) => t.status === status && t._id !== excludeId)
      .sort((a, b) => (a.order < b.order ? -1 : 1))
  }

  function handleDragStart(event: DragStartEvent) {
    const todo = todos.find((t) => t._id === event.active.id)
    setActiveTodo(todo ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTodo(null)
    if (!over) return

    const activeTodo = todos.find((t) => t._id === active.id)
    if (!activeTodo) return

    const overStatus = STATUSES.includes(over.id as TodoStatus) ? (over.id as TodoStatus) : undefined
    const overTodo = !overStatus ? todos.find((t) => t._id === over.id) : undefined
    const targetStatus = overStatus ?? overTodo?.status ?? activeTodo.status

    const columnList = columnTodos(targetStatus, activeTodo._id)

    if (!overTodo) {
      const last = columnList[columnList.length - 1]
      if (targetStatus === activeTodo.status && !last) return
      await onMove(activeTodo._id, targetStatus, last?._id ?? null, null)
      return
    }

    const overIndex = columnList.findIndex((t) => t._id === overTodo._id)
    const before = columnList[overIndex - 1]
    await onMove(activeTodo._id, targetStatus, before?._id ?? null, overTodo._id)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATUSES.map((status) => (
          <KanbanColumn key={status} status={status} todos={columnTodos(status)} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      <DragOverlay>
        {activeTodo && <TodoCard todo={activeTodo} onEdit={() => {}} onDelete={() => {}} overlay />}
      </DragOverlay>
    </DndContext>
  )
}
