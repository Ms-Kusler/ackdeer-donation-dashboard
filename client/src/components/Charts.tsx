import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function Charts() {
  const queryClient = useQueryClient();
  
  const { data: monthlyData, isLoading, refetch } = useQuery({
    queryKey: ['/api/monthly-donations'],
    queryFn: async () => {
      const response = await fetch('/api/monthly-donations');
      if (!response.ok) {
        throw new Error('Failed to fetch monthly data');
      }
      const data = await response.json();
      
      // Transform data for chart display
      return data.map((item: { month: string; amount: number }) => ({
        month: new Date(item.month + '-01').toLocaleDateString('en', { month: 'short' }),
        donations: item.amount
      }));
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <section className="mb-12" data-testid="charts-section">
      <Card className="relative p-6 shadow-lg hover-elevate">
        {/* Subtle texture */}
        <div 
          className="absolute inset-0 opacity-5 rounded-lg"
          style={{
            backgroundImage: 'linear-gradient(45deg, rgba(34, 80, 149, 0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(34, 80, 149, 0.1) 25%, transparent 25%)',
            backgroundSize: '10px 10px'
          }}
        />
        
        {/* Professional accent border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-t-lg"></div>
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="chart-title">
                Monthly Donations ($)
              </h2>
              <p className="text-sm text-muted-foreground">Tracking community support</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Badge 
              variant="secondary" 
              className="bg-accent/10 text-accent border border-accent/30" 
              data-testid="chart-badge"
            >
              Updated Today
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="h-80 w-full" data-testid="chart-container">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Donations']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--primary))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="donations" 
                  stroke="url(#naturalGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#166534', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#166534', strokeWidth: 2, fill: '#2563eb' }}
                />
                <defs>
                  <linearGradient id="naturalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#166534" />
                    <stop offset="25%" stopColor="#15803d" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="75%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </section>
  );
}