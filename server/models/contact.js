import mongoose from 'mongoose'

const { Schema, model } = mongoose
function serialize(_doc, object) {
  object.id = object._id.toString()
  delete object._id
  delete object.__v
  delete object.passwordHash
}
const options = { timestamps: true, toJSON: { transform: serialize } }

const contactSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3 },
    company: { type: String, default: '' },
    email: { type: String, required: true, match: /.+@.+\..+/ },
    phone: String,
  },
  options,
)

const Contact = model('Contact', contactSchema)

export default Contact