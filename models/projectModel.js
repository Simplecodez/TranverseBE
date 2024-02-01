import mongoose from 'mongoose';
import validator from 'validator';

const projectSchema = new mongoose.Schema({
    projectName:{
        type: String,
        required: [true, 'Please provide a project name.'],
        validate: {
            validator: (value) => {
              return validator.isLength(value, { min: 3, max: 50 })&&validator.matches(value, /^[a-zA-Z\s]+$/)
            },
            message: 'Please your name must be 3 or more characters.',
        }
    },
    description:{
        type: String,
        required: [true, 'Please provide a project description.'],
        validate: {
            validator: (value) => {
              return validator.isLength(value, { min: 3, max: 50 })&&validator.matches(value, /^[a-zA-Z\s]+$/)
            },
            message: 'Please your name must be 3 or more characters.',
        }
    },
    owner:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    teamMembers:{
        type: [mongoose.Schema.ObjectId],
        ref: 'User',
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
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
})

export default mongoose.model('Project', projectSchema);