// client/src/components/KpiCards.tsx
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

type PublicStats = {
  totalAmount: number;
  totalDonations: number;
  donorsEngaged: number;
};

export default function KpiCards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/public-stats'],
    queryFn: async () => {
      const res = await fetch('/api/public-stats', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch public stats');
      const json = await res.json();
      return (json?.data ?? {}) as PublicStats;
    },
    staleTime: 0,
  });

  if (isLoading) return <div>Loading stats…</div>;
