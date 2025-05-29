"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RazorpayPayment } from "./RazorpayPayment";

interface PaymentInfoCardProps {
  freeListingsUsed: number;
  freeListingsTotal: number;
  paidListingsCount: number;
  isPaid?: boolean;
  onPaymentComplete: (paymentId: string) => void;
}

export function PaymentInfoCard({
  freeListingsUsed,
  freeListingsTotal,
  paidListingsCount,
  isPaid = false,
  onPaymentComplete,
}: PaymentInfoCardProps) {
  const freeListingsRemaining = Math.max(0, freeListingsTotal - freeListingsUsed);
  const needsPayment = freeListingsRemaining === 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="h-4 w-4" />
          Payment Information
        </CardTitle>
        <CardDescription>
          {needsPayment
            ? "You need to pay 5 rupees to create this listing"
            : `You have ${freeListingsRemaining} free listings remaining`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Free Listings Used:</span>
            <span className="font-medium">{freeListingsUsed} of {freeListingsTotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Free Listings Remaining:</span>
            <span className="font-medium">{freeListingsRemaining}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid Listings Created:</span>
            <span className="font-medium">{paidListingsCount}</span>
          </div>
        </div>

        {needsPayment && !isPaid && (
          <RazorpayPayment 
            amount={5}
            onSuccess={(paymentId) => {
              console.log("Payment successful with ID:", paymentId);
              onPaymentComplete(paymentId);
            }}
            onError={(error) => {
              console.error("Payment failed:", error);
            }}
          />
        )}

        {isPaid && (
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <CheckCircle className="h-4 w-4" />
            <span>Payment completed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 