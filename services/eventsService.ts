// Backend API events service for Singapore events

// Backend API configuration
const BACKEND_API_BASE = 'http://192.168.18.74:3001/api';

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
  'East Coast Park': { lat: 1.3028, lng: 103.9123 },
  'Suntec Singapore': { lat: 1.2931, lng: 103.8520 },
  'Botanic Gardens': { lat: 1.3151, lng: 103.8162 },
  'Orchard Road': { lat: 1.3048, lng: 103.8318 },
  'Sentosa': { lat: 1.2494, lng: 103.8303 },
  'Chinatown': { lat: 1.2838, lng: 103.8433 },
  'Little India': { lat: 1.3061, lng: 103.8518 },
  'Singapore': { lat: 1.3521, lng: 103.8198 }, // Default
  // Additional venues for the 5 categories
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
  'ArtScience Museum': { lat: 1.2864, lng: 103.8591 },
  'Singapore Art Museum': { lat: 1.2904, lng: 103.8520 },
  'Esplanade Theatres': { lat: 1.2897, lng: 103.8551 },
  'Asian Civilisations Museum': { lat: 1.2871, lng: 103.8518 },
  'Singapore Sports Hub': { lat: 1.3028, lng: 103.8736 },
  'Marina Bay Sands Skypark': { lat: 1.2838, lng: 103.8591 },
  'MacRitchie Reservoir': { lat: 1.3505, lng: 103.8168 },
};

// Fetch events from backend API
async function fetchEventbriteAPIEvents({
  location = 'Singapore',
  categories = '',
  page = 1,
  pageSize = 20,
  all = false,
} = {}) {
  try {
    console.log('Fetching real live events from backend API...');
    
    // Build API URL with parameters
    const params = new URLSearchParams({
      'location': location,
      'page': page.toString(),
      'pageSize': pageSize.toString(),
    });
    
    // Add all parameter if requesting all events
    if (all) {
      params.append('all', 'true');
    }
    
    const url = `${BACKEND_API_BASE}/events?${params}`;
    
    console.log(`Fetching from backend API: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`Backend API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error response: ${errorText}`);
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Backend API response: ${data.events?.length || 0} events found`);
    
    if (!data.success || !data.events || data.events.length === 0) {
      throw new Error('No events found from backend API');
    }
    
    console.log(`Successfully fetched ${data.events.length} real events from backend API`);
    return data.events;
    
  } catch (error) {
    console.error('Error fetching from backend API:', error);
    throw new Error('Failed to fetch real events from backend. Please check your internet connection and try again.');
  }
}

// Helper function to determine category from title
function determineCategory(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('music') || lowerTitle.includes('concert') || lowerTitle.includes('jazz') || lowerTitle.includes('band') || lowerTitle.includes('dance')) {
    return 'Music';
  }
  if (lowerTitle.includes('food') || lowerTitle.includes('dining') || lowerTitle.includes('restaurant') || lowerTitle.includes('festival')) {
    return 'Food';
  }
  if (lowerTitle.includes('tech') || lowerTitle.includes('technology') || lowerTitle.includes('startup') || lowerTitle.includes('coding')) {
    return 'Technology';
  }
  if (lowerTitle.includes('art') || lowerTitle.includes('exhibition') || lowerTitle.includes('gallery') || lowerTitle.includes('museum')) {
    return 'Art';
  }
  if (lowerTitle.includes('business') || lowerTitle.includes('networking') || lowerTitle.includes('conference') || lowerTitle.includes('workshop')) {
    return 'Business';
  }
  if (lowerTitle.includes('yoga') || lowerTitle.includes('fitness') || lowerTitle.includes('health') || lowerTitle.includes('wellness')) {
    return 'Health';
  }
  if (lowerTitle.includes('film') || lowerTitle.includes('movie') || lowerTitle.includes('cinema') || lowerTitle.includes('theatre')) {
    return 'Film';
  }
  if (lowerTitle.includes('charity') || lowerTitle.includes('fundraiser') || lowerTitle.includes('donation')) {
    return 'Charity';
  }
  if (lowerTitle.includes('sport') || lowerTitle.includes('fitness') || lowerTitle.includes('run') || lowerTitle.includes('marathon')) {
    return 'Sports';
  }
  if (lowerTitle.includes('comedy') || lowerTitle.includes('standup')) {
    return 'Comedy';
  }
  if (lowerTitle.includes('education') || lowerTitle.includes('course') || lowerTitle.includes('training')) {
    return 'Education';
  }
  
  return 'Other';
}

// Helper function to get coordinates for location
function getLocationCoordinates(location: string): { lat: number; lng: number } {
  const lowerLocation = location.toLowerCase();
  
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (lowerLocation.includes(key.toLowerCase())) {
      return coords;
    }
  }
  
  return LOCATION_COORDS['Singapore'];
}

export async function fetchEventbriteEvents({
  location = 'Singapore',
  categories = '',
  page = 1,
  pageSize = 20,
  all = false,
} = {}) {
  return await fetchEventbriteAPIEvents({
    location,
    categories,
    page,
    pageSize,
    all,
  });
} 