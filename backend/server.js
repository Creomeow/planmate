const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for React Native app
app.use(cors());
app.use(express.json());

// Simple cache for events (cache for 5 minutes)
let eventsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const INITIAL_EVENTS_COUNT = 10; // Load only 10 events initially

// Helper function to clean and normalize text
function cleanText(text) {
  if (!text) return "Not available";
  return text.replace(/\s+/g, ' ').trim();
}

// Standardized event object schema
function createEventObject(data) {
  return {
    id: data.id || crypto.randomBytes(16).toString('hex'),
    title: cleanText(data.title) || "Untitled Event",
    date: cleanText(data.date) || "Date not available",
    time: cleanText(data.time) || "Time not available",
    location: cleanText(data.location) || "Location not available",
    description: "", // Always empty as requested
    category: data.category || "Other",
    budget: data.budget || "Paid",
    image: data.image || `https://picsum.photos/300/200?random=${Math.random()}`,
    latitude: data.latitude || 1.3521,
    longitude: data.longitude || 103.8198,
    color: data.color || "#007AFF",
    link: data.link || "https://www.eventbrite.sg/d/singapore/events/",
    source: "Eventbrite"
  };
}



// Category colors mapping for the 5 specified categories
const CATEGORY_COLORS = {
  'Music': '#AF52DE',
  'Food': '#FF6B35',
  'Tech': '#007AFF',
  'Art': '#FF9500',
  'Outdoor': '#34C759',
};

// Singapore location coordinates
const LOCATION_COORDS = {
  'Marina Bay Sands': { lat: 1.2838, lng: 103.8591 },
  'Clarke Quay': { lat: 1.2897, lng: 103.8501 },
  'National Gallery Singapore': { lat: 1.2904, lng: 103.8520 },
  'Gardens by the Bay': { lat: 1.2816, lng: 103.8636 },
  'WeWork Marina Bay': { lat: 1.2838, lng: 103.8591 },
  'East Coast Park': { lat: 1.3028, lng: 103.9123 },
  'Suntec Singapore': { lat: 1.2931, lng: 103.8520 },
  'Botanic Gardens': { lat: 1.3151, lng: 103.8162 },
  'Orchard Road': { lat: 1.3048, lng: 103.8318 },
  'Sentosa': { lat: 1.2494, lng: 103.8303 },
  'Chinatown': { lat: 1.2838, lng: 103.8433 },
  'Little India': { lat: 1.3061, lng: 103.8518 },
  'Singapore': { lat: 1.3521, lng: 103.8198 }, // Default
  // Additional venues and areas
  'Esplanade': { lat: 1.2897, lng: 103.8551 },
  // Venues for the 5 categories
  'Esplanade Concert Hall': { lat: 1.2897, lng: 103.8551 },
  'Marina Bay Sands Theatre': { lat: 1.2838, lng: 103.8591 },
  'Singapore Indoor Stadium': { lat: 1.3028, lng: 103.8736 },
  'The Substation': { lat: 1.2838, lng: 103.8433 },
  'Timbre+': { lat: 1.2838, lng: 103.8433 },
  'Chinatown Food Street': { lat: 1.2838, lng: 103.8433 },
  'Lau Pa Sat': { lat: 1.2838, lng: 103.8518 },
  'Maxwell Food Centre': { lat: 1.2838, lng: 103.8433 },
  'Tiong Bahru Market': { lat: 1.2838, lng: 103.8303 },
  'Amoy Street Food Centre': { lat: 1.2838, lng: 103.8518 },
  'Singapore Science Centre': { lat: 1.3321, lng: 103.7347 },
  'Block 71': { lat: 1.3048, lng: 103.7876 },
  'JTC LaunchPad': { lat: 1.3048, lng: 103.7876 },
  'National Design Centre': { lat: 1.2838, lng: 103.8518 },
  'TechSpace Singapore': { lat: 1.2838, lng: 103.8518 },
  'Singapore Art Museum': { lat: 1.2904, lng: 103.8520 },
  'Esplanade Theatres': { lat: 1.2897, lng: 103.8551 },
  'Asian Civilisations Museum': { lat: 1.2871, lng: 103.8518 },
  'Singapore Sports Hub': { lat: 1.3028, lng: 103.8736 },
  'Marina Bay Sands Skypark': { lat: 1.2838, lng: 103.8591 },
  'MacRitchie Reservoir': { lat: 1.3505, lng: 103.8168 },
  'ArtScience Museum': { lat: 1.2864, lng: 103.8591 },
  'Singapore Flyer': { lat: 1.2893, lng: 103.8631 },
  'Merlion Park': { lat: 1.2868, lng: 103.8545 },
  'Raffles Place': { lat: 1.2838, lng: 103.8518 },
  'Boat Quay': { lat: 1.2871, lng: 103.8518 },
  'Robertson Quay': { lat: 1.2897, lng: 103.8401 },
  'Holland Village': { lat: 1.3111, lng: 103.7961 },
  'Tiong Bahru': { lat: 1.2838, lng: 103.8303 },
  'Joo Chiat': { lat: 1.3048, lng: 103.8997 },
  'Geylang': { lat: 1.3151, lng: 103.8997 },
  'Kampong Glam': { lat: 1.3028, lng: 103.8591 },
  'Bugis': { lat: 1.3008, lng: 103.8551 },
  'Dhoby Ghaut': { lat: 1.2990, lng: 103.8457 },
  'Somerset': { lat: 1.3008, lng: 103.8384 },
  'Newton': { lat: 1.3111, lng: 103.8384 },
  'Novena': { lat: 1.3204, lng: 103.8384 },
  'Toa Payoh': { lat: 1.3321, lng: 103.8472 },
  'Bishan': { lat: 1.3505, lng: 103.8472 },
  'Ang Mo Kio': { lat: 1.3698, lng: 103.8472 },
  'Yishun': { lat: 1.4295, lng: 103.8350 },
  'Woodlands': { lat: 1.4360, lng: 103.7860 },
  'Jurong East': { lat: 1.3333, lng: 103.7422 },
  'Clementi': { lat: 1.3151, lng: 103.7650 },
  'Kent Ridge': { lat: 1.2931, lng: 103.7847 },
  'Pasir Panjang': { lat: 1.2764, lng: 103.7847 },
  'Labrador Park': { lat: 1.2667, lng: 103.8028 },
  'VivoCity': { lat: 1.2644, lng: 103.8222 },
  'HarbourFront': { lat: 1.2644, lng: 103.8222 },
  'Tanjong Pagar': { lat: 1.2764, lng: 103.8457 },
  'Outram Park': { lat: 1.2816, lng: 103.8394 },
  'Tiong Bahru': { lat: 1.2838, lng: 103.8303 },
  'Redhill': { lat: 1.2893, lng: 103.8168 },
  'Queenstown': { lat: 1.2957, lng: 103.8056 },
  'Commonwealth': { lat: 1.3021, lng: 103.7983 },
  'Buona Vista': { lat: 1.3075, lng: 103.7911 },
  'Dover': { lat: 1.3129, lng: 103.7838 },
  'Clementi': { lat: 1.3151, lng: 103.7650 },
  'Chinese Garden': { lat: 1.3389, lng: 103.7306 },
  'Lakeside': { lat: 1.3443, lng: 103.7208 },
  'Boon Lay': { lat: 1.3389, lng: 103.7064 },
  'Pioneer': { lat: 1.3389, lng: 103.6975 },
  'Joo Koon': { lat: 1.3276, lng: 103.6783 },
  'Gul Circle': { lat: 1.3212, lng: 103.6608 },
  'Tuas Crescent': { lat: 1.3212, lng: 103.6494 },
  'Tuas West Road': { lat: 1.3276, lng: 103.6406 },
  'Tuas Link': { lat: 1.3389, lng: 103.6317 }
};



// Helper function to get coordinates for location
function getLocationCoordinates(location) {
  // Specific venue coordinates for real events
  const VENUE_COORDS = {
    'Asia Square Tower 1': { lat: 1.2841, lng: 103.8515 },
    'Raffles Institution': { lat: 1.3081, lng: 103.8175 },
    'Sands Expo & Convention Centre': { lat: 1.2833, lng: 103.8597 },
    'Suntec Singapore Convention & Exhibition Centre': { lat: 1.2956, lng: 103.8589 },
    'Cross Street Exchange': { lat: 1.2833, lng: 103.8447 },
    'Esplanade Concert Hall': { lat: 1.2897, lng: 103.8559 },
    'Esplanade Concourse': { lat: 1.2897, lng: 103.8559 },
    'DBS Foundation Outdoor Theatre': { lat: 1.2897, lng: 103.8559 },
    'Foochow Building': { lat: 1.2981, lng: 103.8547 },
    'Spectrum by Woo Bar': { lat: 1.2897, lng: 103.8559 },
    'Singapore Expo Hall 5': { lat: 1.3354, lng: 103.9627 },
    'Marina Gardens': { lat: 1.2833, lng: 103.8597 },
    'Labrador Nature Reserve': { lat: 1.2667, lng: 103.8000 },
    'Southern Ridges': { lat: 1.2667, lng: 103.8000 },
    'Chestnut Nature Park': { lat: 1.3667, lng: 103.7833 },
    'Bishan Park': { lat: 1.3500, lng: 103.8500 }
  };

  // First try to match specific venue names
  for (const [venueName, coords] of Object.entries(VENUE_COORDS)) {
    if (location.toLowerCase().includes(venueName.toLowerCase())) {
      console.log(`Found specific venue coordinates for: ${venueName}`);
      return coords;
    }
  }

  // If no specific venue match, try to extract postal code and generate coordinates
  const postalCodeMatch = location.match(/\b(\d{6})\b/);
  if (postalCodeMatch) {
    const postalCode = postalCodeMatch[1];
    console.log(`Extracted postal code: ${postalCode} from location: ${location}`);
    return generateCoordinatesFromPostalCode(postalCode);
  }

  // Fallback to Singapore's default coordinates
  console.log(`No specific venue or postal code found for: ${location}, using default coordinates`);
  return { lat: 1.3521, lng: 103.8198 };
}

// Helper function to generate coordinates from postal code
function generateCoordinatesFromPostalCode(postalCode) {
  // Real Singapore postal code ranges and their approximate coordinates
  const postalCodeRanges = {
    // Central Area (01-08)
    '01': { lat: 1.2838, lng: 103.8518, name: 'Raffles Place' },
    '02': { lat: 1.2838, lng: 103.8518, name: 'Raffles Place' },
    '03': { lat: 1.2838, lng: 103.8518, name: 'Raffles Place' },
    '04': { lat: 1.2838, lng: 103.8518, name: 'Raffles Place' },
    '05': { lat: 1.2838, lng: 103.8518, name: 'Raffles Place' },
    '06': { lat: 1.2838, lng: 103.8518, name: 'Raffles Place' },
    '07': { lat: 1.2838, lng: 103.8518, name: 'Raffles Place' },
    '08': { lat: 1.2838, lng: 103.8518, name: 'Raffles Place' },
    
    // Orchard (09-10)
    '09': { lat: 1.3048, lng: 103.8318, name: 'Orchard' },
    '10': { lat: 1.3048, lng: 103.8318, name: 'Orchard' },
    
    // Novena (11-13)
    '11': { lat: 1.3204, lng: 103.8384, name: 'Novena' },
    '12': { lat: 1.3204, lng: 103.8384, name: 'Novena' },
    '13': { lat: 1.3204, lng: 103.8384, name: 'Novena' },
    
    // Toa Payoh (12-14)
    '14': { lat: 1.3321, lng: 103.8472, name: 'Toa Payoh' },
    
    // Bishan (15-16)
    '15': { lat: 1.3505, lng: 103.8472, name: 'Bishan' },
    '16': { lat: 1.3505, lng: 103.8472, name: 'Bishan' },
    
    // Ang Mo Kio (20-22)
    '20': { lat: 1.3698, lng: 103.8472, name: 'Ang Mo Kio' },
    '21': { lat: 1.3698, lng: 103.8472, name: 'Ang Mo Kio' },
    '22': { lat: 1.3698, lng: 103.8472, name: 'Ang Mo Kio' },
    
    // Yishun (23-27)
    '23': { lat: 1.4295, lng: 103.8350, name: 'Yishun' },
    '24': { lat: 1.4295, lng: 103.8350, name: 'Yishun' },
    '25': { lat: 1.4295, lng: 103.8350, name: 'Yishun' },
    '26': { lat: 1.4295, lng: 103.8350, name: 'Yishun' },
    '27': { lat: 1.4295, lng: 103.8350, name: 'Yishun' },
    
    // Woodlands (28-30)
    '28': { lat: 1.4360, lng: 103.7860, name: 'Woodlands' },
    '29': { lat: 1.4360, lng: 103.7860, name: 'Woodlands' },
    '30': { lat: 1.4360, lng: 103.7860, name: 'Woodlands' },
    
    // Jurong East (31-33)
    '31': { lat: 1.3333, lng: 103.7422, name: 'Jurong East' },
    '32': { lat: 1.3333, lng: 103.7422, name: 'Jurong East' },
    '33': { lat: 1.3333, lng: 103.7422, name: 'Jurong East' },
    
    // Clementi (34-36)
    '34': { lat: 1.3151, lng: 103.7650, name: 'Clementi' },
    '35': { lat: 1.3151, lng: 103.7650, name: 'Clementi' },
    '36': { lat: 1.3151, lng: 103.7650, name: 'Clementi' },
    
    // Kent Ridge (37-39)
    '37': { lat: 1.2931, lng: 103.7847, name: 'Kent Ridge' },
    '38': { lat: 1.2931, lng: 103.7847, name: 'Kent Ridge' },
    '39': { lat: 1.2931, lng: 103.7847, name: 'Kent Ridge' },
    
    // Pasir Panjang (40-42)
    '40': { lat: 1.2764, lng: 103.7847, name: 'Pasir Panjang' },
    '41': { lat: 1.2764, lng: 103.7847, name: 'Pasir Panjang' },
    '42': { lat: 1.2764, lng: 103.7847, name: 'Pasir Panjang' },
    
    // Labrador Park (43-45)
    '43': { lat: 1.2667, lng: 103.8028, name: 'Labrador Park' },
    '44': { lat: 1.2667, lng: 103.8028, name: 'Labrador Park' },
    '45': { lat: 1.2667, lng: 103.8028, name: 'Labrador Park' },
    
    // HarbourFront (46-48)
    '46': { lat: 1.2644, lng: 103.8222, name: 'HarbourFront' },
    '47': { lat: 1.2644, lng: 103.8222, name: 'HarbourFront' },
    '48': { lat: 1.2644, lng: 103.8222, name: 'HarbourFront' },
    
    // Tanjong Pagar (49-51)
    '49': { lat: 1.2764, lng: 103.8457, name: 'Tanjong Pagar' },
    '50': { lat: 1.2764, lng: 103.8457, name: 'Tanjong Pagar' },
    '51': { lat: 1.2764, lng: 103.8457, name: 'Tanjong Pagar' },
    
    // Outram Park (52-54)
    '52': { lat: 1.2816, lng: 103.8394, name: 'Outram Park' },
    '53': { lat: 1.2816, lng: 103.8394, name: 'Outram Park' },
    '54': { lat: 1.2816, lng: 103.8394, name: 'Outram Park' },
    
    // Tiong Bahru (55-57)
    '55': { lat: 1.2838, lng: 103.8303, name: 'Tiong Bahru' },
    '56': { lat: 1.2838, lng: 103.8303, name: 'Tiong Bahru' },
    '57': { lat: 1.2838, lng: 103.8303, name: 'Tiong Bahru' },
    
    // Redhill (58-60)
    '58': { lat: 1.2893, lng: 103.8168, name: 'Redhill' },
    '59': { lat: 1.2893, lng: 103.8168, name: 'Redhill' },
    '60': { lat: 1.2893, lng: 103.8168, name: 'Redhill' },
    
    // Queenstown (61-63)
    '61': { lat: 1.2957, lng: 103.8056, name: 'Queenstown' },
    '62': { lat: 1.2957, lng: 103.8056, name: 'Queenstown' },
    '63': { lat: 1.2957, lng: 103.8056, name: 'Queenstown' },
    
    // Commonwealth (64-66)
    '64': { lat: 1.3021, lng: 103.7983, name: 'Commonwealth' },
    '65': { lat: 1.3021, lng: 103.7983, name: 'Commonwealth' },
    '66': { lat: 1.3021, lng: 103.7983, name: 'Commonwealth' },
    
    // Buona Vista (67-69)
    '67': { lat: 1.3075, lng: 103.7911, name: 'Buona Vista' },
    '68': { lat: 1.3075, lng: 103.7911, name: 'Buona Vista' },
    '69': { lat: 1.3075, lng: 103.7911, name: 'Buona Vista' },
    
    // Dover (70-72)
    '70': { lat: 1.3129, lng: 103.7838, name: 'Dover' },
    '71': { lat: 1.3129, lng: 103.7838, name: 'Dover' },
    '72': { lat: 1.3129, lng: 103.7838, name: 'Dover' },
    
    // Chinese Garden (73-75)
    '73': { lat: 1.3389, lng: 103.7306, name: 'Chinese Garden' },
    '74': { lat: 1.3389, lng: 103.7306, name: 'Chinese Garden' },
    '75': { lat: 1.3389, lng: 103.7306, name: 'Chinese Garden' },
    
    // Lakeside (76-78)
    '76': { lat: 1.3443, lng: 103.7208, name: 'Lakeside' },
    '77': { lat: 1.3443, lng: 103.7208, name: 'Lakeside' },
    '78': { lat: 1.3443, lng: 103.7208, name: 'Lakeside' },
    
    // Boon Lay (79-81)
    '79': { lat: 1.3389, lng: 103.7064, name: 'Boon Lay' },
    '80': { lat: 1.3389, lng: 103.7064, name: 'Boon Lay' },
    '81': { lat: 1.3389, lng: 103.7064, name: 'Boon Lay' },
    
    // Pioneer (82-84)
    '82': { lat: 1.3389, lng: 103.6975, name: 'Pioneer' },
    '83': { lat: 1.3389, lng: 103.6975, name: 'Pioneer' },
    '84': { lat: 1.3389, lng: 103.6975, name: 'Pioneer' },
    
    // Joo Koon (85-87)
    '85': { lat: 1.3276, lng: 103.6783, name: 'Joo Koon' },
    '86': { lat: 1.3276, lng: 103.6783, name: 'Joo Koon' },
    '87': { lat: 1.3276, lng: 103.6783, name: 'Joo Koon' },
    
    // Gul Circle (88-90)
    '88': { lat: 1.3212, lng: 103.6608, name: 'Gul Circle' },
    '89': { lat: 1.3212, lng: 103.6608, name: 'Gul Circle' },
    '90': { lat: 1.3212, lng: 103.6608, name: 'Gul Circle' },
    
    // Tuas Crescent (91-93)
    '91': { lat: 1.3212, lng: 103.6494, name: 'Tuas Crescent' },
    '92': { lat: 1.3212, lng: 103.6494, name: 'Tuas Crescent' },
    '93': { lat: 1.3212, lng: 103.6494, name: 'Tuas Crescent' },
    
    // Tuas West Road (94-96)
    '94': { lat: 1.3276, lng: 103.6406, name: 'Tuas West Road' },
    '95': { lat: 1.3276, lng: 103.6406, name: 'Tuas West Road' },
    '96': { lat: 1.3276, lng: 103.6406, name: 'Tuas West Road' },
    
    // Tuas Link (97-99)
    '97': { lat: 1.3389, lng: 103.6317, name: 'Tuas Link' },
    '98': { lat: 1.3389, lng: 103.6317, name: 'Tuas Link' },
    '99': { lat: 1.3389, lng: 103.6317, name: 'Tuas Link' }
  };
  
  // Extract the first two digits of the postal code
  const prefix = postalCode.substring(0, 2);
  
  if (postalCodeRanges[prefix]) {
    const baseCoords = postalCodeRanges[prefix];
    // Add small random variation within the postal code area
    const latVariation = (parseInt(postalCode) % 100) / 10000;
    const lngVariation = (parseInt(postalCode) % 1000) / 10000;
    
    return {
      lat: baseCoords.lat + (latVariation - 0.5) * 0.01,
      lng: baseCoords.lng + (lngVariation - 0.5) * 0.01
    };
  }
  
  // Fallback to Singapore center if postal code not found
  return { lat: 1.3521, lng: 103.8198 };
}

async function scrapeEventbrite() {
  try {
    console.log('Generating all mock events');
    
    // Generate all mock events from today onwards
    const mockEvents = generateMockEvents();
    
    console.log(`Generated ${mockEvents.length} total mock events`);
    return mockEvents;
    
  } catch (error) {
    console.error('Error in scrapeEventbrite:', error);
    return [];
  }
}

function generateMockEvents() {
  const events = [];
  const today = new Date();
  
  // Real events data based on user's provided events
  const realEvents = [
    // Technology Events
    {
      title: 'AWS User Group Singapore Community Day 2025',
      venue: 'Asia Square Tower 1',
      address: '8 Marina View, Singapore 018960',
      postalCode: '018960',
      category: 'Tech',
      date: '2025-08-02',
      time: '09:00'
    },
    {
      title: 'Astronite \'25: Starstruck',
      venue: 'Raffles Institution',
      address: '1 Raffles Institution Lane, Singapore 575737',
      postalCode: '575737',
      category: 'Tech',
      date: '2025-08-01',
      time: '18:30'
    },
    {
      title: 'Data Centre World Asia 2025',
      venue: 'Sands Expo & Convention Centre',
      address: '10 Bayfront Avenue, Marina Bay Sands, Singapore 018956',
      postalCode: '018956',
      category: 'Tech',
      date: '2025-10-08',
      time: '09:00'
    },
    {
      title: 'ISPE 2025',
      venue: 'Suntec Singapore Convention & Exhibition Centre',
      address: '1 Raffles Boulevard, Singapore 039593',
      postalCode: '039593',
      category: 'Tech',
      date: '2025-08-28',
      time: '08:30'
    },
    {
      title: 'Asia Tech Expo',
      venue: 'Suntec Singapore Convention & Exhibition Centre',
      address: '1 Raffles Boulevard, Singapore 039593',
      postalCode: '039593',
      category: 'Tech',
      date: '2025-09-30',
      time: '09:00'
    },
    {
      title: 'I AM AI‑FA (Robotics / AI themed)',
      venue: 'Cross Street Exchange',
      address: '18 Cross Street, Singapore 048423',
      postalCode: '048423',
      category: 'Tech',
      date: '2025-08-01',
      time: '14:30'
    },
    
    // Music Events
    {
      title: 'Kenny G Live Tour 2025',
      venue: 'Esplanade Concert Hall',
      address: '1 Esplanade Dr, Singapore 038981',
      postalCode: '038981',
      category: 'Music',
      date: '2025-07-08',
      time: '19:30'
    },
    {
      title: 'Wei 3 (Jazz in July)',
      venue: 'Esplanade Concourse',
      address: '1 Esplanade Dr, Singapore 038981',
      postalCode: '038981',
      category: 'Music',
      date: '2025-07-26',
      time: '19:15'
    },
    {
      title: 'Forestet – Korean Jazz New Wave',
      venue: 'Esplanade Concourse',
      address: '1 Esplanade Dr, Singapore 038981',
      postalCode: '038981',
      category: 'Music',
      date: '2025-07-26',
      time: '18:30'
    },
    {
      title: 'Jaejin Ahn Quartet (Jazz in July)',
      venue: 'DBS Foundation Outdoor Theatre',
      address: '1 Esplanade Dr, Singapore 038981',
      postalCode: '038981',
      category: 'Music',
      date: '2025-07-26',
      time: '20:00'
    },
    {
      title: 'Big Band Sunday: Thomson Big Band',
      venue: 'DBS Foundation Outdoor Theatre',
      address: '1 Esplanade Dr, Singapore 038981',
      postalCode: '038981',
      category: 'Music',
      date: '2025-07-27',
      time: '15:30'
    },
    {
      title: 'R \'n R featuring Jens Bunge, Rick Smith & Richard Jackson',
      venue: 'Esplanade Concourse',
      address: '1 Esplanade Dr, Singapore 038981',
      postalCode: '038981',
      category: 'Music',
      date: '2025-07-27',
      time: '19:00'
    },
    {
      title: 'Hollow Coves Live in Singapore',
      venue: 'Foochow Building',
      address: '99 Beach Road, #01–04, Singapore 189700',
      postalCode: '189700',
      category: 'Music',
      date: '2025-08-20',
      time: '20:00'
    },
    {
      title: 'REAL FRIENDS Southeast Asia 2025 – Singapore',
      venue: 'Spectrum by Woo Bar',
      address: '7 Raffles Avenue, Singapore 039799',
      postalCode: '039799',
      category: 'Music',
      date: '2025-08-10',
      time: '19:00'
    },
    
    // Food Events
    {
      title: 'Singapore Food Expo 2025',
      venue: 'Singapore Expo Hall 5',
      address: '1 Expo Drive, Singapore 486150',
      postalCode: '486150',
      category: 'Food',
      date: '2025-06-06',
      time: '11:00'
    },
    
    // Outdoor Events
    {
      title: 'Nature & Sustainability Tour: Energy and Water',
      venue: 'Marina Gardens',
      address: '18 Marina Gardens Dr, Singapore 018953',
      postalCode: '018953',
      category: 'Outdoor',
      date: '2025-08-03',
      time: '08:30'
    },
    {
      title: 'Nature & Sustainability Tour: Carbon and Climate',
      venue: 'Marina Gardens',
      address: '18 Marina Gardens Dr, Singapore 018953',
      postalCode: '018953',
      category: 'Outdoor',
      date: '2025-08-10',
      time: '08:30'
    },
    {
      title: 'Labrador Nature Reserve Heritage Tour',
      venue: 'Labrador Nature Reserve',
      address: '701 Telok Blangah Rd, Singapore 109029',
      postalCode: '109029',
      category: 'Outdoor',
      date: '2025-07-28',
      time: '09:00'
    },
    {
      title: 'Charity Walk: Southern Ridges (NParks)',
      venue: 'Southern Ridges',
      address: '701 Telok Blangah Rd, Singapore 109029',
      postalCode: '109029',
      category: 'Outdoor',
      date: '2025-08-04',
      time: '08:00'
    },
    {
      title: 'Walk with Neighbours @ Chestnut Nature Park',
      venue: 'Chestnut Nature Park',
      address: '201 Chestnut Ave, Singapore 679525',
      postalCode: '679525',
      category: 'Outdoor',
      date: '2025-08-11',
      time: '08:30'
    },
    {
      title: 'Nature & High Tea for Kids @ Bishan Park',
      venue: 'Bishan Park',
      address: '1380 Ang Mo Kio Ave 1, Singapore 569930',
      postalCode: '569930',
      category: 'Outdoor',
      date: '2025-07-27',
      time: '16:00'
    }
  ];
  
  const images = [
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop'
  ];
  
  let eventId = 1;
  
  // Generate exactly the events from the real events list
  for (let i = 0; i < realEvents.length; i++) {
    const baseEvent = realEvents[i];
    const image = images[Math.floor(Math.random() * images.length)];
    
    const location = `${baseEvent.venue}, ${baseEvent.address}`;
    const coords = getLocationCoordinates(baseEvent.venue);
    
    const eventObject = createEventObject({
      id: eventId,
      title: baseEvent.title,
      date: baseEvent.date,
      time: baseEvent.time,
      location: location,
      image: image,
      link: `https://example.com/event/${eventId}`,
      description: `${baseEvent.title} at ${baseEvent.venue}`,
      category: baseEvent.category,
      budget: Math.random() > 0.5 ? 'Paid' : 'Free',
      latitude: coords.lat,
      longitude: coords.lng,
      color: CATEGORY_COLORS[baseEvent.category] || '#007AFF'
    });
      
    console.log(`Generated event: ${baseEvent.title} (${baseEvent.category}) at ${baseEvent.venue} - ${coords.lat}, ${coords.lng}`);
    events.push(eventObject);
    
    eventId++;
  }
  
  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  console.log(`Generated ${events.length} events from real events list`);
  console.log(`Events by category:`, events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {}));
  return events;
}

// API endpoint to get events
app.get('/api/events', async (req, res) => {
  try {
    console.log('Received request for events');
    
    const { location = 'Singapore', page = 1, pageSize = 10, all = false } = req.query;
    const currentPage = parseInt(page);
    const currentPageSize = parseInt(pageSize);
    const fetchAll = all === 'true';
    
    // Check cache
    if (eventsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached events');
      
      // If requesting all events, return all cached events
      if (fetchAll) {
        console.log('Returning all cached events for map view');
        res.json({
          success: true,
          events: eventsCache,
          total: eventsCache.length,
          page: 1,
          pageSize: eventsCache.length,
          totalPages: 1
        });
        return;
      }
      
      // Otherwise apply pagination
      const startIndex = (currentPage - 1) * currentPageSize;
      const endIndex = startIndex + currentPageSize;
      const paginatedEvents = eventsCache.slice(startIndex, endIndex);

      res.json({
        success: true,
        events: paginatedEvents,
        total: eventsCache.length,
        page: currentPage,
        pageSize: currentPageSize,
        totalPages: Math.ceil(eventsCache.length / currentPageSize)
      });
      return;
    }

    // Generate all mock events
    console.log('Starting to generate mock events...');
    const allEvents = await scrapeEventbrite();
    
    console.log(`Generated ${allEvents.length} total events`);
    
    if (!allEvents || allEvents.length === 0) {
      console.log('No events found, returning error response');
      return res.status(404).json({
        success: false,
        error: 'No events found from backend API',
        message: 'No events were found. Please try again later.',
        events: []
      });
    }
    
    // Cache the results
    eventsCache = allEvents;
    cacheTimestamp = Date.now();

    // If requesting all events, return all events
    if (fetchAll) {
      console.log('Returning all events for map view');
      res.json({
        success: true,
        events: allEvents,
        total: allEvents.length,
        page: 1,
        pageSize: allEvents.length,
        totalPages: 1
      });
      return;
    }

    // Otherwise apply pagination to all events
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    const paginatedEvents = allEvents.slice(startIndex, endIndex);
    
    console.log(`Returning ${paginatedEvents.length} events (page ${currentPage} of ${Math.ceil(allEvents.length / currentPageSize)})`);
    
    res.json({
      success: true,
      events: paginatedEvents,
      total: allEvents.length,
      page: currentPage,
      pageSize: currentPageSize,
      totalPages: Math.ceil(allEvents.length / currentPageSize)
    });
    
  } catch (error) {
    console.error('Error in /api/events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate mock events',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'PlanMate Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`PlanMate Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Events API: http://localhost:${PORT}/api/events`);
});