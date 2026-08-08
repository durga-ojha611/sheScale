import mongoose from 'mongoose';

const pitchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    problem: {
      type: String,
      required: true,
    },
    solution: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    stage: {
      type: String,
      enum: ['idea', 'prototype', 'revenue'],
      required: true,
    },
  },
  { timestamps: true }
);

const Pitch = mongoose.model('Pitch', pitchSchema);
export default Pitch;
