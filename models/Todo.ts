import mongoose, { Schema, models, model } from 'mongoose'

export interface TodoDocument extends mongoose.Document {
  title: string
  description?: string
  status: 'todo' | 'doing' | 'done'
  priority: 'high' | 'medium' | 'low'
  dueDate?: Date
  dayOfWeek?: number
  order: string
  weeklyPlanId?: mongoose.Types.ObjectId
  goalId?: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const TodoSchema = new Schema<TodoDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    dueDate: { type: Date },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    order: { type: String, required: true },
    weeklyPlanId: { type: Schema.Types.ObjectId, ref: 'WeeklyPlan' },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
    // required for new documents; pre-login Todo documents lack this field until
    // scripts/backfill-todo-user.mjs assigns them to a user (see docs/OAUTH_SETUP.md)
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

TodoSchema.index({ userId: 1, status: 1, order: 1 })

export default models.Todo || model<TodoDocument>('Todo', TodoSchema)
