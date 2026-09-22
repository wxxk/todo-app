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
      className="cursor-grab space-y-1.5 rounded-md border border-neutral-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{todo.title}</p>
        <PriorityBadge priority={todo.priority} />
      </div>
      {todo.description && (
        <p className="line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">{todo.description}</p>
      )}
      {todo.dueDate && (
        <p className={`text-xs ${overdue ? 'font-medium text-red-500' : 'text-neutral-400'}`}>
          마감: {formatDate(todo.dueDate)}
        </p>
      )}
      <div className="flex justify-end gap-2 text-xs">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onEdit(todo)}
          className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          수정
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            if (confirm('이 할 일을 삭제하시겠습니까?')) onDelete(todo._id)
          }}
          className="text-red-500 hover:text-red-700"
        >
          삭제
        </button>
      </div>
    </div>
  )
}
