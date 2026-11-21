import {
  Baby,
  Crown,
  HeartPulse,
  Scan,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
  Zap,
} from 'lucide-react'

/**
 * =====================================================================
 *  EDIT THIS FILE to put the real clinic details on the website.
 *  Everything below is SAMPLE content - replace it with the client's own.
 *  (Name, doctor, phone, address, timings, services, reviews...)
 * =====================================================================
 */
export const clinic = {
  name: 'BrightSmile Dental Care',
  shortName: 'BrightSmile',
  tagline: 'Gentle, modern dentistry for the whole family',
  phone: '+91 98765 43210',
  phoneRaw: '919876543210', // digits only, used for call + WhatsApp links
  email: 'hello@brightsmile.example',
  emergencyNote: 'Dental emergency? Call us any time for urgent help.',

  address: {
    line1: '123, Main Road, Near City Bus Stand',
    city: 'Your City',
    state: 'Your State',
    pincode: '000000',
  },
  // Used for the Google map on the Contact page. Replace with the real clinic address.
  mapQuery: '123 Main Road, Your City',

  hours: [
    { days: 'Monday - Friday', time: '9:30 AM - 1:30 PM, 4:30 PM - 8:30 PM' },
    { days: 'Saturday', time: '9:30 AM - 2:00 PM' },
    { days: 'Sunday', time: 'Emergency appointments only' },
  ],

  stats: [
    { value: '15+', label: 'Years of experience' },
    { value: '12,000+', label: 'Happy patients' },
    { value: '25,000+', label: 'Procedures completed' },
    { value: '4.9/5', label: 'Average patient rating' },
  ],

  doctor: {
    name: 'Dr. Ananya Sharma',
    title: 'Chief Dental Surgeon & Implantologist',
    photo: null, // e.g. '/images/doctor.jpg' after you add the file to frontend/public/images/
    registration: 'Dental Council Reg. No. XXXXX',
    experience: '15+ years',
    languages: ['English', 'Hindi', 'Tamil'],
    about: [
      'Dr. Ananya Sharma founded BrightSmile with one belief: a dental visit should feel calm, clear and comfortable. With over fifteen years of clinical practice she has treated thousands of patients, from nervous first-time children to adults rebuilding their smile.',
      'She combines modern digital diagnostics with a gentle, explain-everything approach, so every patient understands their treatment, the cost and the alternatives before any work begins.',
    ],
    qualifications: [
      { degree: 'BDS', detail: 'Bachelor of Dental Surgery - Government Dental College' },
      { degree: 'MDS', detail: 'Master of Dental Surgery, Prosthodontics & Implantology' },
      { degree: 'Fellowship', detail: 'International Congress of Oral Implantologists (ICOI)' },
      { degree: 'Certificate', detail: 'Advanced Smile Design & Digital Dentistry' },
    ],
    specialisations: [
      'Dental implants',
      'Smile makeover & veneers',
      'Root canal therapy',
      'Full-mouth rehabilitation',
      'Clear aligners',
      'Paediatric dentistry',
    ],
    memberships: ['Indian Dental Association (IDA)', 'Indian Society of Oral Implantologists', 'Indian Prosthodontic Society'],
    achievements: [
      'Best Dental Clinic award, regional healthcare awards',
      'Speaker at national dental implant conferences',
      'Published clinical case studies on immediate-load implants',
    ],
    timeline: [
      { year: '2009', text: 'Completed BDS and began clinical practice' },
      { year: '2013', text: 'Earned MDS in Prosthodontics & Implantology' },
      { year: '2016', text: 'Founded BrightSmile Dental Care' },
      { year: '2020', text: 'Introduced digital X-ray and 3D scanning' },
      { year: '2024', text: 'Crossed 10,000 patients treated' },
    ],
  },

  services: [
    {
      icon: Stethoscope,
      title: 'Check-up & Cleaning',
      short: 'Complete oral examination, digital X-ray and professional scaling and polishing.',
      details: ['Full mouth examination', 'Digital X-rays', 'Scaling & polishing', 'Personal care plan'],
    },
    {
      icon: Sparkles,
      title: 'Teeth Whitening',
      short: 'Safe, in-clinic whitening that lifts stains and brightens your smile in one visit.',
      details: ['Up to 8 shades brighter', 'Gentle on enamel', 'Single 60-minute visit', 'Take-home maintenance kit'],
    },
    {
      icon: HeartPulse,
      title: 'Root Canal Treatment',
      short: 'Painless, single-sitting root canal treatment that saves your natural tooth.',
      details: ['Rotary endodontics', 'Digital apex locator', 'Single-visit options', 'Crown placement'],
    },
    {
      icon: Zap,
      title: 'Dental Implants',
      short: 'Permanent tooth replacement that looks, feels and works like a natural tooth.',
      details: ['Single and multiple implants', 'Full-arch solutions', 'Guided placement', 'Lifetime-care guidance'],
    },
    {
      icon: Smile,
      title: 'Braces & Clear Aligners',
      short: 'Metal, ceramic and invisible aligner options to straighten teeth at any age.',
      details: ['Metal & ceramic braces', 'Invisible aligners', 'Retainers', 'Progress reviews'],
    },
    {
      icon: Crown,
      title: 'Crowns, Bridges & Veneers',
      short: 'Custom-made restorations that repair damaged teeth and transform your smile.',
      details: ['Zirconia & ceramic crowns', 'Fixed bridges', 'Porcelain veneers', 'Shade-matched finish'],
    },
    {
      icon: Baby,
      title: 'Children’s Dentistry',
      short: 'Friendly, fear-free care for kids, from first visits to preventive treatments.',
      details: ['Fluoride & sealants', 'Cavity care', 'Habit counselling', 'Kid-friendly room'],
    },
    {
      icon: ShieldCheck,
      title: 'Gum Care & Surgery',
      short: 'Treatment for bleeding gums, bad breath, wisdom teeth and minor oral surgery.',
      details: ['Deep cleaning', 'Gum disease treatment', 'Wisdom tooth removal', 'Minor oral surgery'],
    },
    {
      icon: Scan,
      title: 'Digital Diagnostics',
      short: 'Low-radiation digital X-rays and 3D scans for accurate, faster treatment planning.',
      details: ['Digital OPG & RVG', '3D scanning', 'Intra-oral camera', 'Treatment simulation'],
    },
  ],

  testimonials: [
    {
      name: 'Rahul M.',
      text: 'I was terrified of root canals, but the whole thing was painless and done in one sitting. The team explained every step.',
    },
    {
      name: 'Priya S.',
      text: 'My implants look completely natural. Dr. Sharma was patient, honest about cost, and the follow-up care was excellent.',
    },
    {
      name: 'Karthik & Meena',
      text: 'We bring our children here. They actually look forward to the visits. The clinic is spotless and the staff are lovely.',
    },
  ],
}

export const mapEmbedUrl = (query) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
export const mapLinkUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
