import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Mentor } from '../models/index.js';

dotenv.config({ path: './.env' });

const seedMentors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding mentors...');

    await Mentor.deleteMany({});
    
    const mentors = [
      {
        name: 'Anita Desai',
        title: 'Founder & CEO, TechFlow India',
        expertise: ['Tech', 'SaaS', 'Fundraising'],
        bio: 'Scaled her SaaS startup from 0 to 1M users. Expert in securing seed and Series A rounds for deep-tech.',
        imageUrl: 'https://i.pravatar.cc/150?img=1',
        availableSlots: [
          { date: '2026-10-01', time: '10:00 AM', isBooked: false },
          { date: '2026-10-01', time: '02:00 PM', isBooked: false },
          { date: '2026-10-02', time: '11:00 AM', isBooked: false }
        ]
      },
      {
        name: 'Priya Sharma',
        title: 'Managing Director, Horizon Ventures',
        expertise: ['Fintech', 'D2C', 'Operations'],
        bio: '15 years of VC experience focusing on early-stage D2C and Fintech startups. Strong advocate for women founders.',
        imageUrl: 'https://i.pravatar.cc/150?img=5',
        availableSlots: [
          { date: '2026-10-03', time: '09:00 AM', isBooked: false },
          { date: '2026-10-04', time: '04:00 PM', isBooked: false }
        ]
      },
      {
        name: 'Dr. Riya Kapoor',
        title: 'Chief Scientist, BioNova',
        expertise: ['HealthTech', 'R&D', 'Grants'],
        bio: 'Expert in securing government grants and subsidies for R&D heavy businesses.',
        imageUrl: 'https://i.pravatar.cc/150?img=9',
        availableSlots: [
          { date: '2026-10-05', time: '11:00 AM', isBooked: false },
          { date: '2026-10-05', time: '03:00 PM', isBooked: false }
        ]
      }
    ];

    await Mentor.insertMany(mentors);
    console.log('Mentors seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding mentors:', error);
    process.exit(1);
  }
};

seedMentors();
