'use client';

import { CheckoutFormValues } from '@/schemas/checkoutSchema';
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';


interface BillingAddressSectionProps {
  useDifferentBilling: boolean;
  onToggleBilling: (value: boolean) => void;
  register: UseFormRegister<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
}

export const BillingAddressSection: React.FC<BillingAddressSectionProps> = ({
  useDifferentBilling,
  onToggleBilling,
  register,
  errors,
}) => {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900">Billing address</h2>

      <div className="border border-gray-300 rounded-xl overflow-hidden divide-y divide-gray-200">
        {/* Same as shipping address */}
        <label
          className={`flex items-center gap-3 p-4 cursor-pointer text-sm ${
            !useDifferentBilling ? 'bg-gray-50/70' : 'bg-white'
          }`}
        >
          <input
            type="radio"
            checked={!useDifferentBilling}
            onChange={() => onToggleBilling(false)}
            className="w-4 h-4 accent-black cursor-pointer"
          />
          <span className="font-medium text-gray-900">Same as shipping address</span>
        </label>

        {/* Use a different billing address */}
        <label
          className={`flex items-center gap-3 p-4 cursor-pointer text-sm ${
            useDifferentBilling ? 'bg-gray-50/70' : 'bg-white'
          }`}
        >
          <input
            type="radio"
            checked={useDifferentBilling}
            onChange={() => onToggleBilling(true)}
            className="w-4 h-4 accent-black cursor-pointer"
          />
          <span className="font-medium text-gray-900">Use a different billing address</span>
        </label>

        {useDifferentBilling && (
          <div className="p-4 bg-gray-50/50 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  {...register('billingAddress.firstName')}
                  placeholder="First name"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-black"
                />
                {errors.billingAddress?.firstName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.billingAddress.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...register('billingAddress.lastName')}
                  placeholder="Last name"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-black"
                />
                {errors.billingAddress?.lastName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.billingAddress.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <input
                {...register('billingAddress.address')}
                placeholder="Address"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-black"
              />
              {errors.billingAddress?.address && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.billingAddress.address.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register('billingAddress.addressLine2')}
                placeholder="Apartment, suite, etc. (optional)"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  {...register('billingAddress.city')}
                  placeholder="City"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-black"
                />
                {errors.billingAddress?.city && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.billingAddress.city.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...register('billingAddress.postalCode')}
                  placeholder="Postal code (optional)"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <input
                {...register('billingAddress.phone')}
                placeholder="Phone"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-black"
              />
              {errors.billingAddress?.phone && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.billingAddress.phone.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};