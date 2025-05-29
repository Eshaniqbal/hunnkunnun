"use server";

import Razorpay from "razorpay";
import { createHmac } from "crypto";

// Test credentials for development
const TEST_KEY_ID = "rzp_test_key";
const TEST_KEY_SECRET = "test_secret_key";

// Initialize Razorpay with test credentials if environment variables are not set
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || TEST_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET || TEST_KEY_SECRET,
});

// Verify that Razorpay is properly initialized
if (!razorpay.key_id || !razorpay.key_secret) {
  throw new Error("Razorpay credentials are not properly configured");
}

export async function createPaymentOrder(amount: number) {
  try {
    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return { success: true, order };
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return { 
      success: false, 
      error: error.message || "Failed to create payment order",
      details: process.env.NODE_ENV === "development" ? error : undefined
    };
  }
}

export async function verifyPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new Error("Missing payment verification parameters");
  }

  const text = `${razorpay_order_id}|${razorpay_payment_id}`;
  const signature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || TEST_KEY_SECRET)
    .update(text)
    .digest("hex");

  const isAuthentic = signature === razorpay_signature;

  if (!isAuthentic) {
    throw new Error("Invalid payment signature");
  }

  try {
    // Verify the payment with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== "captured") {
      throw new Error("Payment not captured");
    }

    return {
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100, // Convert from paise to rupees
        status: payment.status,
        orderId: payment.order_id,
        method: payment.method,
        createdAt: payment.created_at,
      },
    };
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return { 
      success: false, 
      error: error.message || "Payment verification failed",
      details: process.env.NODE_ENV === "development" ? error : undefined
    };
  }
} 