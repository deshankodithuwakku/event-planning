import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: function() { return this.role === 'customer'; }
    },
    lastName: {
      type: String,
      required: function() { return this.role === 'customer'; }
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  // For existing plain text passwords (will be replaced with hash eventually)
  if (!this.password.startsWith('$2')) {
    return this.password === enteredPassword;
  }
  // For hashed passwords
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Only hash if not already hashed
    if (!this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

export const User = mongoose.model('User', userSchema);
