import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    validate: {
      validator: (value) => {
        return validator.isLength(value, { min: 3, max: 50 })&&validator.matches(value, /^[a-zA-Z\s]+$/)
      },
      message: 'Please your name must be 3 or more characters.',
    }
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!']
  },
  companyName: {
    type: String,
    required: false,
    validate: {
      validator: (value) => {
        return validator.isLength(value, { min: 3, max: 50 })&&validator.matches(value, /^[a-zA-Z0-9\s]+$/);
      },
      message: 'Invalid company name, Only Alphanumeric characters and "," are allowed',
    },
  },
  website: {
    type: String,
    required: false,
    validate: {
      validator: (value) => {
        return validator.isURL(value, { require_protocol: false });
      },
      message: 'Invalid website URL',
    },
  },
  password: {
    type: String,
    select: false
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Passwords are not the same'
    }
  },
  role: {
    type: String,
    enum: ['user', 'team-lead', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  licence: {
    type: String,
    select: false
  },
  active: {
    type: Boolean,
    default: false,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  ownerPassword
) {
  return await bcrypt.compare(candidatePassword, ownerPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};


userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};



export default mongoose.model('User', userSchema);
