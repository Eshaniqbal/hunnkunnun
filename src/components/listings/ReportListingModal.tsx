"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Flag } from "lucide-react";

const reportReasons = [
  "Inappropriate content",
  "Fake listing",
  "Incorrect price",
  "Item already sold",
  "Spam",
  "Duplicate listing",
  "Wrong category",
  "Prohibited item",
  "Fraudulent seller",
  "Other",
] as const;

type ReportReason = (typeof reportReasons)[number];

interface ReportListingModalProps {
  listingId: string;
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: ReportReason, description: string) => Promise<void>;
}

export function ReportListingModal({
  listingId,
  isOpen,
  onClose,
  onReport,
}: ReportListingModalProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onReport(reason as ReportReason, description);
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our marketplace safe.",
      });
      handleClose();
    } catch (error) {
      toast({
        title: "Error submitting report",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Report Listing
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe marketplace by reporting inappropriate or suspicious listings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for reporting</label>
            <Select value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional details (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional information that will help us understand the issue."
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 