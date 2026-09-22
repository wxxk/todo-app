// One-off migration: assigns userId to Todo/Goal/WeeklyPlan documents created
// before GitHub login existed, and fixes WeeklyPlan's unique index (which used
// to be a single global "weekStart must be unique" constraint — now that plans
// are per-user, it needs to be a compound {userId, weekStart} index instead).
// Idempotent — only touches documents that don't have userId yet, and only
// rebuilds the index if the old one is still present.
//
// Usage (run once, after logging in with GitHub at least once so the target
// user exists in the database):
//   node --env-file=.env.local scripts/backfill-user-id.mjs <github-username>

import mongoose from 'mongoose'

const [, , usernameArg] = process.argv

if (!usernameArg) {
  console.error('사용법: node --env-file=.env.local scripts/backfill-user-id.mjs <github-username>')
  process.exit(1)
}

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI 환경변수가 필요합니다 (예: --env-file=.env.local로 실행).')
  process.exit(1)
}

const User = mongoose.model('User', new mongoose.Schema({ username: String }, { strict: false }))
const Todo = mongoose.model('Todo', new mongoose.Schema({}, { strict: false }))
const Goal = mongoose.model('Goal', new mongoose.Schema({}, { strict: false }))
const WeeklyPlan = mongoose.model('WeeklyPlan', new mongoose.Schema({}, { strict: false }))

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

for (const [name, Model] of [
  ['할 일', Todo],
  ['목표', Goal],
  ['주간 계획', WeeklyPlan],
]) {
  const result = await Model.updateMany({ userId: { $exists: false } }, { $set: { userId: user._id } })
  console.log(
    `[${name}] userId 없는 문서 ${result.matchedCount}건 중 ${result.modifiedCount}건에 ` +
      `${usernameArg}(${user._id})을(를) 할당했습니다.`
  )
}

const indexes = await WeeklyPlan.collection.indexes()
const staleIndex = indexes.find((idx) => idx.name === 'weekStart_1')
if (staleIndex) {
  await WeeklyPlan.collection.dropIndex('weekStart_1')
  console.log('[주간 계획] 예전 전역 unique 인덱스(weekStart_1)를 삭제했습니다.')
}
await WeeklyPlan.collection.createIndex({ userId: 1, weekStart: 1 }, { unique: true })
console.log('[주간 계획] {userId, weekStart} 복합 unique 인덱스를 확인/생성했습니다.')

await mongoose.disconnect()
