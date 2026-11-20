'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { checkoutService } from '@/services/checkoutService';
import { RevalidatedCartItemDto } from '@/types/checkout';
import { useCartStore } from '@/store/useCartStore'; // Adjust path to match your store
import { BillingAddressSection } from './BillingAddressSection';
import { CheckoutDisplayItem, OrderSummarySidebar } from './OrderSummarySidebar';
import { CheckoutFormValues, checkoutSchema } from '@/schemas/checkoutSchema';

interface DiscountValidationResponse {
  percentage: number;
  expDate: string;
  valid: boolean;
}

interface OrderCheckoutProps {
  isAuthenticated?: boolean;
  onValidateDiscount?: (code: string) => Promise<DiscountValidationResponse>;
}

export const OrderCheckout: React.FC<OrderCheckoutProps> = ({
  isAuthenticated = false,
  onValidateDiscount,
}) => {
  const router = useRouter();
  const { items: rawCartItems, clearCart } = useCartStore();

  const [revalidatedMap, setRevalidatedMap] = useState<Record<number, RevalidatedCartItemDto>>({});
  const [isRevalidating, setIsRevalidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | undefined>(undefined);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: '',
      countryRegion: 'Sri Lanka',
      firstName: '',
      lastName: '',
      address: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      phone: '',
      saveForNextTime: false,
      paymentType: 'ONLINE_GATEWAY',
      useDifferentBillingAddress: false,
      billingAddress: {
        firstName: '',
        lastName: '',
        address: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        phone: '',
      },
    },
  });

  const saveForNextTime = watch('saveForNextTime');
  const paymentType = watch('paymentType');
  const useDifferentBilling = watch('useDifferentBillingAddress');

  // Requirement 7: Revalidate cart item IDs against backend on page load
  useEffect(() => {
    const runRevalidation = async () => {
      const cartList = Array.isArray(rawCartItems) ? rawCartItems : [];
      const variantIds = cartList
        .map((item: { variantId?: number; id?: number }) => item.variantId ?? item.id)
        .filter((id): id is number => typeof id === 'number');

      if (variantIds.length === 0) {
        setIsRevalidating(false);
        return;
      }

      setIsRevalidating(true);
      try {
        const freshItems = await checkoutService.revalidateCart(variantIds);
        const map: Record<number, RevalidatedCartItemDto> = {};
        for (const item of freshItems) {
          map[item.variantId] = item;
        }
        setRevalidatedMap(map);
      } catch (err) {
        console.error('Failed to revalidate cart items', err);
        toast.error('Could not verify latest item prices and availability.');
      } finally {
        setIsRevalidating(false);
      }
    };

    runRevalidation();
  }, [rawCartItems]);

  // Merge cart items with revalidated price/stock data
  const displayItems: CheckoutDisplayItem[] = useMemo(() => {
    const cartList = Array.isArray(rawCartItems) ? rawCartItems : [];
    return cartList.map((raw: any) => {
      const variantId = raw.variantId ?? raw.id;
      const fresh = revalidatedMap[variantId];
      const latestPrice = fresh ? fresh.effectivePrice : raw.unitPrice ?? raw.price ?? 0;
      const isAvailable = fresh ? fresh.available && raw.quantity <= fresh.availableQuantity : true;

      return {
        productId: fresh?.productId ?? raw.productId ?? 0,
        variantId,
        title: fresh?.productTitle ?? raw.title ?? 'Jewellery Item',
        variantLabel: fresh?.colorName ?? raw.variantColor ?? raw.colorName ?? '',
        quantity: raw.quantity ?? 1,
        unitPrice: latestPrice,
        imageUrl: fresh?.imageUrl ?? raw.imageUrl,
        available: isAvailable,
        revalidated: fresh,
      };
    });
  }, [rawCartItems, revalidatedMap]);

  const totalItemCount = useMemo(
    () => displayItems.reduce((acc, item) => acc + item.quantity, 0),
    [displayItems]
  );

  const subtotal = useMemo(
    () => displayItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [displayItems]
  );

  // Requirement 4: Rs 299 for 1 item; FREE (Rs 0) for more than 1 item
  const deliveryFee = totalItemCount === 0 ? 0 : totalItemCount === 1 ? 299 : 0;

  const discountAmount = useMemo(() => {
    if (discountPercentage <= 0 || subtotal <= 0) return 0;
    return Number(((subtotal * discountPercentage) / 100).toFixed(2));
  }, [subtotal, discountPercentage]);

  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyDiscount = async () => {
    if (!onValidateDiscount) {
      throw new Error('Discount service not connected');
    }
    setIsApplyingDiscount(true);
    try {
      const res = await onValidateDiscount(discountCodeInput.trim());
      if (!res.valid) {
        setDiscountPercentage(0);
        setAppliedDiscountCode(undefined);
        throw new Error('This discount code is expired or invalid');
      }
      setDiscountPercentage(res.percentage);
      setAppliedDiscountCode(discountCodeInput.trim());
      toast.success(`Discount of ${res.percentage}% applied`);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleSaveCheckboxChange = (checked: boolean) => {
    if (checked && !isAuthenticated) {
      toast.error('Please sign in first to save delivery info for next time.');
      return;
    }
    setValue('saveForNextTime', checked);
  };

  // Requirement 6: Create order with PENDING status and prepare for payment gateway
  const onSubmit = async (values: CheckoutFormValues) => {
    if (displayItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const outOfStockItem = displayItems.find((i) => !i.available);
    if (outOfStockItem) {
      toast.error(`${outOfStockItem.title} is currently out of stock.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderRes = await checkoutService.placeOrder({
        email: values.email || undefined,
        firstName: values.firstName,
        lastName: values.lastName,
        address: values.address,
        addressLine2: values.addressLine2 || undefined,
        city: values.city,
        postalCode: values.postalCode || undefined,
        phone: values.phone,
        saveForNextTime: Boolean(values.saveForNextTime && isAuthenticated),
        paymentType: values.paymentType,
        discountCode: appliedDiscountCode,
        useDifferentBillingAddress: values.useDifferentBillingAddress,
        billingAddress: values.useDifferentBillingAddress ? values.billingAddress : undefined,
        items: displayItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          variantColor: item.variantLabel || 'Standard',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      toast.success(`Order #${orderRes.orderId} created (${orderRes.orderStatus})`);
      clearCart?.();

      // Hook for next step: redirect to your payment gateway initiation route/URL using orderRes.orderId
      router.push(`/checkout/payment?orderId=${orderRes.orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create order';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Column: Checkout Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:col-span-7 px-4 sm:px-10 py-8 space-y-7"
      >
        {/* Contact & Sign In Link (Requirement 1) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Contact</h2>
            {!isAuthenticated && (
              <Link
                href="/account/login?redirect=/checkout"
                className="text-sm underline text-gray-800 hover:text-black"
              >
                Sign in
              </Link>
            )}
          </div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email (optional for guest checkout)"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </section>

        {/* Delivery Form */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Delivery</h2>

          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Country/Region</label>
            <select
              {...register('countryRegion')}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-black"
            >
              <option value="Sri Lanka">Sri Lanka</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                {...register('firstName')}
                placeholder="First name"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
              />
              {errors.firstName && (
                <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <input
                {...register('lastName')}
                placeholder="Last name"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
              />
              {errors.lastName && (
                <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <input
              {...register('address')}
              placeholder="Address"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
            />
            {errors.address && (
              <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('addressLine2')}
              placeholder="Apartment, suite, etc. (optional)"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                {...register('city')}
                placeholder="City"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
              />
              {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <input
                {...register('postalCode')}
                placeholder="Postal code (optional)"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <input
              {...register('phone')}
              placeholder="Phone"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
          </div>

          {/* Save this information for next time (Requirement 2) */}
          <label className="flex items-center gap-2.5 pt-1 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saveForNextTime}
              onChange={(e) => handleSaveCheckboxChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
            />
            <span>Save this information for next time</span>
            {!isAuthenticated && (
              <span className="text-xs text-gray-400">(Sign in required)</span>
            )}
          </label>
        </section>

        {/* Shipping Method (Requirement 4: Rs 299 for 1 item, FREE for >1 item) */}
        <section className="space-y-2.5">
          <h2 className="text-base font-semibold text-gray-900">Shipping method</h2>
          <div className="flex items-center justify-between p-4 border border-gray-900 bg-gray-50/60 rounded-xl text-sm">
            <div>
              <p className="font-medium text-gray-900">Standard Shipping</p>
              <p className="text-xs text-gray-500">
                {totalItemCount <= 1
                  ? 'Rs 299 for 1 item · Free shipping on 2 or more items'
                  : 'Free shipping applied (more than 1 item)'}
              </p>
            </div>
            <span className="font-semibold text-gray-900">
              {deliveryFee === 0 ? 'FREE' : 'Rs 299.00'}
            </span>
          </div>
        </section>

        {/* Payment Method */}
        <section className="space-y-2.5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Payment</h2>
            <p className="text-xs text-gray-500">All transactions are secure and encrypted.</p>
          </div>

          <div className="border border-gray-300 rounded-xl overflow-hidden divide-y divide-gray-200">
            <label
              className={`flex flex-col p-4 cursor-pointer text-sm ${
                paymentType === 'ONLINE_GATEWAY' ? 'bg-gray-50/70' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  value="ONLINE_GATEWAY"
                  {...register('paymentType')}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <span className="font-medium text-gray-900">Online Payment Gateway</span>
              </div>
              {paymentType === 'ONLINE_GATEWAY' && (
                <p className="text-xs text-gray-500 mt-2 pl-7">
                  Order will be created as PENDING and redirected to the payment gateway.
                </p>
              )}
            </label>

            <label
              className={`flex items-center gap-3 p-4 cursor-pointer text-sm ${
                paymentType === 'CASH_ON_DELIVERY' ? 'bg-gray-50/70' : 'bg-white'
              }`}
            >
              <input
                type="radio"
                value="CASH_ON_DELIVERY"
                {...register('paymentType')}
                className="w-4 h-4 accent-black cursor-pointer"
              />
              <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
            </label>
          </div>
        </section>

        {/* Billing Address (Requirement 5) */}
        <BillingAddressSection
          useDifferentBilling={useDifferentBilling}
          onToggleBilling={(val) => setValue('useDifferentBillingAddress', val)}
          register={register}
          errors={errors}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isRevalidating || displayItems.length === 0}
          className="w-full py-3.5 px-6 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Processing...' : isRevalidating ? 'Checking cart...' : 'Pay now'}
        </button>

        <div className="pt-2">
          <Link href="/terms" className="text-xs underline text-gray-600 hover:text-black">
            Terms and policies
          </Link>
        </div>
      </form>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-5">
        <OrderSummarySidebar
          items={displayItems}
          totalItemCount={totalItemCount}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          discountCodeInput={discountCodeInput}
          onDiscountCodeChange={setDiscountCodeInput}
          onApplyDiscount={handleApplyDiscount}
          isApplyingDiscount={isApplyingDiscount}
          discountPercentage={discountPercentage}
          discountAmount={discountAmount}
          finalTotal={finalTotal}
        />
      </div>
    </div>
  );
};