import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RazorpayPaymentProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPayment({
  amount,
  onSuccess,
  onError,
}: RazorpayPaymentProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      setScriptLoaded(false);
    };
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Payment system is still loading. Please try again.",
        duration: 5000,
      });
      return;
    }

    try {
      setLoading(true);

      // Create order
      const orderRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "HyounKunun",
        description: "Listing Fee",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/razorpay", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            console.log("Payment verification response:", verifyData);

            if (verifyData.success) {
              toast({
                title: "Success!",
                description: "Payment completed successfully",
                duration: 5000,
              });
              // Pass the payment ID to onSuccess
              onSuccess(response.razorpay_payment_id);
            } else {
              throw new Error(verifyData.message);
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : "Payment verification failed";
            toast({
              variant: "destructive",
              title: "Verification Failed",
              description: message,
              duration: 5000,
            });
            onError(message);
          }
          setLoading(false);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
          escape: true,
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#F59E0B",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        const message = response.error.description || "Payment failed";
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: message,
          duration: 5000,
        });
        onError(message);
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to initialize payment";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
        duration: 5000,
      });
      onError(message);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || !scriptLoaded}
      className="w-full"
      variant="default"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Pay ₹${amount}`
      )}
    </Button>
  );
} 