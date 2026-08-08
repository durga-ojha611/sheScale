import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  expertise: [{ type: String }],
  bio: String,
  imageUrl: String,
  availableSlots: [{
    date: String,
    time: String,
    isBooked: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export const Mentor = mongoose.model('Mentor', mentorSchema);
export default Mentor;
