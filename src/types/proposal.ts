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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local communities. Through strategically placed displays inside private buses, the hospital can increase awareness of its medical services, specialties, health check-up packages and healthcare facilities. Repeated exposure during everyday commutes helps strengthen brand recognition, build public awareness and keep {clientName} connected with the community.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing our healthcare partners with an effective platform to reach local communities. Through strategically placed displays inside private buses, the hospital can increase awareness of its medical services, specialties, health check-up packages and healthcare facilities. Repeated exposure during everyday commutes helps strengthen brand recognition, build public awareness and keep the hospital connected with the community.",
    defaultObjectiveP2:
      "Through high-definition commercial screens with clear onboard audio, we highlight your 24/7 emergency response, specialized clinical departments, visiting super-specialist doctors, and advanced medical infrastructure—ensuring your hospital remains the first trusted choice when care is needed."
  },
  eye_hospitals: {
    key: 'eye_hospitals',
    group: 'Healthcare',
    label: 'Eye Hospitals & Vision Care Centers',
    badge: 'Eye Care',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local communities. Through strategically placed displays inside private buses, the eye care hospital can increase awareness of its advanced cataract surgeries, LASIK vision correction, pediatric ophthalmology, retina care and comprehensive eye check-up packages. Repeated exposure during everyday commutes helps strengthen brand recognition, build public awareness and keep {clientName} connected with the community.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing eye care centers with an effective platform to reach local communities. Through strategically placed displays inside private buses, the eye hospital can increase awareness of its cataract surgeries, LASIK procedures, and optical services. Repeated exposure during everyday commutes helps strengthen brand recognition and build public awareness.",
    defaultObjectiveP2:
      "Showcase advanced surgical technologies, specialist ophthalmologist schedules, and community eye screening programs directly before commuters looking for trusted vision care across Kollam."
  },
  dental_clinics: {
    key: 'dental_clinics',
    group: 'Healthcare',
    label: 'Dental Hospitals & Orthodontic Clinics',
    badge: 'Dental Care',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local communities. Through strategically placed displays inside private buses, the dental clinic can increase awareness of its painless root canal treatments, invisible aligners, cosmetic smile designing, dental implants and family oral hygiene check-ups. Repeated exposure during everyday commutes helps strengthen brand recognition, build public awareness and keep {clientName} connected with the community.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing dental clinics with an effective platform to reach local families. Through strategically placed displays inside private buses, the dental center can increase awareness of its modern treatments and family dental packages.",
    defaultObjectiveP2:
      "Build local patient familiarity with cosmetic dentistry, painless pediatric treatments, and modern laser procedures—converting daily travel dwell time into booked dental appointments."
  },
  clinics: {
    key: 'clinics',
    group: 'Healthcare',
    label: 'Diagnostic Centers & Pathology Labs',
    badge: 'Diagnostic Lab',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local communities. Through strategically placed displays inside private buses, the diagnostic center can increase awareness of its computerized pathology tests, advanced radiology & scan facilities, preventive master health check-ups and prompt home sample collection services. Repeated exposure during everyday commutes helps strengthen brand recognition, build public awareness and keep {clientName} connected with the community.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing diagnostic facilities with an effective platform to reach neighborhood families. Through strategically placed displays inside private buses, the center can promote master health check-ups and home sample collection.",
    defaultObjectiveP2:
      "Highlight modern imaging equipment, accredited lab precision, and convenient home sample collection packages directly to everyday commuters traveling across key city routes."
  },
  ayurveda_wellness: {
    key: 'ayurveda_wellness',
    group: 'Healthcare',
    label: 'Ayurvedic Hospitals & Holistic Wellness',
    badge: 'Ayurveda',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local communities. Through strategically placed displays inside private buses, the Ayurvedic center can increase awareness of its authentic panchakarma therapies, holistic pain management, wellness rejuvenation packages and specialized doctor consultations. Repeated exposure during everyday commutes helps strengthen brand recognition, build public awareness and keep {clientName} connected with the community.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing wellness centers with an effective platform to promote natural healing and authentic therapies to daily travelers.",
    defaultObjectiveP2:
      "Promote traditional rejuvenation packages, specialized spine and joint treatments, and authentic herbal therapies to health-conscious commuters across prime corridors."
  },
  skin_dermatology: {
    key: 'skin_dermatology',
    group: 'Healthcare',
    label: 'Dermatology, Laser & Cosmetology Clinics',
    badge: 'Skin Clinic',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local communities. Through strategically placed displays inside private buses, the skin clinic can increase awareness of its clinical dermatology services, advanced laser skin treatments, aesthetic anti-aging therapies, hair restoration solutions and personalized cosmetic care. Repeated exposure during everyday commutes helps strengthen brand recognition, build public awareness and keep {clientName} connected with the community.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing skin and cosmetology clinics with an effective platform to reach beauty-conscious commuters with modern aesthetic treatments.",
    defaultObjectiveP2:
      "Engage commuters with before-and-after results, specialist dermatologist credentials, and laser skin treatments that inspire consultation bookings."
  },

  // ── 2. Education ──
  schools: {
    key: 'schools',
    group: 'Education',
    label: 'Public & Higher Secondary Schools (CBSE / ICSE / State)',
    badge: 'School',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach parents and students across key residential corridors. Through strategically placed displays inside private buses, the school can increase awareness of its academic admissions, innovative curriculum, modern campus infrastructure, holistic extracurriculars and dedicated transport facilities. Repeated exposure during everyday commutes helps strengthen brand recognition, build community trust and keep {clientName} top-of-mind for prospective families.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing schools with an effective platform to reach parents and students across key corridors. Through strategically placed displays inside private buses, the school can promote admissions, curriculum, and modern campus facilities.",
    defaultObjectiveP2:
      "Reach parents during their morning and evening commutes with timely admission announcements, academic achievements, and holistic developmental facilities."
  },
  colleges: {
    key: 'colleges',
    group: 'Education',
    label: 'Colleges & Higher Education Institutes',
    badge: 'College',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach students and parents across the region. Through strategically placed displays inside private buses, the college can increase awareness of its degree and diploma admissions, accredited programs, stellar campus placement record, specialized labs and dynamic campus life. Repeated exposure during everyday commutes helps strengthen academic reputation, drive enrollment inquiries and keep {clientName} connected with aspiring youth.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach young families and working parents. Through strategically placed displays inside private buses, the school can increase awareness of its foundational education programs, caring faculty, activity-based learning, safe campus environment and upcoming admission schedules. Repeated exposure during everyday commutes helps strengthen institutional credibility, inspire parental confidence and keep {clientName} connected with the locality.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to connect with parents of young children. Through strategically placed displays inside private buses, the pre-school can increase awareness of its play-way learning methodology, certified Montessori teachers, interactive indoor play areas, daycare support and upcoming batch admissions. Repeated exposure during everyday commutes helps foster parental trust, drive admissions and keep {clientName} warmly recognized throughout the community.",
    defaultObjectiveP1:
      "Catgorithm offers digital bus screen advertising across Kollam, helping pre-schools connect with parents of toddlers with play-school admissions and daycare facilities.",
    defaultObjectiveP2:
      "Create warm, engaging visual impressions featuring child-centric play areas, early childhood milestones, and safe daycare support across residential bus corridors."
  },
  entrance_coaching: {
    key: 'entrance_coaching',
    group: 'Education',
    label: 'Entrance Coaching Academies (NEET / JEE / KEAM / PSC)',
    badge: 'Coaching',
    templateP1:
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach focused students and ambitious parents. Through strategically placed displays inside private buses, the academy can increase awareness of its entrance coaching batches, proven track record of top rankers, experienced faculty, comprehensive test series and scholarship entrance exams. Repeated exposure during everyday commutes helps establish academic authority, inspire student ambition and keep {clientName} the premier coaching choice.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach graduates, students and professionals aspiring for global opportunities. Through strategically placed displays inside private buses, the consultancy can increase awareness of its overseas university admissions, study visa guidance, job placement pathways in UK, Canada, Europe, Australia, and certified IELTS/OET coaching. Repeated exposure during everyday commutes helps validate agency trust, capture prospective candidates and keep {clientName} leading overseas education in Kollam.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach shoppers and festive buyers. Through strategically placed displays inside private buses, the jewellery showroom can increase awareness of its hallmark gold ornaments, certified diamond collections, antique bridal designs, monthly gold advance saving schemes and festive exchange offers. Repeated exposure during everyday commutes helps elevate brand prestige, drive showroom footfall and keep {clientName} top-of-mind for weddings and celebrations.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach bridal parties, families and fashion-conscious commuters. Through strategically placed displays inside private buses, the wedding center can increase awareness of its bridal lehengas, designer silk sarees, groom suits, festive family collections and exclusive wedding season discount promotions. Repeated exposure during everyday commutes helps amplify brand desire, attract weekend shoppers and keep {clientName} the celebration destination of choice.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach homeowners, builders and interior design enthusiasts. Through strategically placed displays inside private buses, the furniture showroom can increase awareness of its solid teakwood collections, contemporary living room sofas, ergonomic bedroom sets, custom modular kitchens and festive package discounts. Repeated exposure during everyday commutes helps fuel home furnishing inspiration, accelerate store visits and keep {clientName} synonymous with fine living.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach consumers and tech shoppers. Through strategically placed displays inside private buses, the showroom can increase awareness of its latest smart TVs, energy-efficient inverter ACs, home appliances, smartphones, zero-down-payment EMI schemes and mega exchange festivals. Repeated exposure during everyday commutes helps capture immediate purchase intent, drive showroom walk-ins and keep {clientName} the trusted electronics hub.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach daily household decision-makers and families. Through strategically placed displays inside private buses, the hypermarket can increase awareness of its grocery savings, fresh farm produce, weekly blockbuster discounts, home delivery service and customer loyalty rewards. Repeated exposure during everyday commutes helps build shopping habit, stimulate regular store visits and keep {clientName} the neighborhood's preferred grocery store.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach daily commuters and prospective vehicle buyers. Through strategically placed displays inside private buses, the dealership can increase awareness of its latest car and bike models, seasonal exchange bonuses, hassle-free financing schemes and prompt test drive bookings. Repeated exposure during everyday commutes helps spark vehicle upgrades, boost showroom walk-ins and keep {clientName} driving automotive excitement.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to connect with value-seeking car buyers and vehicle owners. Through strategically placed displays inside private buses, the auto showroom can increase awareness of its certified multi-brand used cars, comprehensive warranty packages, transparent evaluation, instant spot car buying and easy EMI solutions. Repeated exposure during everyday commutes helps establish dealership confidence, accelerate inventory turnover and keep {clientName} the trusted pre-owned car destination.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach vehicle owners traveling across major transport routes. Through strategically placed displays inside private buses, the auto center can increase awareness of its professional ceramic coatings, water wash & deep interior detailing, computerized wheel alignment, tyre replacements and quick periodic maintenance packages. Repeated exposure during everyday commutes helps remind drivers of vital care, generate service bookings and keep {clientName} their go-to automotive garage.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach food lovers, office commuters and families. Through strategically placed displays inside private buses, the restaurant can increase awareness of its authentic culinary specialties, signature delicacies, ambient family dining spaces, party banquet facilities and online delivery options. Repeated exposure during everyday commutes helps tempt commuter appetites, boost table reservations and keep {clientName} Kollam's favorite dining spot.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach business travelers, event organizers and wedding planners. Through strategically placed displays inside private buses, the venue can increase awareness of its luxury accommodation, air-conditioned banquet halls, international culinary buffets, corporate conference packages and scenic celebration lawns. Repeated exposure during everyday commutes helps maximize venue visibility, secure prime bookings and keep {clientName} at the forefront of premier hospitality.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach sweet lovers and evening commuters. Through strategically placed displays inside private buses, the bakery can increase awareness of its fresh celebration cakes, artisanal pastries, traditional Kerala sweets, hot savory snacks and custom gift hampers. Repeated exposure during everyday commutes helps stimulate sweet cravings, drive counter sales and keep {clientName} the celebration baker of choice.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach investors, professionals and prospective home buyers. Through strategically placed displays inside private buses, the developer can increase awareness of its premium villa projects, luxury waterfront apartments, government-approved layouts, modern clubhouse amenities and attractive pre-launch pricing. Repeated exposure during everyday commutes helps inspire real estate investment, generate qualified home-buyer inquiries and keep {clientName} synonymous with landmark living.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach home renovators, architects, contractors and property builders. Through strategically placed displays inside private buses, the showroom can increase awareness of its imported luxury tiles, designer bath fixtures, modular kitchen hardware, exterior cladding materials and competitive trade pricing. Repeated exposure during everyday commutes helps spark renovation ideas, drive showroom traffic and keep {clientName} the primary building material destination.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to motivate health-conscious commuters and working professionals. Through strategically placed displays inside private buses, the fitness center can increase awareness of its international gym equipment, certified personal trainers, functional strength zones, group fitness sessions and special new-year or seasonal membership offers. Repeated exposure during everyday commutes helps prompt healthy habits, drive trial gym passes and keep {clientName} the city's fitness powerhouse.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach beauty-conscious clients and wedding parties. Through strategically placed displays inside private buses, the studio can increase awareness of its professional bridal makeovers, customized skin rejuvenation therapies, luxury hair spa treatments, advanced styling and relaxing massage packages. Repeated exposure during everyday commutes helps build salon prestige, boost appointment bookings and keep {clientName} glowing at the top of local beauty care.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach traders, entrepreneurs and everyday citizens. Through strategically placed displays inside private buses, the financial institution can increase awareness of its quick gold loans, low interest rates, instant fund disbursement, small business financing schemes and secure branch network. Repeated exposure during everyday commutes helps reinforce institutional safety, resolve financial urgency and keep {clientName} the community's trusted monetary partner.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local communities across primary corridors. Through strategically placed displays inside private buses, the business can increase awareness of its professional services, trusted products, customer benefits and regional market presence. Repeated exposure during everyday commutes helps build brand visibility, earn customer trust and keep {clientName} connected with the community.",
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
      "Catgorithm offers digital bus screen advertising across Kollam, providing {clientName} with an effective platform to reach local communities through strategically placed displays inside private buses. Our network builds high-impact brand visibility, recall and daily customer engagement across Kollam's prime transit routes.",
    defaultObjectiveP1:
      "Catgorithm offers a dedicated digital transit advertising platform that enables your business to build commanding, cost-effective brand visibility across prime commuter corridors in Kollam.",
    defaultObjectiveP2:
      "By integrating high-definition commercial screens with verified high-dwell transit routes, we place your marketing message directly before thousands of prospective customers every single day."
  }
};
