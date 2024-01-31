import mongoose from 'mongoose';
import validator from 'validator';

const projectSchema = new mongoose.Schema({
    projectName:{
        type: String,
        required: [true, 'Please provide a project name.']
    },
    Description:{
        type: String,
        required: [true, 'Please provide a project description.']
    },
    teamMembers:{
        type: Array,
        default: []
    },
    duration:{
        type: Number,
        required:[true, "Please provide a duration."],
        default: 1
    },
    status:{
        type: String,
        enum: ["to-do", "in-progress", "completed"],
        default: "to-do"
    },
    startDate:{
        type: Date,
        required:[true, "Please provide a start date."]
    },
    endDate:{
        type: Date,
        required:[true, "Please provide an end date."]
    }
})