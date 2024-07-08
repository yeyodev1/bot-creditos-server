import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    cellphone: {
      type: String,
      required: true, 
      unique: true,
    },
    name: {
      type: String,
      required: false,
      default: '',
    },
    CUIL: {
      type: String,
      required: false,
      default: '',
    },
    CUIT: {
      type: String,
      required: false,
      default: '',
    },
    benefitNumber: {
      type: String,
      required: false,
      default: '',
    },
    email: {
      type: String,
      required: false,
      default: '',
    },
    age: {
      type: Number,
      required: false,
      default: '',
    },
    financialData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'financialData',
      default: null
    },
    credit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'credit',
      default: null
    }
  }
)

export default mongoose.model('user', userSchema)