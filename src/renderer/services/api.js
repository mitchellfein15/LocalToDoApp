const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all todos
  static async getTodos() {
    return this.request('/todos');
  }

  // Get single todo
  static async getTodo(id) {
    return this.request(`/todos/${id}`);
  }

  // Create new todo
  static async createTodo(todo) {
    return this.request('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  }

  // Update todo
  static async updateTodo(id, todo) {
    return this.request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todo),
    });
  }

  // Delete todo
  static async deleteTodo(id) {
    return this.request(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

}

export default ApiService; 