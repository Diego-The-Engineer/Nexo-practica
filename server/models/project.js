import mongoose from 'mongoose'

const { Schema, model } = mongoose
function serialize(_doc, object) {
  object.id = object._id.toString()
  delete object._id
  delete object.__v
  delete object.passwordHash
}
const options = { timestamps: true, toJSON: { transform: serialize } }

const projectSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 80 },
    description: { type: String, default: '' },
    client: { type: String, default: 'Estudio Norte' },
    color: { type: String, default: 'purple' },
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
    budget: { type: Number, min: 0, default: 12000 },
    dueDate: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  options,
)

const Project = model('Prokect', projectSchema)

export default Project