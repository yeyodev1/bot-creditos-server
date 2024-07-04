import mongoose from "mongoose";

const financialDataSchema = new mongoose.Schema(
  {
    laborOld: {
      type: Date
    },
    monthlyIncome: {
      type: Number,
      required: false,
    },
    monthlyExpenses: {
      type: Number,
      required: false,
    },
    otherDebs: {
      type: Boolean
    },
    requestedAmount: {
      type: Number,
      required: false,
    },
    relatives: {
      type: [
        {
          relativeName: {
            type: String,
            required: false,
          },
          relationshipToApplicant: {
            type: String,
            required: false,
          },
          income: {
            type: Number,
            required: false
          }
        }
      ],
      required: false
    },
    relativeIncomeTotal: {
      type: Boolean,
      required: false,
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('financialData', financialDataSchema)