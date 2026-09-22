// One-off migration: assigns userId to Todo documents created before GitHub
// login existed. Idempotent — only touches documents that don't have userId yet.
//
// Usage (run once, after logging in with GitHub at least once so the target
// user exists in the database):
//   node --env-file=.env.local scripts/backfill-todo-user.mjs <github-username>

import mongoose from 'mongoose'

const [, , usernameArg] = process.argv

if (!usernameArg) {
  console.error('사용법: node --env-file=.env.local scripts/backfill-todo-user.mjs <github-username>')
  process.exit(1)
}

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI 환경변수가 필요합니다 (예: --env-file=.env.local로 실행).')
  process.exit(1)
}

const User = mongoose.model('User', new mongoose.Schema({ username: String }, { strict: false }))
const Todo = mongoose.model('Todo', new mongoose.Schema({}, { strict: false }))

await mongoose.connect(uri)

const user = await User.findOne({ username: usernameArg })
if (!user) {
  console.error(
    `username "${usernameArg}"으로 로그인한 사용자를 찾을 수 없습니다. ` +
      'GitHub 로그인을 한 번 완료해 사용자 레코드를 먼저 만든 뒤 다시 실행하세요.'
  )
  await mongoose.disconnect()
  process.exit(1)
}

const result = await Todo.updateMany({ userId: { $exists: false } }, { $set: { userId: user._id } })

console.log(
  `user_id 없는 할 일 ${result.matchedCount}건 중 ${result.modifiedCount}건에 ` +
    `${usernameArg}(${user._id})을(를) 할당했습니다.`
)

await mongoose.disconnect()
