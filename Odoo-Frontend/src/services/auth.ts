interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
  is_verified: boolean;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export class AuthService {
  private baseURL = 'http://127.0.0.1:8000/api/auth';
  private token: string | null;
  private refreshToken: string | null;
  private user: User | null;

  constructor() {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.user = JSON.parse(localStorage.getItem('auth_user') || 'null');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('AuthService: Making request to:', url);
    console.log('AuthService: Request options:', options);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token && !endpoint.includes('login') && !endpoint.includes('register')) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    console.log('AuthService: Request headers:', headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('AuthService: Response received:', response.status, response.statusText);

    if (response.status === 401 && this.refreshToken && !endpoint.includes('refresh')) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.token}`;
        return fetch(url, { ...options, headers });
      }
    }

    return response;
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.access;
        localStorage.setItem('access_token', data.access);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.logout();
    return false;
  }

  async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
    try {
      console.log('AuthService: Attempting login with:', { username: credentials.username });
      console.log('AuthService: Making request to:', `${this.baseURL}/login/`);
      
      const response = await this.makeRequest('/login/', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      console.log('AuthService: Login response status:', response.status);
      console.log('AuthService: Login response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthService: Error response text:', errorText);
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch (e) {
          error = { message: errorText || 'Login failed' };
        }
        
        console.error('AuthService: Login error:', error);
        throw new Error(error.message || error.error || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      console.log('AuthService: Login successful:', data);
      
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      this.user = data.user;
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<{ message: string; user_id: number }> {
    try {
      console.log('AuthService: Attempting registration for:', userData.username);
      const response = await this.makeRequest('/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      console.log('AuthService: Registration response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthService: Registration error response:', errorText);
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch (e) {
          error = { message: errorText || 'Registration failed' };
        }
        
        throw new Error(error.message || error.error || 'Registration failed');
      }

      const result = await response.json();
      console.log('AuthService: Registration successful:', result);
      return result;
    } catch (error) {
      console.error('AuthService: Registration error:', error);
      throw error;
    }
  }

  async sendOTP(username: string): Promise<{ message: string }> {
    try {
      console.log('AuthService: Sending OTP for username:', username);
      const response = await this.makeRequest('/send-otp/', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });

      console.log('AuthService: Send OTP response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthService: Send OTP error response:', errorText);
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch (e) {
          error = { message: errorText || 'Failed to send OTP' };
        }
        
        throw new Error(error.message || error.error || 'Failed to send OTP');
      }

      const result = await response.json();
      console.log('AuthService: OTP sent successfully:', result);
      return result;
    } catch (error) {
      console.error('AuthService: Send OTP error:', error);
      throw error;
    }
  }

  async verifyOTP(username: string, otp: string): Promise<LoginResponse> {
    try {
      console.log('AuthService: Verifying OTP for username:', username);
      const response = await this.makeRequest('/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({ username, otp }),
      });

      console.log('AuthService: Verify OTP response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthService: Verify OTP error response:', errorText);
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch (e) {
          error = { message: errorText || 'OTP verification failed' };
        }
        
        throw new Error(error.message || error.error || 'OTP verification failed');
      }

      const data: LoginResponse = await response.json();
      console.log('AuthService: OTP verification successful:', data);
      
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      this.user = data.user;
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('AuthService: Verify OTP error:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<User> {
    try {
      console.log('AuthService: Fetching user profile');
      const response = await this.makeRequest('/profile/');

      console.log('AuthService: Get profile response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthService: Get profile error response:', errorText);
        throw new Error('Failed to get user profile');
      }

      const userData = await response.json();
      console.log('AuthService: Profile fetched successfully:', userData);
      this.user = userData;
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('AuthService: Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      console.log('AuthService: Updating profile with data:', profileData);
      const response = await this.makeRequest('/profile/update/', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      console.log('AuthService: Update profile response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthService: Update profile error response:', errorText);
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch (e) {
          error = { message: errorText || 'Profile update failed' };
        }
        
        throw new Error(error.message || error.error || 'Profile update failed');
      }

      const data = await response.json();
      console.log('AuthService: Profile updated successfully:', data);
      this.user = data.user;
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      console.error('AuthService: Update profile error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('AuthService: Attempting logout');
      if (this.refreshToken) {
        const response = await this.makeRequest('/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });
        
        if (response.ok) {
          console.log('AuthService: Logout successful');
        } else {
          console.warn('AuthService: Logout API call failed, but continuing with local cleanup');
        }
      }
    } catch (error) {
      console.error('AuthService: Logout API call failed:', error);
    } finally {
      console.log('AuthService: Cleaning up local auth data');
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService();