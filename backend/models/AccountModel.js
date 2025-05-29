import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },    
  createdBy: {
    type: String, // Clerk user ID
    required: true,
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const Account = mongoose.model('Account', AccountSchema)
export default Account