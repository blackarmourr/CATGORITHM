// ============================================================
// PROPOSAL TYPES & TEMPLATES — CATGORITHM DIGITAL GROWTH
// Dynamic proposal generation for transit digital bus screen network.
// Supports 3 modes: No Package, Single Package, Multiple Comparative Options.
// ============================================================

export type ProposalIndustry =
  | 'standard'
  | 'hospitals'
  | 'clinics'
  | 'furniture'
  | 'electronics'
  | 'wedding_dress'
  | 'jewellery'
  | 'automobile'
  | 'education'
  | 'restaurants'
  | 'custom';

export type PackageMode = 'none' | 'single' | 'multiple';

export interface ProposalPackageOption {
  id: string;
  name: string;                   // e.g. "Starter", "Option 1 (Growth) ⭐", "Option 3 (Dominance)"
  buses: number;                  // 1 to 10
  videoDurationSeconds: number;   // 10, 15, 20, 25, 30, 40, 50, 60
  durationLabel: string;          // e.g. "1 Month (30 Days)" or "45 Days"
  days: number;                   // number of days (e.g. 30, 45, 60)
  routesLabel: string;            // e.g. "Selected Prime Routes" or "All 7 Corridors (Full Network)"
  monthlyPlaysEstimate: string;   // e.g. "~2,400 Plays", "~6,000 Plays", "~12,000 Plays"
  dashboardAccess: string;        // "Full 24/7 Access"
  calculatedPrice: number;        // auto-calculated
  customPriceOverride?: number;   // manual override if negotiated
  isRecommended?: boolean;
}

export interface ProposalData {
  clientName: string;
  industry: ProposalIndustry;
  customIndustryName?: string;
  proposalDate: string;           // e.g. "November 04, 2026"
  preparedBy: string;             // default "Catgorithm"
  contactPerson?: string;
  contactNumber: string;          // default "+91 97463 36175"
  contactEmail: string;           // default "teamcatgorithm@gmail.com"
  website: string;                // default "www.catgorithm.in"
  
  // Custom Objective copy (pre-filled by industry, editable by sales rep)
  objectiveTitle: string;
  objectiveP1: string;
  objectiveP2: string;

  // Package Mode
  packageMode: PackageMode;
  singlePackage?: ProposalPackageOption;
  multiplePackages?: ProposalPackageOption[];

  // Terms and custom notes
  customNotes?: string;
  gstNote?: string;
}

export interface IndustryTemplate {
  key: ProposalIndustry;
  label: string;
  badge: string;
  defaultObjectiveP1: string;
  defaultObjectiveP2: string;
}

export const INDUSTRY_TEMPLATES: Record<ProposalIndustry, IndustryTemplate> = {
  standard: {
    key: 'standard',
    label: 'General / Retail / Corporate',
    badge: 'Universal',
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping businesses reach local audiences through strategically placed displays inside private buses. Our platform builds brand visibility, recall and awareness through repeated exposure during everyday commutes.",
    defaultObjectiveP2:
      "By placing high-definition video advertisements directly before seated, attentive passengers during daily travel, our network generates repeated daily impressions, drives strong brand recall, and directs qualified footfall to your physical outlets and digital channels."
  },
  hospitals: {
    key: 'hospitals',
    label: 'Hospitals & Healthcare Institutes',
    badge: 'Healthcare',
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping businesses reach local audiences through strategically placed displays inside private buses. Our platform builds brand visibility, recall and awareness through repeated exposure during everyday commutes.",
    defaultObjectiveP2:
      "Through high-definition commercial screens with clear onboard audio, we highlight your 24/7 emergency response, specialized clinical departments, visiting super-specialist doctors, and advanced medical infrastructure—ensuring your hospital remains the first trusted choice when care is needed."
  },
  clinics: {
    key: 'clinics',
    label: 'Clinics & Diagnostic Centers',
    badge: 'Specialist Care',
    defaultObjectiveP1:
      "Neighborhood proximity and personal care are the heart of successful specialist clinics, dental centers, and diagnostic facilities. Catgorithm enables your clinic to build direct, community-wide familiarity along primary commuter routes feeding into your locality.",
    defaultObjectiveP2:
      "Educate prospective patients about preventive health packages, consultant doctor visiting schedules, advanced diagnostic equipment, and transparent pricing—turning daily commuter dwell time into verified patient appointments."
  },
  furniture: {
    key: 'furniture',
    label: 'Furniture & Interior Showrooms',
    badge: 'Home & Living',
    defaultObjectiveP1:
      "High-involvement purchases like living room collections, bedroom suites, and premium furnishings require sustained brand desire and immediate local recall. Catgorithm turns daily commuter journeys into an active visual showcase for your showroom.",
    defaultObjectiveP2:
      "By presenting your craftsmanship, showroom network, and festive promotional offers directly before thousands of commuters travelling across Kollam's prime commercial arteries, our digital bus screen network creates consistent top-of-mind recall that guides shoppers to your showrooms when furnishing their homes."
  },
  electronics: {
    key: 'electronics',
    label: 'Electronics & Home Appliances',
    badge: 'Retail Tech',
    defaultObjectiveP1:
      "In consumer electronics and home appliances, high-visibility promotional timing, exchange bonus offers, and festive discounts drive store footfall and purchase decisions across Kollam.",
    defaultObjectiveP2:
      "Catgorithm's 32-inch commercial displays broadcast dynamic product demonstrations, zero-down-payment EMI schemes, and flagship appliance offers directly to captive audiences heading to major shopping centers and retail districts."
  },
  wedding_dress: {
    key: 'wedding_dress',
    label: 'Bridal Wear, Sarees & Textiles',
    badge: 'Fashion & Bridal',
    defaultObjectiveP1:
      "Bridal couture, designer sarees, and celebration wear require breathtaking visual allure and emotional resonance. Catgorithm provides a premier digital runway inside Kollam's busiest passenger transit routes.",
    defaultObjectiveP2:
      "Showcase your bridal collections, festive textile arrivals, and exclusive wedding season offers in crystal-clear High Definition, building unmissable regional prestige that inspires families planning weddings and milestone celebrations."
  },
  jewellery: {
    key: 'jewellery',
    label: 'Jewellery & Gold Showrooms',
    badge: 'Prestige & Gold',
    defaultObjectiveP1:
      "Jewellery shopping is grounded in regional legacy, uncompromising purity, and unforgettable bridal craftsmanship. Catgorithm gives your jewellery house commanding daily visibility across Kollam's most affluent commuter routes.",
    defaultObjectiveP2:
      "Captivate commuters with intricate gold, diamond, and antique bridal collections, lightweight daily wear lines, and gold purchase advance schemes—reinforcing brand authority and festive footfall day after day."
  },
  automobile: {
    key: 'automobile',
    label: 'Automobile Dealers & Two-Wheelers',
    badge: 'Automotive',
    defaultObjectiveP1:
      "Automotive purchases require sustained desire, awareness of new model releases, attractive financing schemes, and test-drive urgency across key commuter corridors.",
    defaultObjectiveP2:
      "Broadcast cinematic vehicle walk-arounds, festive exchange bonuses, and doorstep test drive invitations directly to commuters traveling the highways and city corridors of Kollam every morning and evening."
  },
  education: {
    key: 'education',
    label: 'Educational Institutes & Coaching',
    badge: 'Education',
    defaultObjectiveP1:
      "Academic admissions, entrance coaching results, and professional degree programs require widespread parent awareness and proven student success stories.",
    defaultObjectiveP2:
      "Reach aspiring students, parents, and working professionals daily with announcements for admission batches, scholarship entrance tests, state-rank achievements, and campus placements."
  },
  restaurants: {
    key: 'restaurants',
    label: 'Restaurants, Cafes & Food Brands',
    badge: 'Food & Hospitality',
    defaultObjectiveP1:
      "Appetite appeal and location prominence drive dining choices, weekend family visits, and banquet bookings across Kollam's culinary landscape.",
    defaultObjectiveP2:
      "Showcase mouth-watering signature dishes, family dining ambiance, weekend buffet specials, and party catering capabilities to passengers as they travel through prime commercial and residential centers."
  },
  custom: {
    key: 'custom',
    label: 'Custom / Tailored Industry',
    badge: 'Bespoke',
    defaultObjectiveP1:
      "Catgorithm offers a dedicated digital transit advertising platform that enables your business to build commanding, cost-effective brand visibility across prime commuter corridors in Kollam.",
    defaultObjectiveP2:
      "By integrating high-definition commercial screens with verified high-dwell transit routes, we place your marketing message directly before thousands of prospective customers every single day."
  }
};
