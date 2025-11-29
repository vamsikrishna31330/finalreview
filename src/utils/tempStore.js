// Temporary in-memory store for add/edit/delete operations
// This simulates database operations without actually changing the database

class TempStore {
  constructor() {
    this.resources = [];
    this.events = [];
    this.forums = [];
    this.notifications = [];
    this.sectors = [];
    this.users = [];
    this.content = [];
    this.sector_connections = [];
    this.nextId = {
      resources: 1000,
      events: 1000,
      forums: 1000,
      notifications: 1000,
      sectors: 1000,
      users: 1000,
      content: 1000,
      sector_connections: 1000
    };
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // Initialize sample data for demonstration
  initializeSampleData() {
    // Sample sectors
    this.sectors = [
      {
        id: 1,
        name: 'AgroBank',
        type: 'Finance',
        contact: 'contact@agrobank.com',
        region: 'National',
        description: 'Micro-financing and crop insurance services'
      },
      {
        id: 2,
        name: 'Harvest Logistics',
        type: 'Logistics',
        contact: 'support@harvestlogistics.com',
        region: 'North India',
        description: 'Cold chain and transportation partners'
      },
      {
        id: 3,
        name: 'Seed Innovators',
        type: 'Technology',
        contact: 'hello@seedinnovators.com',
        region: 'West India',
        description: 'R&D for climate resilient seeds'
      }
    ];

    // Sample resources
    this.resources = [
      {
        id: 1,
        title: 'Organic Farming Guide',
        category: 'Guides',
        description: 'Complete guide to organic farming practices',
        link: 'https://example.com/organic-guide',
        file_name: null,
        file_blob: null,
        created_by: 2,
        author_name: 'Ravi Kumar',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        title: 'Crop Insurance Schemes',
        category: 'Finance',
        description: 'Government crop insurance schemes explained',
        link: null,
        file_name: 'insurance_schemes.pdf',
        file_blob: null,
        created_by: 2,
        author_name: 'Ravi Kumar',
        created_at: '2024-01-10T14:30:00Z'
      },
      {
        id: 3,
        title: 'Drip Irrigation Manual',
        category: 'Technology',
        description: 'Installation and maintenance guide for drip irrigation',
        link: 'https://example.com/drip-irrigation',
        file_name: null,
        file_blob: null,
        created_by: 3,
        author_name: 'Meera Patel',
        created_at: '2024-01-08T09:15:00Z'
      }
    ];

    // Sample events
    this.events = [
      {
        id: 1,
        name: 'Organic Farming Workshop',
        description: 'Learn organic farming techniques from experts',
        start_date: '2024-02-15T09:00:00Z',
        end_date: '2024-02-15T17:00:00Z',
        location: 'Community Center, Pune',
        sector_id: 1,
        created_by: 2,
        creator_name: 'Ravi Kumar',
        created_at: '2024-01-20T11:00:00Z'
      },
      {
        id: 2,
        name: 'Financial Literacy Camp',
        description: 'Understanding loans and insurance for farmers',
        start_date: '2024-02-20T10:00:00Z',
        end_date: '2024-02-20T16:00:00Z',
        location: 'District Hall, Nashik',
        sector_id: 1,
        created_by: 3,
        creator_name: 'Meera Patel',
        created_at: '2024-01-18T13:30:00Z'
      }
    ];

    // Sample forums
    this.forums = [
      {
        id: 1,
        title: 'Pest Control Discussion',
        description: 'Share experiences with organic pest control methods',
        created_by: 2,
        author_name: 'Ravi Kumar',
        sector: 'Technology',
        created_at: '2024-01-12T08:00:00Z'
      },
      {
        id: 2,
        title: 'Water Conservation Techniques',
        description: 'Discuss efficient water usage in agriculture',
        created_by: 3,
        author_name: 'Meera Patel',
        sector: 'Technology',
        created_at: '2024-01-11T16:45:00Z'
      }
    ];

    // Sample notifications
    this.notifications = [
      {
        id: 1,
        user_id: null,
        title: 'New Government Scheme',
        message: 'PM Kisan Samman Nidhi next installment released',
        level: 'info',
        user_name: 'All users',
        created_at: '2024-01-25T10:30:00Z'
      },
      {
        id: 2,
        user_id: 2,
        title: 'Workshop Reminder',
        message: 'Organic farming workshop tomorrow at 9 AM',
        level: 'reminder',
        user_name: 'Ravi Kumar',
        created_at: '2024-02-14T18:00:00Z'
      }
    ];

    // Sample sector connections
    this.sector_connections = [
      {
        id: 1,
        user_id: 2,
        sector_id: 1,
        status: 'active',
        notes: 'Regular customer for crop insurance',
        user_name: 'Ravi Kumar',
        sector_name: 'AgroBank',
        sector_type: 'Finance',
        created_at: '2024-01-05T12:00:00Z'
      },
      {
        id: 2,
        user_id: 2,
        sector_id: 2,
        status: 'pending',
        notes: 'Interested in cold storage facilities',
        user_name: 'Ravi Kumar',
        sector_name: 'Harvest Logistics',
        sector_type: 'Logistics',
        created_at: '2024-01-22T15:30:00Z'
      }
    ];

    // Update next IDs based on sample data
    this.nextId.resources = Math.max(...this.resources.map(r => r.id)) + 1;
    this.nextId.events = Math.max(...this.events.map(e => e.id)) + 1;
    this.nextId.forums = Math.max(...this.forums.map(f => f.id)) + 1;
    this.nextId.notifications = Math.max(...this.notifications.map(n => n.id)) + 1;
    this.nextId.sectors = Math.max(...this.sectors.map(s => s.id)) + 1;
    this.nextId.sector_connections = Math.max(...this.sector_connections.map(sc => sc.id)) + 1;
  }

  // Initialize with existing data
  initialize(tableName, data) {
    if (data && data.length > 0) {
      this[tableName] = [...data];
      // Update next ID based on existing data
      if (data.length > 0) {
        const maxId = Math.max(...data.map(item => item.id || 0));
        this.nextId[tableName] = maxId + 1;
      }
    }
  }

  // Generic CRUD operations
  create(tableName, item) {
    const newItem = {
      ...item,
      id: this.nextId[tableName]++,
      created_at: new Date().toISOString()
    };
    this[tableName].unshift(newItem); // Add to beginning
    return newItem;
  }

  update(tableName, id, updates) {
    const index = this[tableName].findIndex(item => item.id === id);
    if (index !== -1) {
      this[tableName][index] = {
        ...this[tableName][index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      return this[tableName][index];
    }
    return null;
  }

  delete(tableName, id) {
    const index = this[tableName].findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = this[tableName][index];
      this[tableName].splice(index, 1);
      return deleted;
    }
    return null;
  }

  getAll(tableName) {
    return this[tableName];
  }

  // Resource-specific methods
  createResource(resource) {
    return this.create('resources', resource);
  }

  updateResource(id, updates) {
    return this.update('resources', id, updates);
  }

  deleteResource(id) {
    return this.delete('resources', id);
  }

  // Event-specific methods
  createEvent(event) {
    return this.create('events', event);
  }

  updateEvent(id, updates) {
    return this.update('events', id, updates);
  }

  deleteEvent(id) {
    return this.delete('events', id);
  }

  // Forum-specific methods
  createForum(forum) {
    return this.create('forums', forum);
  }

  updateForum(id, updates) {
    return this.update('forums', id, updates);
  }

  deleteForum(id) {
    return this.delete('forums', id);
  }

  // Notification-specific methods
  createNotification(notification) {
    return this.create('notifications', notification);
  }

  updateNotification(id, updates) {
    return this.update('notifications', id, updates);
  }

  deleteNotification(id) {
    return this.delete('notifications', id);
  }
}

export const tempStore = new TempStore();
