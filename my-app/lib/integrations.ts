/**
 * Integration API utilities
 * Handles communication with backend for Composio/Hyperspell integrations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Integration {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url?: string;
  is_active: boolean;
  coming_soon: boolean;
  composio_auth_config_id?: string;
}

export interface UserIntegration {
  id: string;
  user_id: string;
  integration_id: string;
  composio_connected: boolean;
  hyperspell_connected: boolean;
  connected_at: string;
  integration: Integration;
}

/**
 * Get all available integrations (public endpoint)
 */
export async function getIntegrations(): Promise<Integration[]> {
  const response = await fetch(`${API_BASE_URL}/api/integrations`);
  if (!response.ok) throw new Error('Failed to fetch integrations');
  return response.json();
}

/**
 * Get user's connected integrations (requires auth)
 */
export async function getUserIntegrations(token: string): Promise<UserIntegration[]> {
  const response = await fetch(`${API_BASE_URL}/api/user/integrations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  if (!response.ok) throw new Error('Failed to fetch user integrations');
  return response.json();
}

/**
 * Start integration connection - initiates OAuth flow
 */
export async function startIntegrationConnection(
  integrationSlug: string,
  token: string
): Promise<{ success: boolean; auth_url: string; connection_request_id: string; message: string }> {
  const redirectUri = `${window.location.origin}/integrations/callback`;
  
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/${integrationSlug}/connect/start?redirect_uri=${encodeURIComponent(redirectUri)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to start connection');
  }
  
  return data;
}

/**
 * Check connection status (for polling after OAuth)
 */
export async function checkConnectionStatus(
  integrationSlug: string,
  token: string
): Promise<{ status: 'pending' | 'connected' | 'failed'; message: string; connected_account_id?: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/${integrationSlug}/connect/status`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to check connection status');
  }
  
  return response.json();
}

/**
 * Disconnect an integration
 */
export async function disconnectIntegration(
  integrationSlug: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/${integrationSlug}/disconnect`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to disconnect integration');
  }
  
  return response.json();
}

/**
 * Execute an action via Composio (e.g., send email)
 */
export async function executeIntegrationAction(
  integrationSlug: string,
  actionName: string,
  params: Record<string, any>,
  token: string
): Promise<{ success: boolean; result: any }> {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/${integrationSlug}/action?action_name=${actionName}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to execute action');
  }
  
  return response.json();
}

/**
 * Query data via Hyperspell (natural language)
 */
export async function queryIntegrationData(
  integrationSlug: string,
  query: string,
  token: string
): Promise<{ success: boolean; data: any }> {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/${integrationSlug}/query?query=${encodeURIComponent(query)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to query data');
  }
  
  return response.json();
}

/**
 * Helper: Send email via Gmail integration
 */
export async function sendGmailEmail(
  to: string,
  subject: string,
  body: string,
  token: string
) {
  return executeIntegrationAction(
    'gmail',
    'GMAIL_SEND_EMAIL',
    { to, subject, body },
    token
  );
}

/**
 * Helper: Query Gmail data via Hyperspell
 */
export async function queryGmailData(query: string, token: string) {
  return queryIntegrationData('gmail', query, token);
}

