"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminTransactions() {
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^[0-9]{12}$/.test(transactionId)) {
      toast({
        title: "Invalid Transaction ID",
        description: "Transaction ID must be exactly 12 digits",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/verify-upi', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          amount: Number(amount),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Test transaction added successfully",
        });
        setTransactionId("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add test transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add test transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Add Test Transaction</CardTitle>
          <CardDescription>
            Add valid transaction IDs for testing the payment system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction ID</label>
              <Input
                value={transactionId}
                onChange={(e) => {
                  // Only allow numbers and limit to 12 digits
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                  setTransactionId(value);
                }}
                placeholder="Enter 12-digit transaction ID"
                className="font-mono"
                maxLength={12}
              />
              <p className="text-xs text-muted-foreground">
                Must be exactly 12 digits
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="1"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || transactionId.length !== 12}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Test Transaction'
              )}
            </Button>
          </form>

          <div className="mt-8">
            <h3 className="text-sm font-medium mb-2">Pre-configured Test Transactions:</h3>
            <div className="space-y-2 text-sm font-mono">
              <div>• 123456789012 (₹5)</div>
              <div>• 234567890123 (₹5)</div>
              <div>• 345678901234 (₹5)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 