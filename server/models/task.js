import mongoose from 'mongoose'

const { Schema, model } = mongoose
function serialize(_doc, object) {
  object.id = object._id.toString()
  delete object._id
  delete object.__v
  delete object.passwordHash
}
const options = { timestamps: true, toJSON: { transform: serialize } }

const taskSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 3 },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    priority: { type: String, enum: ['Alta', 'Media', 'Baja'], default: 'Media' },
    estimate: { type: String, default: 2 },
    dueDate: String,
  },
  options,
)

const Task = model ('Task', taskSchema)
export default Task