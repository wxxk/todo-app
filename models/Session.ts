import mongoose, { Schema, models, model } from 'mongoose'

export interface SessionDocument extends mongoose.Document {
  token: string
  userId: mongoose.Types.ObjectId
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const SessionSchema = new Schema<SessionDocument>(
  {
    token: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

// TTL index: MongoDB automatically deletes the document once expiresAt is in the past.
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default models.Session || model<SessionDocument>('Session', SessionSchema)
