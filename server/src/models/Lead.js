import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    author: String,
    rating: Number,
    text: String,
    publishedAt: Date
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ['google_places', 'bbb', 'manual'], default: 'manual' },
    businessName: { type: String, required: true },
    category: String,
    query: String,
    locationQuery: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    phone: String,
    website: String,
    email: String,
    socialLinks: [String],
    googlePlaceId: String,
    googleMapsUrl: String,
    latitude: Number,
    longitude: Number,
    rating: Number,
    reviewCount: Number,
    reviews: [reviewSchema],
    bbbProfileUrl: String,
    bbbRating: String,
    bbbAccredited: { type: Boolean, default: false },
    contactabilityScore: { type: Number, default: 0, min: 0, max: 100 },
    socialProfileScore: { type: Number, default: 0, min: 0, max: 100 },
    tags: [String],
    painPoints: [String],
    aiSummary: String,
    outreachEmailSubject: String,
    outreachEmailBody: String,
    websiteAudit: {
      auditedAt: Date,
      crawledUrls: [String],
      seoScore: Number,
      websiteHealthScore: Number,
      performanceScore: Number,
      designScore: Number,
      mobileScore: Number,
      conversionScore: Number,
      accessibilityScore: Number,
      securityScore: Number,
      localSeoScore: Number,
      leadScore: Number,
      issues: [String],
      priorityIssues: [String],
      recommendations: [String],
      contentGaps: [String],
      trustGaps: [String],
      competitorComparison: String,
      trafficImprovementEstimate: String,
      revenueOpportunityEstimate: String,
      redesignDetected: { type: Boolean, default: false },
      redesignProposal: String,
      seoProposal: String,
      localSeoProposal: String,
      googleBusinessProposal: String,
      socialMediaProposal: String,
      paidAdsProposal: String,
      reportPdfGeneratedAt: Date
    },
    outreach: {
      sentAt: Date,
      openedAt: Date,
      clickedAt: Date,
      repliedAt: Date,
      openCount: { type: Number, default: 0 },
      clickCount: { type: Number, default: 0 },
      lastError: String
    },
    status: { type: String, enum: ['new', 'qualified', 'contacted', 'opened', 'replied', 'interested', 'closed', 'won', 'lost'], default: 'new' },
    notes: String
  },
  { timestamps: true }
);

leadSchema.index({ businessName: 'text', category: 'text', address: 'text', notes: 'text' });
leadSchema.index({ source: 1, status: 1 });
leadSchema.index({ googlePlaceId: 1 }, { sparse: true });

export const Lead = mongoose.model('Lead', leadSchema);
