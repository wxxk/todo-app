import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import Todo from '@/models/Todo'
import WeeklyPlan from '@/models/WeeklyPlan'
import Goal from '@/models/Goal'
import { keyBetween } from '@/lib/fractionalIndex'
import { parseLocalDate } from '@/lib/utils'
import { getSessionUserId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  try {
    await connectDB()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const weeklyPlanId = searchParams.get('weeklyPlanId')
    const goalId = searchParams.get('goalId')

    if (weeklyPlanId && !mongoose.Types.ObjectId.isValid(weeklyPlanId)) {
      return NextResponse.json({ error: '유효하지 않은 주간 계획입니다.' }, { status: 400 })
    }
    if (goalId && !mongoose.Types.ObjectId.isValid(goalId)) {
      return NextResponse.json({ error: '유효하지 않은 목표입니다.' }, { status: 400 })
    }
    const query: Record<string, unknown> = { userId }
    if (status) query.status = status
    if (weeklyPlanId) query.weeklyPlanId = weeklyPlanId
    if (goalId) query.goalId = goalId

    const todos = await Todo.find(query).sort({ status: 1, order: 1 })
    return NextResponse.json(todos)
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
    const status = body.status ?? 'todo'
    const priority = body.priority ?? 'medium'
    let order: string
    if (priority === 'high') {
      const first = await Todo.findOne({ userId, status }).sort({ order: 1 })
      order = keyBetween(null, first?.order ?? null)
    } else {
      const last = await Todo.findOne({ userId, status }).sort({ order: -1 })
      order = keyBetween(last?.order ?? null, null)
    }

    const todo = await Todo.create({
      title: body.title,
      description: body.description,
      status,
      priority,
      dueDate: body.dueDate ? parseLocalDate(body.dueDate) : undefined,
      dayOfWeek: body.dayOfWeek,
      order,
      weeklyPlanId: body.weeklyPlanId || undefined,
      goalId: body.goalId || undefined,
      userId,
    })
    return NextResponse.json(todo, { status: 201 })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
