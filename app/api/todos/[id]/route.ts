import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import Todo, { TodoDocument } from '@/models/Todo'
import WeeklyPlan from '@/models/WeeklyPlan'
import Goal from '@/models/Goal'
import { parseLocalDate } from '@/lib/utils'
import { getSessionUserId } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

/** Loads the todo and checks ownership. Returns a ready-to-send NextResponse on failure. */
async function loadOwnedTodo(
  id: string,
  userId: string
): Promise<{ todo: TodoDocument } | { error: NextResponse }> {
  const todo = await Todo.findById(id)
  if (!todo) {
    return { error: NextResponse.json({ error: '할 일을 찾을 수 없습니다.' }, { status: 404 }) }
  }
  if (String(todo.userId) !== userId) {
    return { error: NextResponse.json({ error: '본인의 할 일만 접근할 수 있습니다.' }, { status: 403 }) }
  }
  return { todo }
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: '유효하지 않은 id입니다.' }, { status: 400 })
  }
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  try {
    await connectDB()
    const result = await loadOwnedTodo(id, userId)
    if ('error' in result) return result.error
    return NextResponse.json(result.todo)
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// PUT은 부분 업데이트가 아니라 전체 교체다: 요청 바디에서 빠지거나 비어 있는
// 선택 필드(description/dueDate/dayOfWeek/weeklyPlanId/goalId)는 명시적으로 $unset된다.
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: '유효하지 않은 id입니다.' }, { status: 400 })
  }
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  try {
    await connectDB()
    const owned = await loadOwnedTodo(id, userId)
    if ('error' in owned) return owned.error

    const body = await request.json()
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'title은 필수입니다.' }, { status: 400 })
    }
    if (body.weeklyPlanId) {
      if (!mongoose.Types.ObjectId.isValid(body.weeklyPlanId)) {
        return NextResponse.json({ error: '유효하지 않은 주간 계획입니다.' }, { status: 400 })
      }
      const plan = await WeeklyPlan.findOne({ _id: body.weeklyPlanId, userId })
      if (!plan) {
        return NextResponse.json({ error: '유효하지 않은 주간 계획입니다.' }, { status: 400 })
      }
    }
    if (body.goalId) {
      if (!mongoose.Types.ObjectId.isValid(body.goalId)) {
        return NextResponse.json({ error: '유효하지 않은 목표입니다.' }, { status: 400 })
      }
      const goal = await Goal.findOne({ _id: body.goalId, userId })
      if (!goal) {
        return NextResponse.json({ error: '유효하지 않은 목표입니다.' }, { status: 400 })
      }
    }
    const set: Record<string, unknown> = { title: body.title, priority: body.priority }
    const unset: Record<string, ''> = {}
    if (body.description) set.description = body.description
    else unset.description = ''
    if (body.dueDate) set.dueDate = parseLocalDate(body.dueDate)
    else unset.dueDate = ''
    if (body.dayOfWeek !== undefined && body.dayOfWeek !== null) set.dayOfWeek = body.dayOfWeek
    else unset.dayOfWeek = ''
    if (body.weeklyPlanId) set.weeklyPlanId = body.weeklyPlanId
    else unset.weeklyPlanId = ''
    if (body.goalId) set.goalId = body.goalId
    else unset.goalId = ''

    const update: Record<string, unknown> = { $set: set }
    if (Object.keys(unset).length > 0) update.$unset = unset

    // Scoped by {_id, userId} rather than just _id: closes the TOCTOU window
    // between the ownership check above and this write, and turns a
    // concurrent delete/reassignment into a clean 404 instead of `200 null`.
    const todo = await Todo.findOneAndUpdate({ _id: id, userId }, update, { new: true, runValidators: true })
    if (!todo) {
      return NextResponse.json({ error: '할 일을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json(todo)
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: '유효하지 않은 id입니다.' }, { status: 400 })
  }
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  try {
    await connectDB()
    const owned = await loadOwnedTodo(id, userId)
    if ('error' in owned) return owned.error

    const body = await request.json()
    const update: Record<string, unknown> = {}
    if (body.status !== undefined) update.status = body.status
    if (body.order !== undefined) update.order = body.order
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'status 또는 order가 필요합니다.' }, { status: 400 })
    }
    const todo = await Todo.findOneAndUpdate({ _id: id, userId }, update, { new: true, runValidators: true })
    if (!todo) {
      return NextResponse.json({ error: '할 일을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json(todo)
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: '유효하지 않은 id입니다.' }, { status: 400 })
  }
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  try {
    await connectDB()
    const owned = await loadOwnedTodo(id, userId)
    if ('error' in owned) return owned.error

    const deleted = await Todo.findOneAndDelete({ _id: id, userId })
    if (!deleted) {
      return NextResponse.json({ error: '할 일을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
