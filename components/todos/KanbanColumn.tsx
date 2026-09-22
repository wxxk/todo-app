'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Todo, TodoStatus } from '@/types'
import TodoCard from './TodoCard'

const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: '할 일',
  doing: '진행 중',
  done: '완료',
}

interface KanbanColumnProps {
  status: TodoStatus
  todos: Todo[]
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

export default function KanbanColumn({ status, todos, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[300px] flex-col gap-2 rounded-lg border p-3 transition-colors ${
        isOver
          ? 'border-neutral-400 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800/50'
          : 'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50'
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{STATUS_LABELS[status]}</h3>
        <span className="text-xs text-neutral-400">{todos.length}</span>
      </div>
      <SortableContext items={todos.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {todos.map((todo) => (
            <TodoCard key={todo._id} todo={todo} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
