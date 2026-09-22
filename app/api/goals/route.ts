import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Goal from '@/models/Goal'
import WeeklyPlan from '@/models/WeeklyPlan'
import Todo from '@/models/Todo'

async function withProgress(goal: { _id: unknown; toObject: () => Record<string, unknown> }) {
  const plans = await WeeklyPlan.find({ goalId: goal._id }).lean()
  if (plans.length === 0) {
    return { ...goal.toObject(), progress: 0 }
  }
  const todos = await Todo.find({ weeklyPlanId: { $in: plans.map((p) => p._id) } }).lean()
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

export async function GET() {
  try {
    await connectDB()
    const goals = await Goal.find().sort({ createdAt: -1 })
    const withProgressList = await Promise.all(goals.map((g) => withProgress(g)))
    return NextResponse.json(withProgressList)
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'title은 필수입니다.' }, { status: 400 })
    }
    const goal = await Goal.create({ title: body.title, description: body.description })
    return NextResponse.json(goal, { status: 201 })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
