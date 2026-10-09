import mongoose from 'mongoose'

const { Schema, model } = mongoose
function serialize(_doc, object) {
  object.id = object._id.toString()
  delete object._id
  delete object.__v
  delete object.passwordHash
}
const options = { timestamps: true, toJSON: { transform: serialize } }

const noteSchema = new Schema(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  options,
)

const Note = model('Note', noteSchema)

export default Note