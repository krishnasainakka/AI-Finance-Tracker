import mongoose from 'mongoose';

const IncomeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Account',
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurringPeriod: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    required: function() { return this.recurring; }
  },
  originalRecurringId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  createdBy: {
    type: String, // Clerk user ID
    required: true,
    trim: true
  },
  type: {
    type: String,
    default: 'income',
    enum: ['income']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add indexes
IncomeSchema.index({ createdBy: 1 });
IncomeSchema.index({ date: -1 });
IncomeSchema.index({ accountId: 1 });
IncomeSchema.index({ recurring: 1 });

const Income = mongoose.model('Income', IncomeSchema);
export default Income;
