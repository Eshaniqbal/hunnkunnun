"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, MessageCircle, Phone } from "lucide-react";

export default function SupportPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "We'll get back to you as soon as possible.",
        variant: "success",
      });
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Support Center</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get help with your HyounKunun account, buying, selling, and more.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Phone Support
            </CardTitle>
            <CardDescription>Available 9 AM - 6 PM IST</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">+91 1234567890</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Support
            </CardTitle>
            <CardDescription>24/7 Response</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">support@hyounkunun.com</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Live Chat
            </CardTitle>
            <CardDescription>Available 24/7</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create a listing?</AccordionTrigger>
              <AccordionContent>
                To create a listing, click on the "Create Listing" button in the navigation bar. Fill in all required details about your item, including title, description, price, and photos. Make sure to select the appropriate category and add relevant tags to help buyers find your item.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it free to sell on HyounKunun?</AccordionTrigger>
              <AccordionContent>
                Yes, it's completely free to create listings and sell items on HyounKunun. We don't charge any commission or listing fees. However, any transaction fees from your chosen payment method may apply.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I contact a seller?</AccordionTrigger>
              <AccordionContent>
                When viewing a listing, you'll find the seller's contact information, including their phone number. You can contact them directly through WhatsApp or phone call. Always make sure to follow our safety guidelines when meeting sellers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What payment methods are supported?</AccordionTrigger>
              <AccordionContent>
                HyounKunun is a platform that connects buyers and sellers. Payment methods are arranged directly between the buyer and seller. We recommend using secure payment methods and following our safety guidelines for transactions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How can I stay safe while trading?</AccordionTrigger>
              <AccordionContent>
                Always meet in a public place, bring someone with you, verify the item before payment, and use secure payment methods. Never share personal financial information, and be wary of deals that seem too good to be true.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>Send us a message and we'll get back to you as soon as possible</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input id="name" required placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" type="email" required placeholder="your@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subject</label>
              <Input id="subject" required placeholder="What is your message about?" />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Message</label>
              <Textarea id="message" required placeholder="How can we help you?" rows={5} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 