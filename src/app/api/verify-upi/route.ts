import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for transaction verification request
const TransactionVerificationSchema = z.object({
  transactionId: z.string().min(8).max(50),
  amount: z.number().positive(),
  smsContent: z.string(), // The SMS content to verify
  timestamp: z.string().optional(),
});

// In-memory store for verified transactions (replace with database in production)
const verifiedTransactions = new Set<string>();

function parseICICISMS(smsContent: string) {
  // ICICI SMS Format:
  // Rs.5.00 paid to HYOUNKUN/eshaniqbal9090@okicici via UPI.UPI Ref:123456789012 Bal:Rs.X,XXX.XX
  const iciciRegex = /Rs\.([\d,.]+) paid to .+?Ref:(\d+)/i;
  const match = smsContent.match(iciciRegex);
  
  if (match) {
    return {
      amount: parseFloat(match[1]),
      transactionId: match[2],
      isValid: true
    };
  }
  return { isValid: false };
}

function parseHDFCSMS(smsContent: string) {
  // HDFC SMS Format:
  // Rs.5.00 sent to eshaniqbal9090@okicici successfully. UPI Ref:123456789012 Bal:Rs.X,XXX.XX
  const hdfcRegex = /Rs\.([\d,.]+) sent to .+?Ref:(\d+)/i;
  const match = smsContent.match(hdfcRegex);
  
  if (match) {
    return {
      amount: parseFloat(match[1]),
      transactionId: match[2],
      isValid: true
    };
  }
  return { isValid: false };
}

function parseSBISMS(smsContent: string) {
  // SBI SMS Format:
  // PAID Rs.5.00 to eshaniqbal9090@okicici via UPI-123456789012. Bal:INR X,XXX.XX
  const sbiRegex = /PAID Rs\.([\d,.]+).+?UPI-(\d+)/i;
  const match = smsContent.match(sbiRegex);
  
  if (match) {
    return {
      amount: parseFloat(match[1]),
      transactionId: match[2],
      isValid: true
    };
  }
  return { isValid: false };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = TransactionVerificationSchema.parse(body);
    
    // Check if transaction has already been verified
    if (verifiedTransactions.has(validatedData.transactionId)) {
      return NextResponse.json(
        { success: false, message: "This transaction ID has already been used" },
        { status: 400 }
      );
    }

    // Try parsing SMS content with different bank formats
    const parsers = [parseICICISMS, parseHDFCSMS, parseSBISMS];
    let transactionDetails = { isValid: false };

    for (const parser of parsers) {
      const result = parser(validatedData.smsContent);
      if (result.isValid) {
        transactionDetails = result;
        break;
      }
    }

    if (!transactionDetails.isValid) {
      return NextResponse.json(
        { success: false, message: "Could not verify transaction from SMS content" },
        { status: 400 }
      );
    }

    // Verify the transaction details
    if (
      transactionDetails.transactionId === validatedData.transactionId &&
      Math.abs(transactionDetails.amount - validatedData.amount) < 0.01 // Account for floating point precision
    ) {
      // Store the verified transaction
      verifiedTransactions.add(validatedData.transactionId);
      
      return NextResponse.json({
        success: true,
        message: "Transaction verified successfully",
        verificationId: `VER-${Date.now()}-${validatedData.transactionId}`
      });
    }

    return NextResponse.json(
      { success: false, message: "Transaction details do not match" },
      { status: 400 }
    );

  } catch (error) {
    console.error('Transaction verification error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 }
    );
  }
}

// Utility function to add a new valid transaction (for testing/demo purposes)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { transactionId, amount } = body;

    if (!/^[0-9]{12}$/.test(transactionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid transaction ID format" },
        { status: 400 }
      );
    }

    VALID_TRANSACTIONS.set(transactionId, {
      amount: Number(amount),
      used: false
    });

    return NextResponse.json({
      success: true,
      message: "Test transaction added successfully"
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid request data" },
      { status: 400 }
    );
  }
} 