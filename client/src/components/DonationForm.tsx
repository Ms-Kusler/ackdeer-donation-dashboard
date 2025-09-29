import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { insertDonationSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

// Extend the schema for form-specific validation
const donationFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  donorEmail: z.string().email('Please enter a valid email address'),
  amount: z.string().min(1, 'Amount is required').refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  donationType: z.string().min(1, 'Donation type is required'),
  donorPhone: z.string().optional(),
  donorAddress: z.string().optional(),
  publicMessage: z.string().optional(),
  isAnonymous: z.boolean().optional(),
}).transform((data) => ({
  donorName: `${data.firstName} ${data.lastName}`,
  donorEmail: data.donorEmail,
  amount: data.amount,
  donationType: data.donationType,
  donorPhone: data.donorPhone || null,
  donorAddress: data.donorAddress || null,
  publicMessage: data.publicMessage || null,
  isAnonymous: data.isAnonymous || false,
}));

type DonationFormData = z.infer<typeof donationFormSchema>;

export default function DonationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      donorEmail: '',
      amount: '',
      donationType: 'monetary',
      donorPhone: '',
      donorAddress: '',
      publicMessage: '',
      isAnonymous: false,
    }
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/donations', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to record donation');
      }
      return response.json();
    },
    onSuccess: (response, variables) => {
      toast({
        title: "Donation Recorded",
        description: `Thank you ${variables.firstName}! Your donation of $${variables.amount} has been recorded. A thank you email has been sent.`,
      });
      
      // Invalidate queries to refresh the dashboard data
      queryClient.invalidateQueries({ queryKey: ['/api/public-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/monthly-donations'] });
      
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: DonationFormData) => {
    createDonationMutation.mutate(data);
  };

  return (
    <section className="mb-12" data-testid="donation-form-section">
      <Card className="relative p-8 shadow-lg hover-elevate">
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
        
        <div className="relative mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded"></div>
            </div>
            <h2 className="text-2xl font-bold text-foreground" data-testid="form-title">
              Record a Donation
            </h2>
          </div>
          <p className="text-muted-foreground ml-11" data-testid="form-description">
            Internal intake only — no payment processed here
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-first-name" className="min-h-[48px] text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-last-name" className="min-h-[48px] text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="donorEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} data-testid="input-email" className="min-h-[48px] text-base" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USD) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00"
                        {...field} 
                        data-testid="input-amount"
                        className="min-h-[48px] text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="donationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donation Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-donation-type" className="min-h-[48px] text-base">
                          <SelectValue placeholder="Select donation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monetary">Monetary</SelectItem>
                        <SelectItem value="in-kind">In-Kind</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="donorPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-phone" className="min-h-[48px] text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="donorAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-address" className="min-h-[48px] text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="publicMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Optional message to display publicly with this donation..."
                      className="min-h-[100px] text-base"
                      {...field} 
                      data-testid="textarea-public-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-4 space-y-0 py-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-anonymous"
                      className="min-w-[24px] min-h-[24px] mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none flex-1 min-h-[48px] flex flex-col justify-center">
                    <FormLabel className="text-base font-medium cursor-pointer">
                      Make this donation anonymous
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Your name will not be displayed publicly
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full min-h-[48px] text-base font-semibold" 
              disabled={createDonationMutation.isPending}
              data-testid="button-submit"
            >
              {createDonationMutation.isPending ? 'Recording...' : 'Record Donation'}
            </Button>
          </form>
        </Form>
      </Card>
    </section>
  );
}