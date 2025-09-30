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
  if (error) return <div className="text-red-600">Couldn’t load stats.</div>;

  const totalAmount = (data?.totalAmount ?? 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-lg border p-4">
        <div className="text-sm text-gray-500">Total Amount</div>
        <div className="mt-1 text-2xl font-semibold">{totalAmount}</div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm text-gray-500">Total Donations</div>
        <div className="mt-1 text-2xl font-semibold">
          {data?.totalDonations ?? 0}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm text-gray-500">Donors Engaged</div>
        <div className="mt-1 text-2xl font-semibold">
          {data?.donorsEngaged ?? 0}
        </div>
      </div>
    </div>
  );
}
