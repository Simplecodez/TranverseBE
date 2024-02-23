import mongoose from 'mongoose';
import validator from 'validator';

const demoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    validate: {
      validator: (value) => {
        return (
          validator.isLength(value, { min: 3, max: 50 }) &&
          validator.matches(value, /^[a-zA-Z\s]+$/)
        );
      },
      message: 'Please your name must be 3 or more characters.'
    }
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!']
  },
  message: {
    type: String,
    required: [true, 'Please provide a message.'],
    validate: {
      validator: (value) => {
        return (
          validator.isLength(value, { min: 10, max: 250 }) &&
          validator.matches(value, /^[a-zA-Z0-9 ,.'":;!?]+$/)
        );
      },
      message:
        'Please a message. It must be 10 or more characters long and can only contain ",.\'":;!?" characters.'
    }
  },
  respondedTo: {
    type: Boolean,
    default: false,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('DemoRequest', demoSchema);
