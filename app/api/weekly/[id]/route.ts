import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import WeeklyPlan, { WeeklyPlanDocument } from '@/models/WeeklyPlan'
import Todo from '@/models/Todo'
import Goal from '@/models/Goal'
import { getSessionUserId } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

async function withProgress(plan: {
  _id: unknown
  userId: unknown
  goals: { done: boolean }[]
  toObject: () => Record<string, unknown>
}) {
  const todos = await Todo.find({ weeklyPlanId: plan._id, userId: plan.userId }).lean()
  let progress = 0
  if (todos.length > 0) {
    progress = Math.round((todos.filter((t) => t.status === 'done').length / todos.length) * 100)
  } else if (plan.goals.length > 0) {
    progress = Math.round((plan.goals.filter((g) => g.done).length / plan.goals.length) * 100)
  }
  return { ...plan.toObject(), progress }
}

/** Loads the plan and checks ownership. Returns a ready-to-send NextResponse on failure. */
async function loadOwnedPlan(
  id: string,
  userId: string
): Promise<{ plan: WeeklyPlanDocument } | { error: NextResponse }> {
  const plan = await WeeklyPlan.findById(id)
  if (!plan) {
    return { error: NextResponse.json({ error: '주간 계획을 찾을 수 없습니다.' }, { status: 404 }) }
  }
  if (String(plan.userId) !== userId) {
    return { error: NextResponse.json({ error: '본인의 주간 계획만 접근할 수 있습니다.' }, { status: 403 }) }
  }
  return { plan }
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
    const owned = await loadOwnedPlan(id, userId)
    if ('error' in owned) return owned.error
    return NextResponse.json(await withProgress(owned.plan))
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// PUT은 부분 업데이트가 아니라 전체 교체다: 요청 바디에서 빠지거나 비어 있는
// 선택 필드(memo/retrospective/goalId)는 명시적으로 $unset된다.
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
    const owned = await loadOwnedPlan(id, userId)
    if ('error' in owned) return owned.error

    const body = await request.json()
    if (Array.isArray(body.goals) && body.goals.length > 5) {
      return NextResponse.json({ error: '주간 목표는 최대 5개까지 등록할 수 있습니다.' }, { status: 400 })
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
    const set: Record<string, unknown> = {}
    const unset: Record<string, ''> = {}
    if (Array.isArray(body.goals)) set.goals = body.goals
    if (body.memo) set.memo = body.memo
    else unset.memo = ''
    if (body.retrospective) set.retrospective = body.retrospective
    else unset.retrospective = ''
    if (body.goalId) set.goalId = body.goalId
    else unset.goalId = ''

    const update: Record<string, unknown> = { $set: set }
    if (Object.keys(unset).length > 0) update.$unset = unset

    const plan = await WeeklyPlan.findOneAndUpdate({ _id: id, userId }, update, { new: true, runValidators: true })
    if (!plan) {
      return NextResponse.json({ error: '주간 계획을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json(await withProgress(plan))
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
    const body = await request.json()
    if (typeof body.goalIndex !== 'number' || typeof body.done !== 'boolean') {
      return NextResponse.json({ error: 'goalIndex, done이 필요합니다.' }, { status: 400 })
    }
    const owned = await loadOwnedPlan(id, userId)
    if ('error' in owned) return owned.error
    if (!owned.plan.goals[body.goalIndex]) {
      return NextResponse.json({ error: '해당 인덱스의 목표가 없습니다.' }, { status: 400 })
    }
    const plan = await WeeklyPlan.findOneAndUpdate(
      { _id: id, userId },
      { $set: { [`goals.${body.goalIndex}.done`]: body.done } },
      { new: true, runValidators: true }
    )
    if (!plan) {
      return NextResponse.json({ error: '주간 계획을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json(await withProgress(plan))
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
    const owned = await loadOwnedPlan(id, userId)
    if ('error' in owned) return owned.error

    const deleted = await WeeklyPlan.findOneAndDelete({ _id: id, userId })
    if (!deleted) {
      return NextResponse.json({ error: '주간 계획을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
