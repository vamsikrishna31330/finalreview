const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  async request(endpoint, options = {}) {
    try {
      console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Response data:`, data);
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async query(sql, params = []) {
    const result = await this.request('/query', {
      method: 'POST',
      body: JSON.stringify({ sql, params }),
    });
    return result.data;
  }

  async run(sql, params = []) {
    const result = await this.request('/run', {
      method: 'POST',
      body: JSON.stringify({ sql, params }),
    });
    return {
      lastInsertId: result.lastInsertId,
      changes: result.changes,
    };
  }

  async execute(sql, params = []) {
    const result = await this.request('/execute', {
      method: 'POST',
      body: JSON.stringify({ sql, params }),
    });
    return result.data;
  }

  async testConnection() {
    const result = await this.request('/test');
    return result.message;
  }
}

export const api = new ApiClient();
