import mongoose from 'mongoose';
import validator from 'validator';

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, 'Please provide a comment.'],
    validate: {
      validator: (value) => {
        return (
          validator.isLength(value, { min: 3, max: 1000 })
        );
      },
      message: 'Please your name must be 3 or more characters.'
    }
  },
  commentBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Comment', commentSchema);
