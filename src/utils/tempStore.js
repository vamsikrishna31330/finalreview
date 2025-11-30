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

    // Sample resources with both video and PDF versions
    this.resources = [
      // Organic Farming Guide - PDF Version
      {
        id: 1,
        title: 'Organic Farming Guide',
        category: 'Guides',
        description: 'Complete guide to organic farming practices - PDF version',
        link: null,
        file_name: 'organic_farming_guide.pdf',
        file_blob: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0Jyb2tlL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA4IDAgUj4+L1Byb2NTZXQgWy9QREYvVGV4dC9JbWFnZUIvSW1hZ2VDL0ltYWdlSV0+Pj4vTWVkaWFCb3hbPDwvTiAzL0xlbmd0aCAxMj4+XS9Db250ZW50cyAzIDAgUj4+ZW5kb2JqCjMgMCBvYmoKPDwvTGVuZ3RoIDQ1Pj4+c3RyZWFtCkJUClNhbXBsZSBQREYgZm9yIE9yZ2FuaWMgRmFybWluZyBHdWlkZQpUaGlzIGlzIGEgc2FtcGxlIFBERiBmaWxlIHRvIGRlbW9uc3RyYXRlIHRoZSBkb3dubG9hZCBmdW5jdGlvbmFsaXR5LgpFTmRzdHJlYW0KZW5kb2JqCg==',
        file_type: 'document',
        created_by: 2,
        author_name: 'Ravi Kumar',
        created_at: '2024-01-15T10:00:00Z'
      },
      // Organic Farming Guide - Video Version
      {
        id: 2,
        title: 'Organic Farming Guide',
        category: 'Guides',
        description: 'Complete guide to organic farming practices - Video tutorial',
        link: 'https://www.youtube.com/watch?v=gO-eYYJogL4',
        file_name: 'organic_farming_guide.mp4',
        file_blob: 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMAoAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFkAAr/4QAYZ2QACqzZX4iIhAAAAwAEAAADAFAiSJHAEAAABhdG50OQ==',
        file_type: 'video',
        created_by: 3,
        author_name: 'Meera Patel',
        created_at: '2024-01-15T11:00:00Z'
      },
      // Crop Insurance Schemes - PDF Version
      {
        id: 3,
        title: 'Crop Insurance Schemes',
        category: 'Finance',
        description: 'Government crop insurance schemes explained - PDF document',
        link: null,
        file_name: 'crop_insurance_schemes.pdf',
        file_blob: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0Jyb2tlL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA4IDAgUj4+L1Byb2NTZXQgWy9QREYvVGV4dC9JbWFnZUIvSW1hZ2VDL0ltYWdlSV0+Pj4vTWVkaWFCb3hbPDwvTiAzL0xlbmd0aCAxMj4+XS9Db250ZW50cyAzIDAgUj4+ZW5kb2JqCjMgMCBvYmoKPDwvTGVuZ3RoIDQ1Pj4+c3RyZWFtCkJUClNhbXBsZSBQREYgZm9yIENyb3AgSW5zdXJhbmNlIFNjaGVtZXMKVGhpcyBpcyBhIHNhbXBsZSBQREYgZmlsZSB0byBkZW1vbnN0cmF0ZSB0aGUgZG93bmxvYWQgZnVuY3Rpb25hbGl0eS4KRU5kc3RyZWFtCmVuZG9iago=',
        file_type: 'document',
        created_by: 2,
        author_name: 'Ravi Kumar',
        created_at: '2024-01-10T14:30:00Z'
      },
      // Crop Insurance Schemes - Video Version
      {
        id: 4,
        title: 'Crop Insurance Schemes',
        category: 'Finance',
        description: 'Government crop insurance schemes explained - Video tutorial',
        link: 'https://www.youtube.com/watch?v=IpNOETFFAFs',
        file_name: 'crop_insurance_schemes.mp4',
        file_blob: 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMAoAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFkAAr/4QAYZ2QACqzZX4iIhAAAAwAEAAADAFAiSJHAEAAABhdG50OQ==',
        file_type: 'video',
        created_by: 3,
        author_name: 'Meera Patel',
        created_at: '2024-01-10T15:30:00Z'
      },
      // Drip Irrigation Manual - PDF Version
      {
        id: 5,
        title: 'Drip Irrigation Manual',
        category: 'Technology',
        description: 'Installation and maintenance guide for drip irrigation - PDF manual',
        link: null,
        file_name: 'drip_irrigation_manual.pdf',
        file_blob: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0Jyb2tlL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA4IDAgUj4+L1Byb2NTZXQgWy9QREYvVGV4dC9JbWFnZUIvSW1hZ2VDL0ltYWdlSV0+Pj4vTWVkaWFCb3hbPDwvTiAzL0xlbmd0aCAxMj4+XS9Db250ZW50cyAzIDAgUj4+ZW5kb2JqCjMgMCBvYmoKPDwvTGVuZ3RoIDQ1Pj4+c3RyZWFtCkJUClNhbXBsZSBQREYgZm9yIERyaXAgSXJyaWdhdGlvbiBNYW51YWwKVGhpcyBpcyBhIHNhbXBsZSBQREYgZmlsZSB0byBkZW1vbnN0cmF0ZSB0aGUgZG93bmxvYWQgZnVuY3Rpb25hbGl0eS4KRU5kc3RyZWFtCmVuZG9iago=',
        file_type: 'document',
        created_by: 2,
        author_name: 'Ravi Kumar',
        created_at: '2024-01-08T09:15:00Z'
      },
      // Drip Irrigation Manual - Video Version
      {
        id: 6,
        title: 'Drip Irrigation Manual',
        category: 'Technology',
        description: 'Installation and maintenance guide for drip irrigation - Video demonstration',
        link: 'https://www.youtube.com/watch?v=lUcp7g6raDs',
        file_name: 'drip_irrigation_manual.mp4',
        file_blob: 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMAoAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFkAAr/4QAYZ2QACqzZX4iIhAAAAwAEAAADAFAiSJHAEAAABhdG50OQ==',
        file_type: 'video',
        created_by: 3,
        author_name: 'Meera Patel',
        created_at: '2024-01-08T10:15:00Z'
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
