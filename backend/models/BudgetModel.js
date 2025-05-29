import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
    budgetname: {
        type: String,
        required: true,
        trim: true,
        maxlength: [20, 'Budget name cannot exceed 12 characters']   
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Budget amount must be non-negative']
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: [0, 'Spent amount must be non-negative']
    },
    expenseCount: {
        type: Number,
        default: 0,
        min: [0, 'Cannot be negative']
    },
    icon: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: String, // Clerk user ID
        required: true,
        trim: true
    }
}, { timestamps: true });

// Add index
BudgetSchema.index({ createdBy: 1 });

const Budget = mongoose.model('Budget', BudgetSchema)
export default Budget