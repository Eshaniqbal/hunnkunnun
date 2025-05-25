'use server';

/**
 * @fileOverview AI-powered image analysis to suggest relevant tags for listings.
 *
 * - smartTagging - A function that handles the tag suggestion process.
 * - SmartTaggingInput - The input type for the smartTagging function, including a data URI for the listing image.
 * - SmartTaggingOutput - The return type for the smartTagging function, providing suggested tags.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTaggingInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the listing, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SmartTaggingInput = z.infer<typeof SmartTaggingInputSchema>;

const SmartTaggingOutputSchema = z.object({
  tags: z.array(z.string()).describe('Suggested tags for the listing.'),
});
export type SmartTaggingOutput = z.infer<typeof SmartTaggingOutputSchema>;

export async function smartTagging(input: SmartTaggingInput): Promise<SmartTaggingOutput> {
  return smartTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTaggingPrompt',
  input: {schema: SmartTaggingInputSchema},
  output: {schema: SmartTaggingOutputSchema},
  prompt: `You are an AI assistant designed to analyze images of classified listings and suggest relevant tags.

  Analyze the following image and provide a list of tags that would help users find this listing when searching.
  The tags should be descriptive and relevant to the image content.
  Do not include any tags that are offensive or inappropriate.

  Image: {{media url=photoDataUri}}

  Return the tags as an array of strings.
  `,
});

const smartTaggingFlow = ai.defineFlow(
  {
    name: 'smartTaggingFlow',
    inputSchema: SmartTaggingInputSchema,
    outputSchema: SmartTaggingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
