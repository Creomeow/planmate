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
    this.loadData();
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
      // Check if user already exists
      const existingUser = this.users.find(user => user.email === email);
      if (existingUser) {
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

      this.profiles.push(profile);
      await this.saveData();

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<User> {
    try {
      // For demo purposes, we'll accept any password
      // In a real app, you'd hash and verify passwords
      const user = this.users.find(user => user.email === email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
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
      const profileIndex = this.profiles.findIndex(profile => profile.userId === userId);
      if (profileIndex === -1) return false;

      this.profiles[profileIndex] = {
        ...this.profiles[profileIndex],
        bookmarkedEvents,
        updatedAt: new Date().toISOString(),
      };

      await this.saveData();
      return true;
    } catch (error) {
      console.error('Update bookmarked events error:', error);
      return false;
    }
  }

  async getBookmarkedEvents(userId: string): Promise<string[]> {
    try {
      const profile = this.profiles.find(profile => profile.userId === userId);
      return profile?.bookmarkedEvents || [];
    } catch (error) {
      console.error('Get bookmarked events error:', error);
      return [];
    }
  }

  // Demo data for testing
  async createDemoData() {
    if (this.users.length === 0) {
      const demoUser = await this.registerUser('demo@example.com', 'password123');
      console.log('Created demo user:', demoUser);
    }
  }
}

export const authService = new AuthService();
export type { User, UserProfile };
