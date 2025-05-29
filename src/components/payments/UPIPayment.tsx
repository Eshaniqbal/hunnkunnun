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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, QrCode, Smartphone, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeCanvas } from "qrcode.react";

interface UPIPaymentProps {
  onPaymentComplete: (transactionId: string) => void;
  onClose: () => void;
  open: boolean;
  amount: number;
}

const MERCHANT_UPI = "eshaniqbal9090@okicici";
const MERCHANT_NAME = "HyounKunun Marketplace";

export function UPIPayment({ onPaymentComplete, onClose, open, amount }: UPIPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [smsContent, setSmsContent] = useState("");
  const { toast } = useToast();
  
  const upiLink = `upi://pay?pa=${MERCHANT_UPI}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=Listing Payment`;

  const handleVerifyPayment = async () => {
    if (!transactionId || !smsContent) {
      toast({
        title: "Required Information Missing",
        description: "Please enter both the transaction ID and SMS content.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/verify-upi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          amount,
          smsContent,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        onPaymentComplete(transactionId);
        toast({
          title: "Payment Verified",
          description: "Your payment has been verified successfully.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Could not verify the payment. Please check the details and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Could not verify the payment. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(MERCHANT_UPI);
    toast({
      title: "UPI ID Copied",
      description: "The UPI ID has been copied to your clipboard.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl">Complete Payment</DialogTitle>
          <DialogDescription>
            Pay ₹{amount} to publish your listing
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            <TabsTrigger value="upi">UPI ID</TabsTrigger>
          </TabsList>
          
          <TabsContent value="qr" className="mt-2">
            <Card className="border-0 shadow-none">
              <CardHeader className="px-3 py-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <QrCode className="h-4 w-4" />
                  Scan QR Code
                </CardTitle>
                <CardDescription className="text-sm">
                  Scan this QR code with any UPI app
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-2">
                <div className="bg-white p-3 rounded-lg">
                  <QRCodeCanvas 
                    value={upiLink} 
                    size={180} 
                    level="H"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upi" className="mt-2">
            <Card className="border-0 shadow-none">
              <CardHeader className="px-3 py-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Smartphone className="h-4 w-4" />
                  Pay via UPI ID
                </CardTitle>
                <CardDescription className="text-sm">
                  Use any UPI app to pay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-3">
                <div className="flex items-center space-x-2">
                  <Input value={MERCHANT_UPI} readOnly className="text-sm" />
                  <Button variant="outline" size="icon" onClick={copyUPIId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Alert className="py-2">
                  <AlertDescription className="text-sm">
                    Open your UPI app, select "Pay by UPI ID", and enter the above ID
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-2">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-3 py-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Verify Payment
              </CardTitle>
              <CardDescription className="text-sm">
                Please provide your payment details for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionId" className="text-sm">Transaction Reference ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter UPI reference number"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="text-sm font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  You can find this in your UPI payment confirmation SMS
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smsContent" className="text-sm">Payment SMS Content</Label>
                <Input
                  id="smsContent"
                  placeholder="Paste your UPI payment SMS here"
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Copy and paste the entire SMS you received for this payment
                </p>
              </div>

              <Alert variant="warning" className="py-2">
                <AlertDescription className="text-xs space-y-1">
                  <p>For verification, please:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Make the payment using your UPI app</li>
                    <li>Wait for the confirmation SMS</li>
                    <li>Copy the entire SMS content here</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="px-3 pb-2">
              <Button 
                className="w-full"
                onClick={handleVerifyPayment}
                disabled={isProcessing || !transactionId || !smsContent}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verify Payment
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