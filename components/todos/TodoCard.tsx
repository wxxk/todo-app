'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Todo } from '@/types'
import PriorityBadge from '@/components/shared/PriorityBadge'
import { formatDate, isPast } from '@/lib/utils'

interface TodoCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  overlay?: boolean
}

export default function TodoCard({ todo, onEdit, onDelete, overlay }: TodoCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo._id,
    data: { status: todo.status },
  })

  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }

  const overdue = todo.dueDate && todo.status !== 'done' && isPast(todo.dueDate)

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      className="card-surface hover:shadow-card cursor-grab space-y-1.5 p-3 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-body-sm font-medium text-ink">{todo.title}</p>
        <PriorityBadge priority={todo.priority} />
      </div>
      {todo.description && <p className="line-clamp-2 text-caption-sm text-muted">{todo.description}</p>}
      {todo.dueDate && (
        <p className={`text-caption-sm ${overdue ? 'font-medium text-error' : 'text-muted-soft'}`}>마감: {formatDate(todo.dueDate)}</p>
      )}
      <div className="flex justify-end gap-3 text-caption-sm">
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onEdit(todo)} className="text-muted hover:text-ink">
          수정
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            if (confirm('이 할 일을 삭제하시겠습니까?')) onDelete(todo._id)
          }}
          className="text-error hover:text-error-hover"
        >
          삭제
        </button>
      </div>
    </div>
  )
}
