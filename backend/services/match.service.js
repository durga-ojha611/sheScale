import User from '../models/User.model.js';

export const findCoFounders = async (skills, needs) => {
  // Simple algorithm: find users where their profile.skills intersect with the provided 'needs'
  // Also we exclude users who don't have the required skills.
  
  if (!needs || needs.length === 0) return [];
  
  // Find users that have AT LEAST ONE skill matching the requested 'needs'
  const matchingUsers = await User.find({
    'profile.skills': { $in: needs },
    role: 'entrepreneur', // Only match with other entrepreneurs
  }).select('_id profile.businessName profile.domain profile.city profile.skills');

  // Calculate match score
  const matches = matchingUsers.map((user) => {
    const userSkills = user.profile.skills || [];
    let overlapCount = 0;
    userSkills.forEach((skill) => {
      if (needs.includes(skill)) overlapCount++;
    });

    const matchScore = Math.min(Math.round((overlapCount / needs.length) * 100), 100);

    return {
      userId: user._id,
      name: user.profile.businessName || 'Anonymous Founder',
      skills: userSkills,
      domain: user.profile.domain,
      location: user.profile.city,
      matchScore,
    };
  });

  // Sort by highest match score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
};
