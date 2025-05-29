import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config(); // Load .env variables

const mongoURI = process.env.MONGODB_URI;

async function connectToMongo() {  
    await mongoose.connect(mongoURI)
    .then(()=> console.log("Connected to Mongo Successfully"))
    .catch(err => console.log(err));
}

export default  connectToMongo; 