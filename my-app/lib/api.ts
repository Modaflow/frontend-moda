/**
 * API utility functions for making authenticated requests to the backend
 */

import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get the current session token
 */
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No active session. Please sign in.');
  }
  
  return session.access_token;
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.error || 'API request failed');
  }

  return data;
}

/**
 * Phone verification API calls
 */
export const phoneApi = {
  /**
   * Send verification code to phone number
   */
  async sendCode(phoneNumber: string) {
    return apiRequest<{ success: boolean; message: string }>(
      '/api/phone/send-code',
      {
        method: 'POST',
        body: JSON.stringify({ phone_number: phoneNumber }),
      }
    );
  },

  /**
   * Verify phone number with code
   */
  async verifyCode(code: string) {
    return apiRequest<{ success: boolean; message: string }>(
      '/api/phone/verify',
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      }
    );
  },
};

/**
 * Profile API calls
 */
export const profileApi = {
  /**
   * Get user profile
   */
  async getProfile() {
    return apiRequest('/api/profile', {
      method: 'GET',
    });
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    full_name?: string;
    phone_number?: string;
    avatar_url?: string;
  }) {
    return apiRequest('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Integrations API calls
 */
export const integrationsApi = {
  /**
   * Get all available integrations
   */
  async getIntegrations() {
    // This endpoint is public, no auth needed
    const response = await fetch(`${API_URL}/api/integrations`);
    return response.json();
  },

  /**
   * Get user's connected integrations
   */
  async getUserIntegrations() {
    return apiRequest('/api/user/integrations', {
      method: 'GET',
    });
  },

  /**
   * Connect an integration
   */
  async connectIntegration(integrationId: string) {
    return apiRequest('/api/user/integrations', {
      method: 'POST',
      body: JSON.stringify({ integration_id: integrationId }),
    });
  },

  /**
   * Disconnect an integration
   */
  async disconnectIntegration(integrationId: string) {
    return apiRequest(`/api/user/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  },
};
