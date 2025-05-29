"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, IndianRupee } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError?: (error: any) => void;
}

export function RazorpayPayment({ amount, onSuccess, onError }: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();

  const initializePayment = async () => {
    setIsLoading(true);
    try {
      // Create order
      const orderResponse = await fetch("/api/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // Initialize Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "HyounKunun",
        description: "Listing Payment",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verificationResponse = await fetch("/api/razorpay", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verificationData = await verificationResponse.json();

            if (verificationData.success) {
              toast({
                title: "Payment Successful",
                description: "Your payment has been verified successfully.",
              });
              onSuccess(response.razorpay_payment_id);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            toast({
              title: "Verification Failed",
              description: "Could not verify your payment. Please contact support.",
              variant: "destructive",
            });
            onError?.(error);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#0091FF",
        },
      };

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Could not initialize payment. Please try again.",
        variant: "destructive",
      });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsScriptLoaded(true)}
      />
      <Button
        onClick={initializePayment}
        disabled={isLoading || !isScriptLoaded}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <IndianRupee className="mr-2 h-4 w-4" />
            {amount} Make Payment
          </>
        )}
      </Button>
    </>
  );
} 