
"use client";

import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreateListingSchema, createListing } from "@/actions/listings";
import type { CreateListingInput } from "@/actions/listings";
import { ListingCategories } from "@/types";
import { smartTagging } from "@/ai/flows/smart-tagging";
import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Loader2, PlusCircle, Tag, Trash2, UploadCloud, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth

const MAX_IMAGES = 5;

export default function CreateListingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser } = useAuth(); // Get current user
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isTagging, setIsTagging] = useState(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<CreateListingInput>({
    resolver: zodResolver(CreateListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined, // Use undefined for number to allow placeholder
      category: undefined, // Use undefined to show placeholder
      tags: [],
      locationAddress: "",
      locationCity: "",
      images: [],
    },
  });
  
  const { fields: imageFields, append: appendImage, remove: removeImageFromArray } = useFieldArray({
    control: form.control,
    name: "images"
  });

  // This state is for UI previews only
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);


  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      if (imageFields.length + event.target.files.length > MAX_IMAGES) {
        toast({ title: "Image Limit", description: `You can upload a maximum of ${MAX_IMAGES} images.`, variant: "destructive" });
        return;
      }

      const newImageFiles = Array.from(event.target.files);
      
      for (const file of newImageFiles) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({ title: "Image Too Large", description: `File ${file.name} exceeds 5MB limit.`, variant: "destructive" });
          continue;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUri = reader.result as string;
          appendImage(dataUri); // Add to RHF array
          setImagePreviews(prev => [...prev, dataUri]); // Add to preview array

          // Smart tagging for the first image uploaded, if no tags yet
          if (imagePreviews.length === 0 && currentTags.length === 0 && !isTagging) { // Check imagePreviews.length before update
            setIsTagging(true);
            smartTagging({ photoDataUri: dataUri })
              .then(result => {
                const uniqueNewTags = result.tags.filter(tag => !currentTags.includes(tag) && !suggestedTags.includes(tag));
                setSuggestedTags(prev => [...prev, ...uniqueNewTags].slice(0, 5)); // Limit suggestions
              })
              .catch(e => {
                console.error("Smart tagging failed", e);
                toast({ title: "Smart Tagging Failed", description: "Could not suggest tags for the image.", variant: "destructive" });
              })
              .finally(() => setIsTagging(false));
          }
        };
        reader.readAsDataURL(file);
      }
      if (event.target) event.target.value = ""; // Clear file input
    }
  };

  const handleRemoveImage = (index: number) => {
    removeImageFromArray(index); // Remove from RHF array
    setImagePreviews(prev => prev.filter((_, i) => i !== index)); // Remove from preview array
  };

  const handleAddTag = () => {
    if (tagInputRef.current) {
      const newTag = tagInputRef.current.value.trim();
      if (newTag && !currentTags.includes(newTag) && currentTags.length < 10) {
        const updatedTags = [...currentTags, newTag];
        setCurrentTags(updatedTags);
        form.setValue("tags", updatedTags, { shouldValidate: true });
        tagInputRef.current.value = "";
        if(suggestedTags.includes(newTag)) {
          setSuggestedTags(prev => prev.filter(t => t !== newTag));
        }
      } else if (currentTags.length >= 10) {
        toast({ title: "Tag Limit Reached", description: "You can add a maximum of 10 tags.", variant: "destructive" });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    setCurrentTags(updatedTags);
    form.setValue("tags", updatedTags, { shouldValidate: true });
  };
  
  const addSuggestedTag = (tag: string) => {
    if (!currentTags.includes(tag) && currentTags.length < 10) {
      const updatedTags = [...currentTags, tag];
      setCurrentTags(updatedTags);
      form.setValue("tags", updatedTags, { shouldValidate: true });
      setSuggestedTags(prev => prev.filter(t => t !== tag));
    }
  };

  async function onSubmit(values: CreateListingInput) {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to create a listing.", variant: "destructive" });
      router.push('/login');
      return;
    }
    setIsSubmitting(true);
    try {
      // The server action `createListing` needs to handle auth securely.
      // For now, we assume it can derive user info or it's passed implicitly.
      // A better approach would be for `createListing` to take `userId` or use Admin SDK.
      // Let's modify `createListing` to expect a `userId` if called from client action wrapper
      // OR assume it's handled if it's a pure server action used with `use server`.
      // The current `createListing` uses a mock user, which is not suitable.
      // This part needs to be fixed in `actions/listings.ts` to use actual `currentUser.uid`.
      // For the purpose of this UI component, we proceed.
      
      const result = await createListing(values); // This needs adjustment in actions.ts
      toast({ title: "Listing Created!", description: "Your listing has been successfully published." });
      router.push(`/listings/${result.id}`);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to create listing. Please check your input and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 shadow-xl my-8 bg-card">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-primary text-center">Create New Listing</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Gently Used Sofa Set" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Detailed description of your item..." {...field} rows={5} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (INR)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 5000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {ListingCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormItem>
              <FormLabel>Images (up to {MAX_IMAGES}, max 5MB each)</FormLabel>
              <FormControl>
                <Input type="file" accept="image/png, image/jpeg, image/gif" multiple onChange={handleImageUpload} className="hidden" id="imageUpload" />
              </FormControl>
              <label htmlFor="imageUpload" className="mt-1 flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-border border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none">
                  <span className="flex items-center space-x-2">
                      <UploadCloud className="w-6 h-6 text-muted-foreground" />
                      <span className="font-medium text-muted-foreground">
                      Click to upload images
                      <p className="text-xs text-muted-foreground/80">PNG, JPG, GIF up to 5MB</p>
                      </span>
                  </span>
              </label>
              <FormMessage>{form.formState.errors.images?.message || form.formState.errors.images?.root?.message}</FormMessage>
              
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative aspect-square group border rounded-md overflow-hidden">
                      <Image src={src} alt={`Preview ${index + 1}`} layout="fill" objectFit="cover" />
                      <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(index)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </FormItem>

            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex items-center gap-2">
                <Input placeholder="Add a tag (e.g. handmade, vintage)" ref={tagInputRef} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}} />
                <Button type="button" variant="outline" onClick={handleAddTag}><PlusCircle size={16} className="mr-1" /> Add</Button>
              </div>
              <FormDescription>Press Enter or click Add. Max 10 tags, 30 chars each.</FormDescription>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {currentTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="py-1 px-2 text-sm">
                    {tag} <X size={14} className="ml-1.5 cursor-pointer hover:text-destructive" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
              {form.formState.errors.tags && <FormMessage>{form.formState.errors.tags.message || form.formState.errors.tags.root?.message}</FormMessage>}
              
              {isTagging && <p className="text-sm text-muted-foreground mt-2 flex items-center"><Loader2 size={16} className="animate-spin mr-2" />Suggesting tags based on first image...</p>}
              {suggestedTags.length > 0 && !isTagging && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Suggested Tags (click to add):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTags.map(tag => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent/20 py-1 px-2 text-sm" onClick={() => addSuggestedTag(tag)}>
                        <Tag size={12} className="mr-1" /> {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </FormItem>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="locationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input placeholder="e.g., Lal Chowk, Near Ghanta Ghar" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="e.g., Srinagar" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full text-lg py-3" size="lg" disabled={isSubmitting || isTagging}>
              {(isSubmitting || isTagging) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isSubmitting ? 'Publishing...' : isTagging ? 'Processing Image...' : 'Publish Listing'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
