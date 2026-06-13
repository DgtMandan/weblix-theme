const DEFAULT_OFFERING = 'Weblix Website Builder, template ZIPs, SEO blogs, and website launch services';

function normalizeReviewText(reviews = []) {
  return reviews.map((review) => review.text || '').join(' ').toLowerCase();
}

export function analyzeLeadPainPoints({ businessName, reviews = [], category = '', offering = DEFAULT_OFFERING }) {
  const text = normalizeReviewText(reviews);
  const points = [];

  if (/slow|late|wait|delay|queue/.test(text)) {
    points.push('Customers mention delays or wait time, so clearer online booking and page messaging may improve conversions.');
  }
  if (/expensive|price|pricing|cost|overpriced/.test(text)) {
    points.push('Pricing concerns appear in reviews, so stronger value-focused landing pages could help pre-sell services.');
  }
  if (/website|online|booking|appointment|menu|outdated|hard to find/.test(text)) {
    points.push('The business may benefit from a faster website, better service pages, and easier online actions.');
  }
  if (/rude|support|service|staff|communication/.test(text)) {
    points.push('Review sentiment suggests communication gaps that can be softened with better FAQs and expectation-setting content.');
  }
  if (!points.length) {
    points.push('Good fit for a modern Weblix website refresh with stronger SEO pages, lead capture, and mobile-first UX.');
  }

  return {
    painPoints: points,
    aiSummary: `${businessName || 'This business'} in ${category || 'this market'} could use ${offering} to improve trust, speed, and lead capture.`
  };
}

export function generateOutreachEmail(lead, offering = DEFAULT_OFFERING) {
  const firstPain = lead.painPoints?.[0] || 'your website can convert more local visitors into leads';
  const business = lead.businessName || 'your business';

  return {
    outreachEmailSubject: `Quick website growth idea for ${business}`,
    outreachEmailBody: `Hi ${business} team,\n\nI noticed ${firstPain.toLowerCase()}\n\nWeblix helps businesses launch fast, mobile-friendly websites with editable builder pages, template ZIPs, SEO-ready blog content, and clear calls to action. I can share a quick improvement plan for your current website and local search presence.\n\nWould you like me to send a short website growth audit?\n\nBest,\nWeblix Team`
  };
}

export function calculateContactabilityScore(lead = {}) {
  let score = 0;
  if (lead.phone) score += 20;
  if (lead.email) score += 25;
  if (lead.website) score += 15;
  if (lead.googleMapsUrl || lead.googlePlaceId) score += 10;
  if (Number(lead.rating) > 0 || Number(lead.reviewCount) > 0) score += 10;
  if ((lead.socialLinks || []).filter(Boolean).length) score += 10;
  if (lead.bbbProfileUrl || lead.bbbRating || lead.bbbAccredited) score += 5;
  if ((lead.painPoints || []).length) score += 5;
  return Math.min(score, 100);
}

export function calculateSocialProfileScore(lead = {}) {
  const links = (lead.socialLinks || []).filter(Boolean).map((link) => String(link).toLowerCase());
  let score = 0;
  if (links.some((link) => link.includes('linkedin.com'))) score += 35;
  if (links.some((link) => link.includes('instagram.com'))) score += 25;
  if (links.some((link) => link.includes('facebook.com') || link.includes('fb.com'))) score += 25;
  if (links.some((link) => link.includes('twitter.com') || link.includes('x.com') || link.includes('youtube.com'))) score += 15;
  return Math.min(score, 100);
}

function mapReview(review) {
  return {
    author: review.authorAttribution?.displayName || review.name || 'Google reviewer',
    rating: review.rating,
    text: review.text?.text || review.originalText?.text || '',
    publishedAt: review.publishTime ? new Date(review.publishTime) : undefined
  };
}

export function mapGooglePlace(place, query) {
  const reviews = (place.reviews || []).slice(0, 5).map(mapReview);
  const category = place.types?.[0]?.replaceAll('_', ' ') || query.businessType;
  const base = {
    source: 'google_places',
    businessName: place.displayName?.text || 'Unnamed business',
    category,
    query: query.businessType,
    locationQuery: query.location,
    address: place.formattedAddress,
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber,
    website: place.websiteUri,
    googlePlaceId: place.id,
    googleMapsUrl: place.googleMapsUri,
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
    rating: place.rating,
    reviewCount: place.userRatingCount,
    reviews
  };
  const analysis = analyzeLeadPainPoints({ ...base, offering: query.offering });
  const outreach = generateOutreachEmail({ ...base, ...analysis }, query.offering);
  const contactabilityScore = calculateContactabilityScore({ ...base, ...analysis });
  const socialProfileScore = calculateSocialProfileScore(base);
  return { ...base, ...analysis, ...outreach, contactabilityScore, socialProfileScore };
}

export async function searchGooglePlaces({ businessType, location, limit = 10, offering = DEFAULT_OFFERING }) {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    const error = new Error('GOOGLE_PLACES_API_KEY is required to search Google Maps leads. Add it in server/.env and restart the backend.');
    error.statusCode = 400;
    throw error;
  }

  const maxResultCount = Math.min(Math.max(Number(limit) || 10, 1), 20);
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.nationalPhoneNumber',
        'places.internationalPhoneNumber',
        'places.websiteUri',
        'places.rating',
        'places.userRatingCount',
        'places.googleMapsUri',
        'places.location',
        'places.types',
        'places.reviews'
      ].join(',')
    },
    body: JSON.stringify({
      textQuery: `${businessType} in ${location}`,
      maxResultCount
    })
  });

  if (!response.ok) {
    const details = await response.text();
    const error = new Error(`Google Places search failed: ${details || response.statusText}`);
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  return (data.places || []).map((place) => mapGooglePlace(place, { businessType, location, offering }));
}
