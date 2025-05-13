// use server'

/**
 * @fileOverview AI-powered suggestions for improving a resume, optionally based on a job description.
 *
 * - provideResumeSuggestions - A function that provides AI-powered suggestions for improving a resume.
 * - ProvideResumeSuggestionsInput - The input type for the provideResumeSuggestions function.
 * - ProvideResumeSuggestionsOutput - The return type for the provideResumeSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideResumeSuggestionsInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The extracted text content of the resume to be reviewed.'),
  jobDescription: z
    .string()
    .optional()
    .describe('The job description text to tailor suggestions for. If empty, general suggestions will be provided.'),
});
export type ProvideResumeSuggestionsInput = z.infer<
  typeof ProvideResumeSuggestionsInputSchema
>;

const ProvideResumeSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of AI-powered suggestions for improving the resume. Tailored to the job description if provided, otherwise general improvements.'
    ),
});
export type ProvideResumeSuggestionsOutput = z.infer<
  typeof ProvideResumeSuggestionsOutputSchema
>;

export async function provideResumeSuggestions(
  input: ProvideResumeSuggestionsInput
): Promise<ProvideResumeSuggestionsOutput> {
  return provideResumeSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideResumeSuggestionsPrompt',
  input: {schema: ProvideResumeSuggestionsInputSchema},
  output: {schema: ProvideResumeSuggestionsOutputSchema},
  prompt: `You are an AI resume expert.

{{#if jobDescription}}
You specialize in providing suggestions to improve resumes for specific job applications.
You will be given the text content of a resume and a specific job description.
Your task is to provide a list of specific, actionable suggestions to improve the resume to make it a stronger candidate for the *given job description*.

The suggestions should include:
- Identifying missing keywords from the job description that should be incorporated into the resume.
- Recommending language refinements to better match the tone and requirements of the job.
- Suggesting content adjustments to highlight experiences, skills, and achievements most relevant to the job description.
- Pointing out areas where qualifications or experiences could be quantified or elaborated for greater impact.
- Brief formatting or structural advice if it significantly impacts ATS readability or clarity for the recruiter.

Focus on practical advice that helps tailor the resume effectively. Limit suggestions to 3-5 key actionable points.

Job Description:
{{{jobDescription}}}

Resume Text:
{{{resumeText}}}

{{else}}
You specialize in providing general suggestions to improve a resume's overall quality and effectiveness.
You will be given the text content of a resume. No specific job description was provided.
Your task is to provide a list of specific, actionable suggestions to improve the resume for general job applications.

The suggestions should include:
- Identifying common areas for improvement in resumes (e.g., clarity, conciseness, impact, action verbs).
- Recommending ways to strengthen skill sections or highlight transferable skills.
- Suggesting improvements for summarizing experiences and achievements.
- Pointing out areas where qualifications or experiences could be quantified or elaborated for greater impact.
- General formatting or structural advice for ATS readability and recruiter appeal.

Focus on practical advice that enhances the resume's overall strength. Limit suggestions to 3-5 key actionable points.

Resume Text:
{{{resumeText}}}

{{/if}}
Return the suggestions in the specified JSON format.
`,
});

const provideResumeSuggestionsFlow = ai.defineFlow(
  {
    name: 'provideResumeSuggestionsFlow',
    inputSchema: ProvideResumeSuggestionsInputSchema,
    outputSchema: ProvideResumeSuggestionsOutputSchema,
  },
  async input => {
     // Ensure jobDescription is an empty string if undefined, for the prompt logic
    const effectiveInput = {
      ...input,
      jobDescription: input.jobDescription || "", 
    };
    const {output} = await prompt(effectiveInput);
    if (!output) {
      throw new Error('The AI model did not return the expected suggestions output.');
    }
    return output;
  }
);

