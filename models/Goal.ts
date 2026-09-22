import mongoose, { Schema, models, model } from 'mongoose'

export interface GoalDocument extends mongoose.Document {
  title: string
  description?: string
  progress: number
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const GoalSchema = new Schema<GoalDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

GoalSchema.index({ userId: 1 })

export default models.Goal || model<GoalDocument>('Goal', GoalSchema)
