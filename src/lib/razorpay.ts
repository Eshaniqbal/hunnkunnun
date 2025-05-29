declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Test credentials for development
const TEST_KEY_ID = "rzp_test_key";

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = async ({
  amount,
  orderId,
  currency = "INR",
  name = "HyounKunun Marketplace",
  description = "Listing Payment",
  userEmail,
  userPhone,
  userName,
}: {
  amount: number;
  orderId: string;
  currency?: string;
  name?: string;
  description?: string;
  userEmail?: string;
  userPhone?: string;
  userName?: string;
}): Promise<PaymentResponse> => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error("Razorpay SDK failed to load");
  }

  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || TEST_KEY_ID;
  if (!key) {
    throw new Error("Razorpay key is not configured");
  }

  return new Promise((resolve, reject) => {
    try {
      const options = {
        key,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        name,
        description,
        order_id: orderId,
        handler: (response: PaymentResponse) => {
          resolve(response);
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: "#0F172A",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        reject(new Error(response.error.description));
      });
      razorpay.open();
    } catch (error) {
      reject(error);
    }
  });
}; 