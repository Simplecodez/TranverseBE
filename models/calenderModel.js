import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    description:{
        type: String,
        required: [true, 'Please provide a project name.']
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    time:{
        type: Number,
        default: 1
    },
    duration:{
        type: Number,
        default: 1
    },
    status:{
        type: String,
        enum: ["to-do", "in-progress", "completed"]
    },
    startDate:{
        type: Date
    },
    endDate:{
        type: Date
    }
    

})