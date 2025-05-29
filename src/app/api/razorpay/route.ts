import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    // Create order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Log the received data
    console.log("Verifying payment:", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    // Check for required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing payment information" },
        { status: 400 }
      );
    }

    // Verify signature
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      console.error("Signature verification failed");
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Verify payment status
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    console.log("Payment status:", payment.status);

    if (payment.status !== "captured") {
      console.error("Payment not captured");
      return NextResponse.json(
        { success: false, message: "Payment not completed" },
        { status: 400 }
      );
    }

    // All verifications passed
    console.log("Payment verified successfully");
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    );
  }
} 