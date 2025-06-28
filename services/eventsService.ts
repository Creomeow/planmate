// Peatix web scraping service for Singapore events
export async function fetchEventbriteEvents({
  location = 'Singapore',
  categories = '',
  page = 1,
  pageSize = 20,
} = {}) {
  try {
    console.log('Fetching events from Peatix for Singapore...');
    
    // Simulate fetching events from Peatix
    // In a real implementation, this would use a web scraping library
    const mockPeatixEvents = [
      {
        id: '1',
        title: 'Tech Conference 2024',
        date: '2024-07-15',
        time: '09:00',
        location: 'Marina Bay Sands, Singapore',
        description: 'Join us for the biggest tech conference in Singapore featuring industry leaders and innovative startups.',
        category: 'Technology',
        budget: 'High',
        image: 'https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Tech+Conference',
        latitude: 1.2838,
        longitude: 103.8591,
        color: '#007AFF',
      },
      {
        id: '2',
        title: 'Food & Wine Festival',
        date: '2024-07-20',
        time: '18:00',
        location: 'Gardens by the Bay, Singapore',
        description: 'Experience the finest cuisines and wines from around the world in this spectacular festival.',
        category: 'Food & Drink',
        budget: 'Medium',
        image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Food+Festival',
        latitude: 1.2819,
        longitude: 103.8636,
        color: '#FF6B35',
      },
      {
        id: '3',
        title: 'Startup Networking Night',
        date: '2024-07-25',
        time: '19:00',
        location: 'WeWork, Raffles Place, Singapore',
        description: 'Connect with fellow entrepreneurs and investors in Singapore\'s vibrant startup ecosystem.',
        category: 'Business',
        budget: 'Low',
        image: 'https://via.placeholder.com/300x200/34C759/FFFFFF?text=Startup+Networking',
        latitude: 1.2841,
        longitude: 103.8515,
        color: '#34C759',
      },
      {
        id: '4',
        title: 'Jazz in the Park',
        date: '2024-07-30',
        time: '20:00',
        location: 'Botanic Gardens, Singapore',
        description: 'Enjoy an evening of smooth jazz music under the stars in Singapore\'s beautiful Botanic Gardens.',
        category: 'Music',
        budget: 'Medium',
        image: 'https://via.placeholder.com/300x200/AF52DE/FFFFFF?text=Jazz+Night',
        latitude: 1.3151,
        longitude: 103.8162,
        color: '#AF52DE',
      },
      {
        id: '5',
        title: 'Art Exhibition Opening',
        date: '2024-08-05',
        time: '18:30',
        location: 'National Gallery Singapore',
        description: 'Be among the first to view this groundbreaking contemporary art exhibition featuring local and international artists.',
        category: 'Arts',
        budget: 'Medium',
        image: 'https://via.placeholder.com/300x200/FF9500/FFFFFF?text=Art+Exhibition',
        latitude: 1.2905,
        longitude: 103.8520,
        color: '#FF9500',
      },
      {
        id: '6',
        title: 'Fitness Bootcamp',
        date: '2024-08-10',
        time: '07:00',
        location: 'East Coast Park, Singapore',
        description: 'Start your day with an intense fitness bootcamp by the beach. All fitness levels welcome!',
        category: 'Sports',
        budget: 'Low',
        image: 'https://via.placeholder.com/300x200/FF3B30/FFFFFF?text=Fitness+Bootcamp',
        latitude: 1.3028,
        longitude: 103.9123,
        color: '#FF3B30',
      },
      {
        id: '7',
        title: 'Coding Workshop',
        date: '2024-08-15',
        time: '14:00',
        location: 'General Assembly, Singapore',
        description: 'Learn the fundamentals of web development in this hands-on coding workshop for beginners.',
        category: 'Education',
        budget: 'Medium',
        image: 'https://via.placeholder.com/300x200/5856D6/FFFFFF?text=Coding+Workshop',
        latitude: 1.2841,
        longitude: 103.8515,
        color: '#5856D6',
      },
      {
        id: '8',
        title: 'Craft Beer Tasting',
        date: '2024-08-20',
        time: '19:30',
        location: 'Brewerkz, Clarke Quay, Singapore',
        description: 'Sample the finest craft beers from Singapore and around the world in this exclusive tasting event.',
        category: 'Food & Drink',
        budget: 'Medium',
        image: 'https://via.placeholder.com/300x200/8E8E93/FFFFFF?text=Beer+Tasting',
        latitude: 1.2905,
        longitude: 103.8460,
        color: '#8E8E93',
      },
    ];

    // Filter events based on search criteria
    let filteredEvents = mockPeatixEvents;
    
    if (categories) {
      filteredEvents = filteredEvents.filter(event => 
        event.category.toLowerCase().includes(categories.toLowerCase())
      );
    }

    // Simulate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    console.log(`Found ${paginatedEvents.length} events from Peatix`);
    
    return paginatedEvents;
    
  } catch (error) {
    console.error('Error fetching events from Peatix:', error);
    throw new Error('Failed to fetch events from Peatix: ' + (error instanceof Error ? error.message : String(error)));
  }
} 