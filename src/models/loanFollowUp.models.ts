import mongoose from "mongoose"

const loanFollowUpSchema = new mongoose.Schema(
  {
    paymentSchedule: {
      type: [Date],
      required: false,
    },
    support: {
      type: String,
      required: false,
    },
    benefits: {
      type: String,
      required: false,
    }
  }
)

export default mongoose.model('loanFollowUp', loanFollowUpSchema)