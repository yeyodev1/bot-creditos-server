import mongoose from "mongoose";

const creditSchema = new mongoose.Schema(
  {
    amountAprovved: {
      type: Number,
      required: false
    },
    quota: {
      type: Number,
      required: false
    },
    term: {
      type: Date,
      required: false
    },
    interestRate: {
      type: String,
      required: false
    },
    MonthlyQuota: {
      type: Number, 
      required: true,
    },
    bankAccount: {
      type: {},
      required: false,
    },
    LoanFollowUp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'loanFollowUp'
    }
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('credit', creditSchema)