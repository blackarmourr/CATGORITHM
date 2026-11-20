// ============================================================
// PROPOSAL TYPES & TEMPLATES — CATGORITHM DIGITAL GROWTH
// Dynamic proposal generation for transit digital bus screen network.
// Supports 3 modes: No Package, Single Package, Multiple Comparative Options.
// ============================================================

export type ProposalIndustry =
  // Healthcare
  | 'hospitals'               // Multi-Speciality & General Hospitals
  | 'eye_hospitals'           // Eye Hospitals & Vision Care
  | 'dental_clinics'          // Dental Care & Orthodontic Clinics
  | 'clinics'                 // Diagnostic Centers & Pathology Labs
  | 'ayurveda_wellness'       // Ayurvedic Hospitals & Wellness Centers
  | 'skin_dermatology'        // Dermatology, Cosmetology & Skin Clinics

  // Education
  | 'schools'                 // Schools (CBSE / ICSE / State Higher Secondary)
  | 'colleges'                // Colleges & Universities
  | 'primary_schools'         // Primary & Elementary Schools
  | 'preschool_montessori'    // Pre-Schools, Montessori & Play Schools
  | 'entrance_coaching'       // NEET / JEE / Entrance Coaching Academies
  | 'study_abroad'            // Study Abroad & Immigration Consultancies

  // Retail & Fashion
  | 'jewellery'               // Jewellery & Gold Showrooms
  | 'wedding_dress'           // Wedding Centers, Sarees & Bridal Textiles
  | 'furniture'               // Furniture & Interior Showrooms
  | 'electronics'             // Electronics & Home Appliances
  | 'supermarkets'            // Supermarkets & Hypermarkets

  // Automobile
  | 'automobile'              // New Car & Two-Wheeler Dealers
  | 'used_cars'               // Pre-Owned & Certified Cars
  | 'auto_service'            // Auto Detailing, Service & Tyre Plazas

  // Food & Hospitality
  | 'restaurants'             // Restaurants, Diners & Cafes
  | 'hotels_resorts'          // Hotels, Luxury Resorts & Convention Centers
  | 'bakeries_sweets'         // Bakeries, Cake Shops & Sweet Houses

  // Real Estate & Construction
  | 'builders_villas'         // Builders, Developers & Villa Projects
  | 'tiles_sanitaryware'      // Tiles, Sanitaryware & Building Materials

  // Fitness, Beauty & Finance
  | 'fitness_gym'             // Gyms, Crossfit & Fitness Centers
  | 'beauty_salon_spa'        // Beauty Salons, Bridal Studios & Spas
  | 'gold_loan_finance'       // Gold Loans, NBFCs & Banking

  // General & Custom
  | 'standard'                // Corporate & General Brand Awareness
  | 'custom';                 // Bespoke / Custom Pitch

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
  standardPrice?: number;         // Actual undiscounted standard tariff
  discountRate?: number;          // Discount percentage e.g. 20
  savings?: number;               // Discount amount in INR
  dailyPlaysPerBus?: string;      // e.g. "40–50 Plays / Day"
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
  group: string;
  label: string;
  badge: string;
  templateP1: string;
  defaultObjectiveP1: string;
  defaultObjectiveP2: string;
}

export function getIndustryObjectiveP1(industry: ProposalIndustry, clientName?: string): string {
  const tmpl = INDUSTRY_TEMPLATES[industry] || INDUSTRY_TEMPLATES.standard;
  const name = (clientName || '').trim() || 'your organization';
  return tmpl.templateP1.replace(/\{clientName\}/g, name);
}

export const INDUSTRY_GROUPS = [
  'All',
  'Healthcare',
  'Education',
  'Retail & Fashion',
  'Automobile',
  'Food & Hospitality',
  'Real Estate & Building',
  'Fitness & Services',
  'Finance & Corporate',
] as const;

export const INDUSTRY_TEMPLATES: Record<ProposalIndustry, IndustryTemplate> = {
  // ── 1. Healthcare ──
  hospitals: {
    key: 'hospitals',
    group: 'Healthcare',
    label: 'Multi-Speciality & General Hospitals',
    badge: 'Hospital',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local communities. Daily exposure during commutes strengthens brand awareness of your medical specialties and healthcare facilities.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing our healthcare partners with an effective platform to reach local communities. Daily exposure during commutes strengthens brand awareness of your medical specialties and healthcare facilities.",
    defaultObjectiveP2:
      "Highlight your emergency care, clinical departments and doctor consultations directly before seated passengers across Kollam's high-traffic corridors."
  },
  eye_hospitals: {
    key: 'eye_hospitals',
    group: 'Healthcare',
    label: 'Eye Hospitals & Vision Care Centers',
    badge: 'Eye Care',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local patients. Daily exposure during commutes strengthens brand awareness of your cataract surgeries, vision care and LASIK services.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing vision centers with an effective platform to reach local patients. Daily exposure during commutes strengthens brand awareness of your cataract surgeries, vision care and LASIK services.",
    defaultObjectiveP2:
      "Showcase advanced surgical technologies, specialist ophthalmologist schedules, and community eye screening programs directly before daily commuters."
  },
  dental_clinics: {
    key: 'dental_clinics',
    group: 'Healthcare',
    label: 'Dental Hospitals & Orthodontic Clinics',
    badge: 'Dental Care',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local families. Daily exposure during commutes strengthens brand awareness of your dental implants, orthodontic aligners and oral care.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing dental centers with an effective platform to reach local families. Daily exposure during commutes strengthens brand awareness of your dental implants, orthodontic aligners and oral care.",
    defaultObjectiveP2:
      "Build patient familiarity with cosmetic dentistry, painless pediatric treatments and smile designing packages—converting commute dwell time into appointments."
  },
  clinics: {
    key: 'clinics',
    group: 'Healthcare',
    label: 'Diagnostic Centers & Pathology Labs',
    badge: 'Diagnostic Lab',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local communities. Daily exposure during commutes strengthens brand awareness of your diagnostic scans, pathology tests and health packages.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing diagnostic labs with an effective platform to reach local communities. Daily exposure during commutes strengthens brand awareness of your diagnostic scans, pathology tests and health packages.",
    defaultObjectiveP2:
      "Promote accredited laboratory precision, advanced imaging scans and prompt home sample collection packages to thousands of daily commuters."
  },
  ayurveda_wellness: {
    key: 'ayurveda_wellness',
    group: 'Healthcare',
    label: 'Ayurvedic Hospitals & Holistic Wellness',
    badge: 'Ayurveda',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach wellness seekers. Daily exposure during commutes strengthens brand awareness of your authentic panchakarma therapies and holistic healing.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing wellness centers with an effective platform to reach wellness seekers. Daily exposure during commutes strengthens brand awareness of your authentic panchakarma therapies and holistic healing.",
    defaultObjectiveP2:
      "Highlight traditional rejuvenation packages, specialized spine and joint treatments, and natural therapies to health-conscious commuters."
  },
  skin_dermatology: {
    key: 'skin_dermatology',
    group: 'Healthcare',
    label: 'Dermatology, Laser & Cosmetology Clinics',
    badge: 'Skin Clinic',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach aesthetic clients. Daily exposure during commutes strengthens brand awareness of your laser skin treatments and cosmetology care.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing aesthetic clinics with an effective platform to reach local clients. Daily exposure during commutes strengthens brand awareness of your laser skin treatments and cosmetology care.",
    defaultObjectiveP2:
      "Engage commuters with proven aesthetic results, specialist dermatologist credentials, and laser skin rejuvenation packages."
  },

  // ── 2. Education ──
  schools: {
    key: 'schools',
    group: 'Education',
    label: 'Public & Higher Secondary Schools (CBSE / ICSE / State)',
    badge: 'School',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach parents and students. Daily exposure during commutes strengthens institutional reputation and drives awareness for school admissions.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing schools with an effective platform to reach parents and students. Daily exposure during commutes strengthens institutional reputation and drives awareness for school admissions.",
    defaultObjectiveP2:
      "Reach parents during their morning and evening commutes with timely admission announcements, academic achievements, and holistic developmental facilities."
  },
  colleges: {
    key: 'colleges',
    group: 'Education',
    label: 'Colleges & Higher Education Institutes',
    badge: 'College',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach students and parents. Daily exposure during commutes strengthens academic awareness of your degree programs and campus placements.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing colleges with an effective platform to reach youth and parents with degree admissions and placement records.",
    defaultObjectiveP2:
      "Highlight university-accredited degree programs, NAAC ratings, and high-package campus placement records to prospective students across the district."
  },
  primary_schools: {
    key: 'primary_schools',
    group: 'Education',
    label: 'Primary & Elementary Schools',
    badge: 'Primary School',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach young families. Daily exposure during commutes strengthens parental trust and awareness for foundational primary schooling.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping primary schools reach neighborhood parents with foundational education programs and admission dates.",
    defaultObjectiveP2:
      "Showcase nurturing school values, caring teacher attention, and safe campus environments directly to young parents traveling during everyday commutes."
  },
  preschool_montessori: {
    key: 'preschool_montessori',
    group: 'Education',
    label: 'Pre-Schools, Montessori & Play Schools',
    badge: 'Play School',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach parents of toddlers. Daily exposure during commutes strengthens community trust and awareness for play-school admissions.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping pre-schools connect with parents of toddlers with play-school admissions and daycare facilities.",
    defaultObjectiveP2:
      "Highlight play-way learning, certified early educators, and interactive indoor play facilities directly to young parents traveling across Kollam."
  },
  entrance_coaching: {
    key: 'entrance_coaching',
    group: 'Education',
    label: 'Entrance Coaching Academies (NEET / JEE / KEAM / PSC)',
    badge: 'Coaching',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach competitive exam aspirants. Daily exposure during commutes strengthens student awareness of your NEET and JEE coaching batches.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping entrance coaching centers broadcast rank achievements, scholarship exams, and new batch schedules.",
    defaultObjectiveP2:
      "Promote proven entrance rank records, intensive crash courses, and repeaters batch admissions to motivated students traveling throughout Kollam."
  },
  study_abroad: {
    key: 'study_abroad',
    group: 'Education',
    label: 'Study Abroad & Immigration Consultancies',
    badge: 'Study Abroad',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach ambitious students. Daily exposure during commutes strengthens student awareness of your overseas university admissions and visa guidance.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping overseas education consultancies guide students toward international degree admissions and study visas.",
    defaultObjectiveP2:
      "Capture the attention of college students and job-seekers with visa success stories, university tie-ups, and upcoming overseas education fairs."
  },

  // ── 3. Retail & Fashion ──
  jewellery: {
    key: 'jewellery',
    group: 'Retail & Fashion',
    label: 'Jewellery & Gold Showrooms',
    badge: 'Jewellery',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local shoppers. Daily exposure during commutes strengthens showroom visibility and awareness for your gold and wedding jewellery collections.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing jewellery showrooms with commanding daily visibility across prime commuter corridors.",
    defaultObjectiveP2:
      "Captivate commuters with intricate gold, diamond, and antique bridal collections, lightweight daily wear lines, and gold purchase advance schemes—reinforcing brand authority and festive footfall day after day."
  },
  wedding_dress: {
    key: 'wedding_dress',
    group: 'Retail & Fashion',
    label: 'Wedding Centers, Sarees & Bridal Textiles',
    badge: 'Bridal & Textiles',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach bridal shoppers and families. Daily exposure during commutes strengthens brand awareness of your wedding sarees and bridal collections.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing wedding centers and bridal boutiques with premier digital visibility inside passenger transit routes.",
    defaultObjectiveP2:
      "Showcase bridal collections, festive textile arrivals, and exclusive wedding season offers in crystal-clear High Definition, inspiring families planning milestone celebrations."
  },
  furniture: {
    key: 'furniture',
    group: 'Retail & Fashion',
    label: 'Furniture & Interior Showrooms',
    badge: 'Furniture',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach homeowners and families. Daily exposure during commutes strengthens showroom footfall for your solid teak furniture and modular home decor.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, turning daily commuter journeys into an active visual showcase for furniture showrooms.",
    defaultObjectiveP2:
      "Present craftsmanship, showroom network, and festive promotional offers directly before thousands of commuters, guiding shoppers to your showrooms when furnishing their homes."
  },
  electronics: {
    key: 'electronics',
    group: 'Retail & Fashion',
    label: 'Electronics, Smart Gadgets & Home Appliances',
    badge: 'Electronics',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local consumers. Daily exposure during commutes strengthens customer awareness of your home appliances and festive gadget offers.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping electronics retailers broadcast dynamic product demonstrations and zero-down-payment EMI schemes.",
    defaultObjectiveP2:
      "Broadcast dynamic product demonstrations, zero-down-payment EMI schemes, and flagship appliance offers directly to captive audiences heading to major shopping centers."
  },
  supermarkets: {
    key: 'supermarkets',
    group: 'Retail & Fashion',
    label: 'Supermarkets & Hypermarkets',
    badge: 'Supermarket',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach neighborhood households. Daily exposure during commutes strengthens customer recall for your grocery essentials and supermarket deals.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping hypermarkets announce weekend blockbuster deals, fresh arrivals, and grocery savings.",
    defaultObjectiveP2:
      "Prompt instant shopping decisions for evening and weekend grocery trips by highlighting daily price-drop alerts and doorstep delivery options."
  },

  // ── 4. Automobile ──
  automobile: {
    key: 'automobile',
    group: 'Automobile',
    label: 'New Car & Two-Wheeler Dealerships',
    badge: 'Automobile',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach prospective vehicle buyers. Daily exposure during commutes strengthens dealership awareness of your new car models and exchange offers.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing automobile dealers with cinematic visibility across key commuter corridors.",
    defaultObjectiveP2:
      "Broadcast cinematic vehicle walk-arounds, festive exchange bonuses, and doorstep test drive invitations directly to commuters traveling the highways and city corridors of Kollam."
  },
  used_cars: {
    key: 'used_cars',
    group: 'Automobile',
    label: 'Pre-Owned & Certified Car Showrooms',
    badge: 'Used Cars',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach car buyers. Daily exposure during commutes strengthens customer trust in your certified pre-owned cars and warranty options.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, connecting pre-owned car dealerships with value-conscious vehicle buyers across transit corridors.",
    defaultObjectiveP2:
      "Showcase certified multi-brand stock, 100-point vehicle inspections, and fast spot loan approvals to commuters seeking reliable personal mobility."
  },
  auto_service: {
    key: 'auto_service',
    group: 'Automobile',
    label: 'Auto Detailing, Service Centers & Tyre Plazas',
    badge: 'Auto Service',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach vehicle owners. Daily exposure during commutes strengthens customer awareness of your car detailing, periodic servicing and tyre care.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping automotive service centers remind drivers of periodic servicing, detailing, and tyre safety.",
    defaultObjectiveP2:
      "Target car and bike owners during daily travel with timely monsoon check-up packages, ceramic coating offers, and wheel alignment reminders."
  },

  // ── 5. Food & Hospitality ──
  restaurants: {
    key: 'restaurants',
    group: 'Food & Hospitality',
    label: 'Restaurants, Diners & Multi-Cuisine Cafes',
    badge: 'Restaurants',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach food enthusiasts and families. Daily exposure during commutes strengthens dining footfall and awareness for your signature culinary dishes.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, showcasing delicious dining specialties and family ambiance directly to evening commuters.",
    defaultObjectiveP2:
      "Showcase mouth-watering signature dishes, family dining ambiance, weekend buffet specials, and party catering capabilities to passengers traveling through prime commercial centers."
  },
  hotels_resorts: {
    key: 'hotels_resorts',
    group: 'Food & Hospitality',
    label: 'Hotels, Luxury Resorts & Convention Centers',
    badge: 'Hotels & Venues',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach travelers and families. Daily exposure during commutes strengthens public awareness of your luxury stay packages and banquet facilities.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, promoting luxury hospitality, banquet halls, and conference facilities to regional business travelers.",
    defaultObjectiveP2:
      "Highlight air-conditioned marriage auditoriums, premium stay packages, and corporate meeting venues to business travelers and wedding planners throughout the district."
  },
  bakeries_sweets: {
    key: 'bakeries_sweets',
    group: 'Food & Hospitality',
    label: 'Bakeries, Cake Shops & Sweet Houses',
    badge: 'Bakery & Sweets',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach families and dessert lovers. Daily exposure during commutes strengthens brand recall for your fresh celebration cakes and artisanal treats.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, tempting commuters with freshly baked birthday cakes, hot evening snacks, and traditional sweets.",
    defaultObjectiveP2:
      "Tempt evening commuters on their way home with customized celebration cakes, authentic sweet gift boxes, and fast takeout snack counters."
  },

  // ── 6. Real Estate & Construction ──
  builders_villas: {
    key: 'builders_villas',
    group: 'Real Estate & Building',
    label: 'Builders, Developers & Villa Projects',
    badge: 'Real Estate',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach home buyers. Daily exposure during commutes strengthens public awareness of your luxury villas and premium residential projects.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping builders and developers showcase luxury villas and residential apartments to prospective home buyers.",
    defaultObjectiveP2:
      "Present architectural renderings, prime location advantages, and flexible payment milestones to high-income commuters seeking property investments in Kollam."
  },
  tiles_sanitaryware: {
    key: 'tiles_sanitaryware',
    group: 'Real Estate & Building',
    label: 'Tiles, Sanitaryware & Building Materials',
    badge: 'Tiles & Bath',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach homeowners and builders. Daily exposure during commutes strengthens showroom footfall for your designer tiles and bath fittings.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping building material showrooms reach home renovators and builders with imported tiles and sanitaryware.",
    defaultObjectiveP2:
      "Inspire homeowners and civil contractors during daily travel with elegant bath suites, vitrified floor tile ranges, and factory-direct trade pricing."
  },

  // ── 7. Fitness & Services ──
  fitness_gym: {
    key: 'fitness_gym',
    group: 'Fitness & Services',
    label: 'Fitness Clubs, Gyms & Crossfit Centers',
    badge: 'Gym & Fitness',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach health-conscious commuters. Daily exposure during commutes strengthens brand awareness of your gym facilities and fitness memberships.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, motivating commuters with fitness membership packages and state-of-the-art gym facilities.",
    defaultObjectiveP2:
      "Inspire daily travelers to prioritize their wellness goals with high-energy workout visuals, transformation stories, and attractive annual membership discounts."
  },
  beauty_salon_spa: {
    key: 'beauty_salon_spa',
    group: 'Fitness & Services',
    label: 'Beauty Salons, Bridal Studios & Luxury Spas',
    badge: 'Salon & Spa',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach beauty-conscious clients. Daily exposure during commutes strengthens appointment bookings for your bridal makeovers and spa therapies.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping bridal studios and salons highlight professional makeovers and hair spa treatments.",
    defaultObjectiveP2:
      "Captivate wedding parties and professionals with elegant bridal makeover transformations, luxury hair treatments, and festive spa pampering packages."
  },
  gold_loan_finance: {
    key: 'gold_loan_finance',
    group: 'Finance & Services',
    label: 'Gold Loans, NBFCs & Banking Services',
    badge: 'Gold Loans',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local entrepreneurs and citizens. Daily exposure during commutes strengthens public awareness of your instant gold loans and low interest rates.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, promoting quick gold loans, low interest rates, and secure banking services across commuter corridors.",
    defaultObjectiveP2:
      "Reinforce financial security, instant liquidity options, and local branch accessibility directly to business owners, traders, and families."
  },

  // ── 8. General & Custom ──
  standard: {
    key: 'standard',
    group: 'Finance & Corporate',
    label: 'Corporate / General Brand Awareness',
    badge: 'Universal',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping businesses reach local audiences through strategically placed displays inside private buses. Our platform builds brand visibility, recall and awareness through repeated exposure during everyday commutes.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping businesses reach local audiences through strategically placed displays inside private buses. Our platform builds brand visibility, recall and awareness through repeated exposure during everyday commutes.",
    defaultObjectiveP2:
      "By placing high-definition video advertisements directly before seated, attentive passengers during daily travel, our network generates repeated daily impressions, drives strong brand recall, and directs qualified footfall to your physical outlets and digital channels."
  },
  custom: {
    key: 'custom',
    group: 'Finance & Corporate',
    label: 'Custom / Bespoke Pitch',
    badge: 'Bespoke',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local audiences. Our network builds commanding visibility and daily recall across prime commuter routes.",
    defaultObjectiveP1:
      "Catgorithm offers a dedicated digital transit advertising platform that enables your business to build commanding, cost-effective brand visibility across prime commuter corridors in Kollam.",
    defaultObjectiveP2:
      "By integrating high-definition commercial screens with verified high-dwell transit routes, we place your marketing message directly before thousands of prospective customers every single day."
  }
};
