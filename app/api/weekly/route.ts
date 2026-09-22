import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import WeeklyPlan from '@/models/WeeklyPlan'
import Todo from '@/models/Todo'
import Goal from '@/models/Goal'
import { getWeekStart, parseLocalDate } from '@/lib/utils'
import { getSessionUserId } from '@/lib/auth'

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

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  try {
    await connectDB()
    const searchParams = request.nextUrl.searchParams
    const goalId = searchParams.get('goalId')
    const current = searchParams.get('current')

    if (goalId && !mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json({ error: '유효하지 않은 목표입니다.' }, { status: 400 })
    }

    const query: Record<string, unknown> = { userId }
    if (goalId) query.goalId = goalId
    if (current === 'true') {
      query.weekStart = getWeekStart(new Date())
    }

    const plans = await WeeklyPlan.find(query).sort({ weekStart: -1 }).limit(current ? 1 : 20)
    const withProgressList = await Promise.all(plans.map((p) => withProgress(p)))
    return NextResponse.json(withProgressList)
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  try {
    await connectDB()
    const body = await request.json()
    if (!body.weekStart) {
      return NextResponse.json({ error: 'weekStart는 필수입니다.' }, { status: 400 })
    }
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
    const weekStart = getWeekStart(parseLocalDate(body.weekStart))
    const existing = await WeeklyPlan.findOne({ weekStart, userId })
    if (existing) {
      return NextResponse.json({ error: '해당 주에 이미 주간 계획이 존재합니다.' }, { status: 409 })
    }
    const plan = await WeeklyPlan.create({
      weekStart,
      goals: body.goals ?? [],
      memo: body.memo,
      goalId: body.goalId || undefined,
      userId,
    })
    return NextResponse.json(plan, { status: 201 })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
