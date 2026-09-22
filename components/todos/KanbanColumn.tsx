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
      className={`flex min-h-[300px] flex-col gap-2 rounded-md border p-3 transition-colors ${
        isOver ? 'border-border-strong bg-surface-strong' : 'border-hairline bg-surface-soft'
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-title-sm font-semibold text-ink">{STATUS_LABELS[status]}</h3>
        <span className="text-caption-sm text-muted-soft">{todos.length}</span>
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
