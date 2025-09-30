// client/src/components/DonationForm.tsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// If you have a Card + toast in your project, keep these.
// If not, you can remove them safely.
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type FormData = {
  firstName: string;
  lastName: string;
  donorEmail: string;
  amount: string; // keep as string for input; convert before POST
  donationType: "monetary" | "in-kind" | "equipment";
  donorPhone: string;
  donorAddress: string;
  publicMessage: string;
  isAnonymous: boolean;
};

export default function DonationForm() {
  const { toast } = useToast?.() ?? { toast: (_: any) => {} }; // no-op if hook not present
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    donorEmail: "",
    amount: "",
    donationType: "monetary",
    donorPhone: "",
    donorAddress: "",
    publicMessage: "",
    isAnonymous: false,
  });

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      // build payload
      const payload = {
        donorName: `${formData.firstName} ${formData.lastName}`.trim(),
        donorEmail: formData.donorEmail,
        amount: Number(formData.amount || 0),
        donationType: formData.donationType,
        donorPhone: formData.donorPhone || null,
        donorAddress: formData.donorAddress || null,
        publicMessage: formData.publicMessage || null,
        isAnonymous: formData.isAnonymous,
      };

      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const j = await res.json();
          detail = j?.error || j?.message || "";
        } catch {
          /* ignore */
        }
        throw new Error(detail || "Failed to record donation");
      }
      return res.json();
    },
    onSuccess: () => {
      // ✅ Immediately refresh dashboards/charts no matter which keys are used elsewhere
      // (we invalidate both naming styles to be safe)
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["public-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/public-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["monthly-donations"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/monthly-donations"] }),
      ]).catch(() => {});

      toast({
        title: "Donation Recorded",
        description: `Thank you ${formData.firstName || "there"}! Your donation of $${formData.amount} has been recorded.`,
      });

      // reset form
      setFormData({
        firstName: "",
        lastName: "",
        donorEmail: "",
        amount: "",
        donationType: "monetary",
        donorPhone: "",
        donorAddress: "",
        publicMessage: "",
        isAnonymous: false,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to record donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
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

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="firstName">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={onChange}
                required
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                data-testid="input-first-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="lastName">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={onChange}
                required
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                data-testid="input-last-name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="donorEmail">
              Email *
            </label>
            <input
              id="donorEmail"
              type="email"
              name="donorEmail"
              value={formData.donorEmail}
              onChange={onChange}
              required
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              data-testid="input-email"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="amount">
                Amount (USD) *
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={formData.amount}
                onChange={onChange}
                required
                placeholder="0.00"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                data-testid="input-amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="donationType">
                Donation Type *
              </label>
              <select
                id="donationType"
                name="donationType"
                value={formData.donationType}
                onChange={onChange}
                required
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="donorPhone">
                Phone (Optional)
              </label>
              <input
                id="donorPhone"
                name="donorPhone"
                value={formData.donorPhone}
                onChange={onChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                data-testid="input-phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="donorAddress">
                Address (Optional)
              </label>
              <input
                id="donorAddress"
                name="donorAddress"
                value={formData.donorAddress}
                onChange={onChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                data-testid="input-address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="publicMessage">
              Public Message (Optional)
            </label>
            <textarea
              id="publicMessage"
              name="publicMessage"
              value={formData.publicMessage}
              onChange={onChange}
              rows={4}
              placeholder="Optional message to display publicly with this donation..."
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              data-testid="textarea-public-message"
            />
          </div>

          <div className="flex items-start space-x-4">
            <input
              id="isAnonymous"
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={onChange}
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
            disabled={mutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-md text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-submit"
          >
            {mutation.isPending ? "Recording..." : "Record Donation"}
          </button>
        </form>
      </Card>
    </section>
  );
}
