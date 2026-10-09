import mongoose from 'mongoose'

const { Schema, model } = mongoose
function serialize(_doc, object) {
  object.id = object._id.toString()
  delete object._id
  delete object.__v
  delete object.passwordHash
}
const options = { timestamps: true, toJSON: { transform: serialize } }

const resourceSchema = new Schema(
  {
    title: { type: String, required: true, minlength: 3 },
    url: { type: String, required: true },
    description: String,
    tag: { type: String, default: 'Diseño' },
    likes: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  options,
)

const Resource = model('Resource', resourceSchema)

export default Resource