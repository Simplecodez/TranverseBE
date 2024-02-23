import mongoose from 'mongoose';
import validator from 'validator';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a project name.'],
    validate: {
      validator: (value) => {
        return (
          validator.isLength(value, { min: 3, max: 50 }) &&
          validator.matches(value, /^[a-zA-Z\s]+$/)
        );
      },
      message: 'Please provide a project title.'
    }
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description.'],
    validate: {
      validator: (value) => {
        return (
          validator.isLength(value, { min: 3, max: 500 }) &&
          validator.matches(value, /^[a-zA-Z\s.]+$/)
        );
      },
      message: 'Please provide a project description.'
    }
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: {
    type: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['team-lead', 'member'],
          default: 'member',
          required: true
        }
      }
    ],
    default: []
  },
  tasks: {
    type: [
      {
        title: {
          type: String,
          required: true
        },
        description: {
          type: String
        },
        assignedTo: {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        },
        status: {
          type: String,
          enum: ['Todo', 'In Progress', 'Done'],
          default: 'Todo'
        }
      }
    ],
    default: []
  },
  price: {
    type: Number,
    default: 10,
    required: [true, 'Please provide the price for an hour.']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide a duration.'],
    default: 1
  },
  status: {
    type: String,
    enum: ['to-do', 'in-progress', 'completed'],
    default: 'to-do'
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date.']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date.']
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  createAt: {
    type: Date,
    default: Date.now
  }
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
