import { addOutageReport } from '../lib/outages';

async function testOutageReport() {
  try {
    // Test outage in New York City area
    const testOutage = {
      type: 'electricity',
      description: 'Test power outage in Manhattan',
      latitude: 40.7128,
      longitude: -74.0060,
      severity: 'high',
      status: 'active'
    };

    console.log('Adding test outage report...');
    const outageId = await addOutageReport(testOutage);
    console.log('Successfully added outage report with ID:', outageId);
    
    // Add another test outage nearby
    const testOutage2 = {
      type: 'water',
      description: 'Test water pressure issue in Brooklyn',
      latitude: 40.6782,
      longitude: -73.9442,
      severity: 'medium',
      status: 'active'
    };

    console.log('Adding second test outage report...');
    const outageId2 = await addOutageReport(testOutage2);
    console.log('Successfully added second outage report with ID:', outageId2);

  } catch (error) {
    console.error('Error adding test outage:', error);
  }
}

testOutageReport(); 