import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, 
    maxlength: 150
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
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
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdBy: {
    type: String, // Clerk user ID
    required: true,
    trim: true
  },
  type: {
    type: String,
    default: 'expense',
    enum: ['expense']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add indexes
ExpenseSchema.index({ createdBy: 1 });
ExpenseSchema.index({ budgetId: 1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ accountId: 1 });
ExpenseSchema.index({ recurring: 1 });

const Expense = mongoose.model('Expense', ExpenseSchema)
export default Expense