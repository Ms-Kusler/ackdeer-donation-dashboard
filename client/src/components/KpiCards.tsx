import { Users, Utensils, Target, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import type { PublicStats } from '@shared/schema';

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
  testId: string;
  gradient: string;
}

function KpiCard({ icon, label, value, badge, testId, gradient }: KpiCardProps) {
  return (
    <Card className="relative p-6 hover-elevate transition-all duration-200 h-[160px] flex flex-col justify-between shadow-lg group">
      {/* Subtle texture */}
      <div 
        className="absolute inset-0 opacity-5 rounded-lg"
        style={{
          backgroundImage: 'linear-gradient(45deg, rgba(34, 80, 149, 0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(34, 80, 149, 0.1) 25%, transparent 25%)',
          backgroundSize: '8px 8px'
        }}
      />
      
      {/* Professional accent border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-t-lg"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 group-hover:scale-105 transition-all duration-200" 
            data-testid={`${testId}-icon`}
          >
            {icon}
          </div>
          <span className="text-sm font-medium text-muted-foreground leading-tight" data-testid={`${testId}-label`}>
            {label}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 mt-auto">
          <div 
            className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 min-w-0 flex-1 text-left tabular-nums" 
            data-testid={`${testId}-value`}
          >
            {value}
          </div>
          {badge && (
            <span 
              className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold border border-accent/30 flex-shrink-0"
              data-testid={`${testId}-badge`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function KpiCards() {
  const { data: stats, isLoading } = useQuery<PublicStats>({
    queryKey: ['/api/public-stats'],
    queryFn: async () => {
      const response = await fetch('/api/public-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <section className="mb-12" data-testid="kpi-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 h-[160px] animate-pulse flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 bg-muted rounded-lg"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
              <div className="h-8 bg-muted rounded w-16 mt-auto"></div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const kpiData = [
    {
      icon: <Utensils className="w-5 h-5" />,
      label: "Meals Funded (est.)",
      value: stats?.mealsProvided ? Number(stats.mealsProvided).toLocaleString() : "0",
      testId: "meals-funded",
      gradient: "bg-gradient-to-br from-orange-400 to-red-500"
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Donors Engaged",
      value: stats?.donorCount ? Number(stats.donorCount).toLocaleString() : "0",
      testId: "donors-engaged",
      gradient: "bg-gradient-to-br from-blue-400 to-purple-500"
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: "Deer Processed (to date)",
      value: stats?.deerProcessed ? Number(stats.deerProcessed).toLocaleString() : "0",
      testId: "deer-processed",
      gradient: "bg-gradient-to-br from-green-400 to-teal-500"
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: "Total Donations",
      value: stats?.totalDonations ? `$${Number(stats.totalDonations).toLocaleString()}` : "$0",
      testId: "total-donations",
      gradient: "bg-gradient-to-br from-yellow-400 to-orange-500"
    }
  ];

  return (
    <section className="mb-12" data-testid="kpi-section">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KpiCard 
            key={index}
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            badge={kpi.badge}
            testId={kpi.testId}
            gradient={kpi.gradient}
          />
        ))}
      </div>
    </section>
  );
}