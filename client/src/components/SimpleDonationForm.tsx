import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SimpleDonationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    donorEmail: '',
    amount: '',
    donationType: 'monetary',
    donorPhone: '',
    donorAddress: '',
    publicMessage: '',
    isAnonymous: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = {
        donorName: `${formData.firstName} ${formData.lastName}`,
        donorEmail: formData.donorEmail,
        amount: formData.amount,
        donationType: formData.donationType,
        donorPhone: formData.donorPhone || null,
        donorAddress: formData.donorAddress || null,
        publicMessage: formData.publicMessage || null,
        isAnonymous: formData.isAnonymous,
      };

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) throw new Error('Failed to record donation');

      toast({
        title: 'Donation Recorded',
        description: `Thank you ${formData.firstName}! Your donation of $${formData.amount} has been recorded. A thank you email has been sent.`,
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        donorEmail: '',
        amount: '',
        donationType: 'monetary',
        donorPhone: '',
        donorAddress: '',
        publicMessage: '',
        isAnonymous: false,
      });

      // 🔥 Force the stats & charts to refresh immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/public-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/monthly-donations'] }),
        queryClient.refetchQueries({ queryKey: ['/api/public-stats'] }),
        queryClient.refetchQueries({ queryKey: ['/api/monthly-donations'] }),
      ]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to record donation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mb-12" data-testid="donation-form-section">
      <Card className="relative p-8 shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-green-700 to-green-600 rounded-t-lg" />
        <div className="relative mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-100">
              <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-blue-600 rounded" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900" data-testid="form-title">
              Record a Donation
            </h2>
          </div>
          <p className="text-gray-600 ml-11" data-testid="form-description">
            Internal intake only — no payment processed here
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{ fontSize: '16px' }}
                data-testid="input-first-name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{ fontSize: '16px' }}
                data-testid="input-last-name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="donorEmail"
              name="donorEmail"
              value={formData.donorEmail}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              style={{ fontSize: '16px' }}
              data-testid="input-email"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                placeholder="0.00"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{ fontSize: '16px' }}
                data-testid="input-amount"
              />
            </div>

            <div>
              <label htmlFor="donationType" className="block text-sm font-medium text-gray-700 mb-2">
                Donation Type *
              </label>
              <select
                id="donationType"
                name="donationType"
                value={formData.donationType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{ fontSize: '16px' }}
                data-testid="select-donation-type"
              >
                <option value="monetary">Monetary</option>
                <option value="in-kind">In-Kind</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="donorPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                id="donorPhone"
                name="donorPhone"
                value={formData.donorPhone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{ fontSize: '16px' }}
                data-testid="input-phone"
              />
            </div>

            <div>
              <label htmlFor="donorAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Address (Optional)
              </label>
              <input
                type="text"
                id="donorAddress"
                name="donorAddress"
                value={formData.donorAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{ fontSize: '16px' }}
                data-testid="input-address"
              />
            </div>
          </div>

          <div>
            <label htmlFor="publicMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Public Message (Optional)
            </label>
            <textarea
              id="publicMessage"
              name="publicMessage"
              value={formData.publicMessage}
              onChange={handleInputChange}
              rows={4}
              placeholder="Optional message to display publicly with this donation..."
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              style={{ fontSize: '16px' }}
              data-testid="textarea-public-message"
            />
          </div>

          <div className="flex items-start space-x-4">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              className="mt-1 h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              data-testid="checkbox-anonymous"
            />
            <div>
              <label htmlFor="isAnonymous" className="text-base font-medium text-gray-900 cursor-pointer">
                Make this donation anonymous
              </label>
              <p className="text-sm text-gray-600">Your name will not be displayed publicly</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-md text-base transition-colors disabled:opacity-50 disabled:cursor-not-pointing"
            style={{ fontSize: '16px' }}
            data-testid="button-submit"
          >
            {isSubmitting ? 'Recording...' : 'Record Donation'}
          </button>
        </form>
      </Card>
    </section>
  );
      }
