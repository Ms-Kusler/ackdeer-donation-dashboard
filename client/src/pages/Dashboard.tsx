import Hero from '@/components/Hero';
import KpiCards from '@/components/KpiCards';
import Charts from '@/components/Charts';
import DonationForm from '@/components/DonationForm';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <Hero />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <KpiCards />
            <Charts />
          </div>
          
          <div className="lg:col-span-1">
            <DonationForm />
          </div>
        </div>
      </div>
    </div>
  );
}