import mongoose, { Schema, models, model } from 'mongoose'

export interface WeeklyGoalItemDocument {
  text: string
  done: boolean
}

export interface WeeklyPlanDocument extends mongoose.Document {
  weekStart: Date
  goals: WeeklyGoalItemDocument[]
  memo?: string
  retrospective?: string
  goalId?: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const WeeklyGoalItemSchema = new Schema<WeeklyGoalItemDocument>(
  {
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
)

const WeeklyPlanSchema = new Schema<WeeklyPlanDocument>(
  {
    weekStart: { type: Date, required: true },
    goals: {
      type: [WeeklyGoalItemSchema],
      validate: [(v: WeeklyGoalItemDocument[]) => v.length <= 5, '주간 목표는 최대 5개까지 등록할 수 있습니다.'],
      default: [],
    },
    memo: { type: String },
    retrospective: { type: String },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

// Same week is unique per user, not globally — different users can each have
// their own plan for the same calendar week.
WeeklyPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true })

export default models.WeeklyPlan || model<WeeklyPlanDocument>('WeeklyPlan', WeeklyPlanSchema)
