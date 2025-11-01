/**
 * Plays API utilities
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PlayTemplate {
  play_name: string;
  variables: string[];
  steps: Array<{
    tool: string;
    params: Record<string, any>;
  }>;
}

export interface Play {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  template: PlayTemplate;
  created_at: string;
  updated_at: string;
}

export interface ExecutionResult {
  success: boolean;
  status: string;
  play_name: string;
  results: Array<any>;
  summary: {
    total_steps: number;
    succeeded: number;
    failed: number;
  };
}

export async function getPlays(token: string): Promise<Play[]> {
  const response = await fetch(`${API_BASE_URL}/plays`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  if (!response.ok) throw new Error('Failed to fetch plays');
  return response.json();
}

export async function createPlay(
  name: string,
  description: string,
  template: PlayTemplate,
  token: string
): Promise<Play> {
  const response = await fetch(`${API_BASE_URL}/plays`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description, template })
  });
  if (!response.ok) throw new Error('Failed to create play');
  return response.json();
}

export async function executePlay(
  playId: string,
  variables: Record<string, any>,
  token: string
): Promise<ExecutionResult> {
  const response = await fetch(`${API_BASE_URL}/plays/${playId}/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ variables })
  });
  if (!response.ok) throw new Error('Failed to execute play');
  return response.json();
}

export async function deletePlay(playId: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/plays/${playId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  if (!response.ok) throw new Error('Failed to delete play');
}

