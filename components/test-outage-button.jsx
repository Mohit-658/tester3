'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addOutageReport } from '@/lib/outages';
import { toast } from 'sonner';

export default function TestOutageButton() {
  const [isLoading, setIsLoading] = useState(false);

  const addTestOutages = async () => {
    setIsLoading(true);
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

      const outageId = await addOutageReport(testOutage);
      toast.success('Added test electricity outage');
      
      // Add another test outage nearby
      const testOutage2 = {
        type: 'water',
        description: 'Test water pressure issue in Brooklyn',
        latitude: 40.6782,
        longitude: -73.9442,
        severity: 'medium',
        status: 'active'
      };

      const outageId2 = await addOutageReport(testOutage2);
      toast.success('Added test water outage');

    } catch (error) {
      console.error('Error adding test outages:', error);
      toast.error('Failed to add test outages');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={addTestOutages}
      disabled={isLoading}
      variant="outline"
      className="mt-4"
    >
      {isLoading ? 'Adding Test Outages...' : 'Add Test Outages'}
    </Button>
  );
} 