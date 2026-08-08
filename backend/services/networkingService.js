// services/networkingService.js — Networking Hub business logic (Features 3.1 – 3.3)
import mongoose from 'mongoose';
import { Match, LocalBusiness, MicroGrant, User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

// ── Feature 3.1: Co-founder Swipe & Match ────────────────────────────────────

export const getDiscoverProfiles = async (currentUserId, userProfile, page = 1, limit = 10) => {
  // Fetch already-matched user IDs to exclude
  const existingMatches = await Match.find({
    $or: [{ userA: currentUserId }, { userB: currentUserId }],
  }).select('userA userB').lean();

  const matchedIds = existingMatches.flatMap((m) => [m.userA.toString(), m.userB.toString()]);
  matchedIds.push(currentUserId.toString());

  // Find entrepreneurs with complementary skills
  const skip = (page - 1) * limit;
  const profiles = await User.find({
    _id: { $nin: matchedIds },
    role: 'entrepreneur',
    accountStatus: 'active',
    // Prefer profiles from same region (soft preference, not hard filter)
    'profile.state': userProfile.state || { $exists: true },
  })
    .select('email profile.businessName profile.stage profile.skills profile.bio profile.avatarUrl profile.city profile.state profile.domain')
    .skip(skip)
    .limit(limit)
    .lean();

  return profiles;
};

export const swipeOnProfile = async (swiperId, targetId, direction) => {
  if (swiperId.toString() === targetId.toString()) {
    throw new AppError('Cannot swipe on yourself.', 400);
  }

  // Only create a Match if this is a right swipe
  if (direction !== 'right') return { matched: false };

  // Check if the other user has already swiped right on this user
  // We simulate this by checking if a "pending" match exists with reversed IDs
  // In MVP: create match immediately on right swipe (no separate Swipe collection)
  // Note: This means first right-swipe creates the match (not mutual).
  // To enforce mutual matching, add a Swipe collection tracking each individual swipe.

  const [userA, userB] = [swiperId, new mongoose.Types.ObjectId(targetId)].sort();

  const existing = await Match.findOne({ userA, userB });
  if (existing) return { matched: true, match: existing };

  // Compute a basic skill complement score
  const [swiper, target] = await Promise.all([
    User.findById(swiperId).select('profile.skills profile.domain').lean(),
    User.findById(targetId).select('profile.skills profile.domain').lean(),
  ]);

  const swiperSkills = new Set(swiper?.profile?.skills || []);
  const targetSkills = new Set(target?.profile?.skills || []);
  const overlap = [...swiperSkills].filter((s) => targetSkills.has(s)).length;
  const union = new Set([...swiperSkills, ...targetSkills]).size;
  const skillComplementScore = union > 0 ? Math.round((1 - overlap / union) * 100) : 50;

  const match = await Match.create({
    userA,
    userB,
    matchType: 'cofounder',
    skillComplementScore,
    matchedBy: swiperId,
  });

  return { matched: true, match };
};

export const getUserMatches = async (userId) => {
  return Match.find({
    $or: [{ userA: userId }, { userB: userId }],
    status: 'active',
  })
    .populate('userA', 'email profile.businessName profile.skills profile.avatarUrl profile.city')
    .populate('userB', 'email profile.businessName profile.skills profile.avatarUrl profile.city')
    .sort({ createdAt: -1 })
    .lean();
};

// ── Feature 3.2: Hyper-Local Ecosystem Blueprint ──────────────────────────────

export const getLocalBusinesses = async ({ city, state, domain, lat, lng, radiusKm = 50, page = 1, limit = 20 }) => {
  const filter = { isSeekingPartners: true, status: 'active' };

  let query;
  if (lat && lng) {
    // Geo query — find businesses within radius
    query = LocalBusiness.find({
      ...filter,
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusKm * 1000,  // metres
        },
      },
    });
  } else {
    // Fallback to city/state text filter
    if (city)   filter['location.city']  = new RegExp(city, 'i');
    if (state)  filter['location.state'] = new RegExp(state, 'i');
    if (domain) filter.domain = new RegExp(domain, 'i');
    query = LocalBusiness.find(filter);
  }

  const skip = (page - 1) * limit;
  const [businesses, total] = await Promise.all([
    query.skip(skip).limit(limit).lean(),
    LocalBusiness.countDocuments(filter),
  ]);

  return { businesses, total, page, limit };
};

export const registerLocalBusiness = async (ownerId, businessData) => {
  const owner = await User.findById(ownerId).select('profile.businessName profile.avatarUrl').lean();
  return LocalBusiness.create({
    ownerId,
    ownerName:   owner?.profile?.businessName || '',
    ownerAvatar: owner?.profile?.avatarUrl || '',
    ...businessData,
  });
};

// ── Feature 3.3: Micro-Grant Community Ledger ────────────────────────────────

export const getMicroGrants = async ({ status = 'active', page = 1, limit = 20 } = {}) => {
  const filter = { status };
  const skip = (page - 1) * limit;
  const [grants, total] = await Promise.all([
    MicroGrant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    MicroGrant.countDocuments(filter),
  ]);
  return { grants, total, page, limit };
};

export const createMicroGrant = async (founderId, grantData) => {
  const founder = await User.findById(founderId).select('profile.businessName profile.avatarUrl').lean();
  return MicroGrant.create({
    founderId,
    founderName:   founder?.profile?.businessName || '',
    founderAvatar: founder?.profile?.avatarUrl || '',
    ...grantData,
    expiresAt: new Date(grantData.expiresAt),
  });
};

export const pledgeToGrant = async (grantId, backerId, { amount, message, txnRef }) => {
  const grant = await MicroGrant.findById(grantId);
  if (!grant) throw new AppError('Micro-grant post not found.', 404);
  if (grant.status !== 'active') throw new AppError('This grant is no longer accepting pledges.', 400);
  if (grant.founderId.toString() === backerId.toString()) {
    throw new AppError('You cannot back your own grant.', 400);
  }

  const backer = await User.findById(backerId).select('profile.businessName').lean();

  grant.pledges.push({
    backerId,
    backerName: backer?.profile?.businessName || '',
    amount,
    message,
    txnRef,
    paidAt: new Date(),
    status: 'confirmed',
  });

  grant.currentAmount += amount;
  grant.backerCount += 1;

  if (grant.currentAmount >= grant.targetAmount) grant.status = 'funded';

  await grant.save();
  return { grant, newTotal: grant.currentAmount, progressPercent: grant.progressPercent };
};
