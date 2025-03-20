import mongoose from 'mongoose';

const packageSchema = mongoose.Schema(
  {
    Pg_ID: {
      type: String,
      required: true,
      unique: true,
    },
    Pg_price: {
      type: Number,
      required: true,
    },
    event: {
      type: String,
      required: true,
      ref: 'Event',
    }
  },
  {
    timestamps: true,
  }
);

export const Package = mongoose.model('Package', packageSchema);
