/**
 * LocalBusiness.model.js
 * Reason: STANDALONE — geo-indexed, queried independently of the User collection
 * for the Hyper-Local Ecosystem Blueprint feature. Needs a 2dsphere index on
 * coordinates for $near queries, and separate filtering by domain/industry
 * that would be inefficient inside the User collection.
 * Denormalizes owner name + avatar (read-mostly) to avoid a join on every map render.
 */

import mongoose from 'mongoose';

const LocalBusinessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Denormalized from User.profile for fast card rendering (read-mostly, rarely changes)
    ownerName:   { type: String, default: '' },
    ownerAvatar: { type: String, default: '' },

    businessName: { type: String, required: true },
    description:  { type: String, default: '' },
    domain:       { type: String, required: true, index: true },    // e.g. 'textile', 'agri', 'tech'
    industry:     { type: String, default: '' },
    productTypes: { type: [String], default: [] },                  // e.g. ['raw cotton', 'yarn']
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },

    // Location for geo-matching
    location: {
      city:  { type: String, required: true, index: true },
      state: { type: String, required: true },
      // GeoJSON point for $near queries (lat/lng)
      coordinates: {
        type:        { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },           // [longitude, latitude]
      },
    },

    // Marks whether this business is seeking B2B partnerships (non-competing)
    isSeekingPartners: { type: Boolean, default: true, index: true },
    isVerified:        { type: Boolean, default: false },
    status:            { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true }
);

// ── Geo index — required for $near / $geoWithin queries ─────────────────────
LocalBusinessSchema.index({ 'location.coordinates': '2dsphere' });

// ── Compound indexes for filtered ecosystem search ───────────────────────────
LocalBusinessSchema.index({ 'location.city': 1, domain: 1, isSeekingPartners: 1 });
LocalBusinessSchema.index({ 'location.state': 1, status: 1 });

export default mongoose.model('LocalBusiness', LocalBusinessSchema);
