import mongoose, { Schema, models, model } from 'mongoose'

export interface UserDocument extends mongoose.Document {
  githubId: string
  username: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<UserDocument>(
  {
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
)

export default models.User || model<UserDocument>('User', UserSchema)
