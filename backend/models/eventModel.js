import mongoose from 'mongoose';

const eventSchema = mongoose.Schema(
  {
    E_ID: {
      type: String,
      required: true,
      unique: true,
    },
    E_name: {
      type: String,
      required: true,
    },
    E_description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'active',
    },
    date: {
      type: Date,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model('Event', eventSchema);
