import mongoose from 'mongoose'

const { Schema, model } = mongoose
function serialize(_doc, object) {
  object.id = object._id.toString()
  delete object._id
  delete object.__v
  delete object.passwordHash 
}

const options = { timestamps: true, toJSON: { transform: serialize } }

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'Diseño de producto' },
    color: { type: String, default: 'purple' },
  },
  options,
)
const User = model('User', userSchema)
export default User