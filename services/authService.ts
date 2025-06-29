import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  userId: string;
  preferences: {
    categories: string[];
    budget: string;
    location: string;
  };
  bookmarkedEvents: string[];
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  private users: User[] = [];
  private profiles: UserProfile[] = [];

  constructor() {
    this.loadData().then(() => {
      // Create demo data after loading existing data
      this.createDemoData();
      // Ensure all users have profiles
      this.ensureAllUsersHaveProfiles();
      // Debug current state
      this.debugState();
    });
  }

  private async loadData() {
    try {
      const usersData = await AsyncStorage.getItem('users');
      const profilesData = await AsyncStorage.getItem('profiles');
      
      if (usersData) {
        this.users = JSON.parse(usersData);
      }
      if (profilesData) {
        this.profiles = JSON.parse(profilesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private async saveData() {
    try {
      await AsyncStorage.setItem('users', JSON.stringify(this.users));
      await AsyncStorage.setItem('profiles', JSON.stringify(this.profiles));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  async registerUser(email: string, password: string): Promise<User> {
    try {
      console.log('AuthService: Registering user with email:', email);
      
      // Check if user already exists
      const existingUser = this.users.find(user => user.email === email);
      if (existingUser) {
        console.log('AuthService: User already exists:', email);
        throw new Error('User already exists');
      }

      const user: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0], // Use email prefix as name
        password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('AuthService: Created user:', user);
      this.users.push(user);
      await this.saveData();

      // Create user profile
      const profile: UserProfile = {
        userId: user.id,
        preferences: {
          categories: [],
          budget: 'Medium',
          location: '',
        },
        bookmarkedEvents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('AuthService: Created profile for user:', profile);
      this.profiles.push(profile);
      await this.saveData();

      console.log('AuthService: Registration completed successfully');
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<User> {
    try {
      console.log('AuthService: Login attempt for email:', email);
      
      // For demo purposes, we'll accept any password
      // In a real app, you'd hash and verify passwords
      const user = this.users.find(user => user.email === email);
      if (!user) {
        console.log('AuthService: User not found for email:', email);
        throw new Error('Invalid email or password');
      }
      
      console.log('AuthService: User found:', user);
      
      // Ensure user has a profile, create one if it doesn't exist
      const existingProfile = this.profiles.find(profile => profile.userId === user.id);
      if (!existingProfile) {
        console.log('AuthService: No profile found for user, creating one:', user.id);
        
        const profile: UserProfile = {
          userId: user.id,
          preferences: {
            categories: [],
            budget: 'Medium',
            location: '',
          },
          bookmarkedEvents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        this.profiles.push(profile);
        await this.saveData();
        console.log('AuthService: Created profile for existing user:', profile);
      } else {
        console.log('AuthService: Profile already exists for user:', user.id);
      }
      
      console.log('AuthService: Login successful for user:', user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      return this.users.find(user => user.id === userId) || null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const userIndex = this.users.findIndex(user => user.id === userId);
      if (userIndex === -1) return false;

      this.users[userIndex] = {
        ...this.users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.saveData();
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      return this.profiles.find(profile => profile.userId === userId) || null;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const profileIndex = this.profiles.findIndex(profile => profile.userId === userId);
      if (profileIndex === -1) return false;

      this.profiles[profileIndex] = {
        ...this.profiles[profileIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.saveData();
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }

  async updateBookmarkedEvents(userId: string, bookmarkedEvents: string[]): Promise<boolean> {
    try {
      console.log('AuthService: Updating bookmarked events for user:', userId);
      console.log('AuthService: New bookmarked events:', bookmarkedEvents);
      
      const profileIndex = this.profiles.findIndex(profile => profile.userId === userId);
      console.log('AuthService: Profile index found:', profileIndex);
      
      if (profileIndex === -1) {
        console.log('AuthService: No profile found for user:', userId);
        return false;
      }

      this.profiles[profileIndex] = {
        ...this.profiles[profileIndex],
        bookmarkedEvents,
        updatedAt: new Date().toISOString(),
      };

      await this.saveData();
      console.log('AuthService: Bookmarked events updated successfully');
      return true;
    } catch (error) {
      console.error('Update bookmarked events error:', error);
      return false;
    }
  }

  async getBookmarkedEvents(userId: string): Promise<string[]> {
    try {
      console.log('AuthService: Getting bookmarked events for user:', userId);
      const profile = this.profiles.find(profile => profile.userId === userId);
      const bookmarkedEvents = profile?.bookmarkedEvents || [];
      console.log('AuthService: Found bookmarked events:', bookmarkedEvents);
      return bookmarkedEvents;
    } catch (error) {
      console.error('Get bookmarked events error:', error);
      return [];
    }
  }

  // Demo data for testing
  async createDemoData() {
    console.log('AuthService: Creating demo data');
    console.log('AuthService: Current users count:', this.users.length);
    
    if (this.users.length === 0) {
      console.log('AuthService: No users found, creating demo user');
      const demoUser = await this.registerUser('demo@example.com', 'password123');
      console.log('AuthService: Created demo user:', demoUser);
    } else {
      console.log('AuthService: Users already exist, skipping demo creation');
    }
  }

  async ensureAllUsersHaveProfiles() {
    console.log('AuthService: Ensuring all users have profiles');
    console.log('AuthService: Current users count:', this.users.length);
    console.log('AuthService: Current profiles count:', this.profiles.length);
    
    let profilesCreated = 0;
    
    for (const user of this.users) {
      const existingProfile = this.profiles.find(profile => profile.userId === user.id);
      if (!existingProfile) {
        console.log('AuthService: Creating missing profile for user:', user.id);
        
        const profile: UserProfile = {
          userId: user.id,
          preferences: {
            categories: [],
            budget: 'Medium',
            location: '',
          },
          bookmarkedEvents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        this.profiles.push(profile);
        profilesCreated++;
      }
    }
    
    if (profilesCreated > 0) {
      console.log('AuthService: Created', profilesCreated, 'missing profiles');
      await this.saveData();
    } else {
      console.log('AuthService: All users already have profiles');
    }
  }

  // Debug method to show current state
  async debugState() {
    console.log('=== AUTH SERVICE DEBUG STATE ===');
    console.log('Users:', this.users.map(u => ({ id: u.id, email: u.email })));
    console.log('Profiles:', this.profiles.map(p => ({ userId: p.userId, bookmarkedEvents: p.bookmarkedEvents })));
    console.log('=== END DEBUG STATE ===');
  }
}

export const authService = new AuthService();
export type { User, UserProfile };
