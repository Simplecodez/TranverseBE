import mongoose from 'mongoose';
import validator from 'validator';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a project name.'],
    validate: {
      validator: (value) => {
        return validator.isLength(value, { min: 3, max: 50 }) && validator.matches(value, /^[a-zA-Z\s]+$/);
      },
      message: 'Please provide a project title.'
    }
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description.'],
    validate: {
      validator: (value) => {
        return validator.isLength(value, { min: 3, max: 3000 });
      },
      message: 'Description is too long and can only allow '
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
          default: 'member'
        },
        accepted: {
          type: Boolean,
          default: false
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
        // dueTime: {
        //   type: String,
        //   required: [true, 'Please provide a due time for the assigned task.'],
        //   validate: {
        //     validator: function (value) {
        //       return /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        //     },
        //     message: (props) => `${props.value} is not a valid time format. Please use format HH:MM (24-hour format).`
        //   }
        // },
        dueDate: {
          type: Date,
          required: [true, 'Please provide a due date for the assigned task.']
        },
        status: {
          type: String,
          enum: ['Todo', 'InProgress', 'InReview', 'Done'],
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
  priceCurrency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'NGN'],
    default: 'NGN'
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
  usersNotRegistered: {
    type: [String]
  },
  createAt: {
    type: Date,
    default: Date.now
  }
});

projectSchema.pre(/^find/, function (next) {
  this.populate('teamMembers.user');
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
