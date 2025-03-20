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
    }
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model('Event', eventSchema);
