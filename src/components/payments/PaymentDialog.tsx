"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createPaymentOrder, verifyPayment } from "@/actions/payments";
import { initializeRazorpayPayment } from "@/lib/razorpay";
import { useAuth } from "@/hooks/useAuth";

interface PaymentDialogProps {
  onPaymentComplete: (paymentId: string) => void;
  onClose: () => void;
  open: boolean;
}

export function PaymentDialog({ onPaymentComplete, onClose, open }: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const LISTING_FEE = 5;

  const handlePayment = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create order
      const orderResponse = await createPaymentOrder(LISTING_FEE);
      if (!orderResponse.success || !orderResponse.order) {
        throw new Error("Failed to create payment order");
      }

      // Initialize Razorpay payment
      const paymentResponse = await initializeRazorpayPayment({
        amount: LISTING_FEE,
        orderId: orderResponse.order.id,
        userEmail: currentUser.email || undefined,
        userName: currentUser.name || undefined,
        description: "Listing Fee Payment",
      });

      // Verify payment
      const verificationResponse = await verifyPayment({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      if (!verificationResponse.success) {
        throw new Error("Payment verification failed");
      }

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });

      onPaymentComplete(paymentResponse.razorpay_payment_id);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Pay ₹{LISTING_FEE} to publish your listing
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Amount to pay: ₹{LISTING_FEE}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  You will be redirected to Razorpay's secure payment gateway to complete your payment.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IndianRupee className="mr-2 h-4 w-4" />
                    Pay ₹{LISTING_FEE}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 