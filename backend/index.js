import express from 'express';
import connectToMongo from './db.js';
import userBudgets from './routes/budget.js';
import income from './routes/income.js';
import account from './routes/account.js';
import expense from './routes/expense.js';
import transaction from './routes/income_expense.js';
import ai from './routes/budgetAI.js';
import chat from './routes/chatMessage.js';

import './routes/recurringExpensesCron.js'; // just import to start the cron job
import cors from 'cors';


const app = express();
const port = 5000;

connectToMongo();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json()) 

// Available Routes
app.use('/api/budget', userBudgets)
app.use('/api/income', income)
app.use('/api/expense', expense)
app.use('/api/account', account)
app.use('/api/transactions', transaction)
app.use('/api/ai',ai)
app.use('/api/chat',chat);

app.get('/',(req,res)=>{
    res.send("Hello World")
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});