import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import Goal, { GoalDocument } from '@/models/Goal'
import WeeklyPlan from '@/models/WeeklyPlan'
import Todo from '@/models/Todo'
import { getSessionUserId } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

async function withProgress(goal: { _id: unknown; userId: unknown; toObject: () => Record<string, unknown> }) {
  const plans = await WeeklyPlan.find({ goalId: goal._id, userId: goal.userId }).lean()
  if (plans.length === 0) {
    return { ...goal.toObject(), progress: 0 }
  }
  const todos = await Todo.find({ weeklyPlanId: { $in: plans.map((p) => p._id) }, userId: goal.userId }).lean()
  const todosByPlan = new Map<string, typeof todos>()
  for (const t of todos) {
    const key = String(t.weeklyPlanId)
    if (!todosByPlan.has(key)) todosByPlan.set(key, [])
    todosByPlan.get(key)!.push(t)
  }
  const planProgresses = plans.map((p) => {
    const planTodos = todosByPlan.get(String(p._id)) ?? []
    if (planTodos.length > 0) {
      return (planTodos.filter((t) => t.status === 'done').length / planTodos.length) * 100
    }
    if (p.goals.length > 0) {
      return (p.goals.filter((g: { done: boolean }) => g.done).length / p.goals.length) * 100
    }
    return 0
  })
  const progress = Math.round(planProgresses.reduce((a, b) => a + b, 0) / planProgresses.length)
  return { ...goal.toObject(), progress }
}

/** Loads the goal and checks ownership. Returns a ready-to-send NextResponse on failure. */
async function loadOwnedGoal(
  id: string,
  userId: string
): Promise<{ goal: GoalDocument } | { error: NextResponse }> {
  const goal = await Goal.findById(id)
  if (!goal) {
    return { error: NextResponse.json({ error: '목표를 찾을 수 없습니다.' }, { status: 404 }) }
  }
  if (String(goal.userId) !== userId) {
    return { error: NextResponse.json({ error: '본인의 목표만 접근할 수 있습니다.' }, { status: 403 }) }
  }
  return { goal }
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
    const owned = await loadOwnedGoal(id, userId)
    if ('error' in owned) return owned.error
    return NextResponse.json(await withProgress(owned.goal))
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

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
    const owned = await loadOwnedGoal(id, userId)
    if ('error' in owned) return owned.error

    const body = await request.json()
    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { title: body.title, description: body.description },
      { new: true, runValidators: true }
    )
    if (!goal) {
      return NextResponse.json({ error: '목표를 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json(goal)
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
    const owned = await loadOwnedGoal(id, userId)
    if ('error' in owned) return owned.error

    const deleted = await Goal.findOneAndDelete({ _id: id, userId })
    if (!deleted) {
      return NextResponse.json({ error: '목표를 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
