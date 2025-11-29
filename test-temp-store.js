// Test script to verify temporary store functionality
import { tempStore } from './src/utils/tempStore.js';

console.log('Testing temporary store...');

// Test creating data
const testResource = {
  title: 'Test Resource',
  category: 'Test',
  description: 'Test Description',
  created_by: 1
};

const created = tempStore.createResource(testResource);
console.log('Created:', created);

// Test updating data
const updated = tempStore.updateResource(created.id, { title: 'Updated Resource' });
console.log('Updated:', updated);

// Test getting all data
const all = tempStore.getAll('resources');
console.log('All resources:', all);

// Test deleting data
const deleted = tempStore.deleteResource(created.id);
console.log('Deleted:', deleted);

console.log('Final state:', tempStore.getAll('resources'));
console.log('Test completed!');
