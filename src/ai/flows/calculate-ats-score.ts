'use server';
/**
 * @fileOverview Calculates ATS (Applicant Tracking System) scores for a resume, optionally against a job description.
 *
 * - calculateAtsScore - A function that handles the ATS score calculation process.
 * - CalculateAtsScoreInput - The input type for the calculateAtsScore function.
 * - CalculateAtsScoreOutput - The return type for the calculateAtsScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateAtsScoreInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The extracted text content of the resume to be analyzed.'),
  jobDescription: z
    .string()
    .optional()
    .describe('The job description text to compare the resume against. If empty, a general ATS score will be provided.'),
});
export type CalculateAtsScoreInput = z.infer<typeof CalculateAtsScoreInputSchema>;

const CalculateAtsScoreOutputSchema = z.object({
  overallScore: z
    .number()
    .min(0)
    .max(100)
    .describe('The overall ATS compatibility score from 0 to 100.'),
  categoryScores: z
    .object({
      keywords: z
        .number()
        .min(0)
        .max(100)
        .describe('Score for keyword relevance (to job description if provided, otherwise general industry terms) (0-100).'),
      clarity: z
        .number()
        .min(0)
        .max(100)
        .describe('Score for clarity, conciseness, and readability (0-100).'),
      impact: z
        .number()
        .min(0)
        .max(100)
        .describe('Score for impact, achievements, and use of action verbs (relevant to job if provided) (0-100).'),
      format: z
        .number()
        .min(0)
        .max(100)
        .describe('Score for formatting, structure, and ATS parse-ability (0-100).'),
      relevance: z
        .number()
        .min(0)
        .max(100)
        .describe('Score for overall relevance of skills and experience (to job description if provided, otherwise general) (0-100).'),
    })
    .describe('Scores for individual ATS categories, each from 0 to 100.'),
});
export type CalculateAtsScoreOutput = z.infer<typeof CalculateAtsScoreOutputSchema>;

export async function calculateAtsScore(
  input: CalculateAtsScoreInput
): Promise<CalculateAtsScoreOutput> {
  return calculateAtsScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateAtsScorePrompt',
  input: {schema: CalculateAtsScoreInputSchema},
  output: {schema: CalculateAtsScoreOutputSchema},
  prompt: `You are an expert ATS (Applicant Tracking System) analysis tool.

{{#if jobDescription}}
You have been provided with a resume and a specific job description.
Evaluate the resume based on its suitability for THIS job description.
Consider the following criteria primarily in relation to the JOB DESCRIPTION:
1.  Keyword Relevance: How well do the keywords in the resume match the provided job description?
2.  Clarity and Conciseness: Is the language clear, concise, and easy for an ATS to parse and for a recruiter to understand in context of the job?
3.  Impact and Action Verbs: Does the resume use strong action verbs and quantify achievements that are relevant to the job requirements?
4.  Formatting and Readability: Is the resume structured in a way that is easy for an ATS to read and for a human to quickly find relevant information for this job? (e.g., standard fonts, clear headings, no tables/columns that break parsing).
5.  Relevance to Job Description: How well do the skills, experience, and qualifications mentioned in the resume align with the specific requirements and preferences outlined in the job description?

Provide a score from 0 to 100 for each of these five categories.
Then, provide an overall ATS compatibility score from 0 to 100, which should be a holistic evaluation based on the category scores and overall fitness for THIS SPECIFIC job description.

Job Description:
{{{jobDescription}}}

Resume Text:
{{{resumeText}}}

{{else}}
You have been provided with a resume. No specific job description was given.
Provide a GENERAL ATS (Applicant Tracking System) evaluation of the resume.
Consider the following general criteria for a strong, broadly applicable resume:
1.  Keyword Density & Common Skills: How well does the resume incorporate common industry keywords, transferable skills, and terms generally valued in professional roles?
2.  Clarity and Conciseness: Is the language clear, concise, and easy for an ATS to parse and for a recruiter to quickly understand?
3.  Impact and Action Verbs: Does the resume use strong action verbs and quantify achievements effectively to showcase accomplishments?
4.  Formatting and Readability: Is the resume structured in a way that is generally easy for an ATS to read and for a human to quickly find key information? (e.g., standard fonts, clear headings, no tables/columns that break parsing).
5.  General Professionalism & Completeness: How well does the resume present a professional image in terms of content, structure, and completeness of typical resume sections (e.g., contact info, experience, education, skills)?

Provide a score from 0 to 100 for each of these five categories.
Then, provide an overall ATS compatibility score from 0 to 100, which should be a holistic evaluation based on general best practices for resume writing and ATS compatibility.

Resume Text:
{{{resumeText}}}

{{/if}}

Return the scores in the specified JSON format.
`,
});

const calculateAtsScoreFlow = ai.defineFlow(
  {
    name: 'calculateAtsScoreFlow',
    inputSchema: CalculateAtsScoreInputSchema,
    outputSchema: CalculateAtsScoreOutputSchema,
  },
  async input => {
    // Ensure jobDescription is an empty string if undefined, for the prompt logic
    const effectiveInput = {
      ...input,
      jobDescription: input.jobDescription || "", 
    };
    const {output} = await prompt(effectiveInput);
    if (!output) {
      throw new Error('The AI model did not return the expected ATS score output.');
    }
    // Ensure all category scores are present, defaulting to 0 if missing.
    const ensuredOutput: CalculateAtsScoreOutput = {
      overallScore: output.overallScore ?? 0,
      categoryScores: {
        keywords: output.categoryScores?.keywords ?? 0,
        clarity: output.categoryScores?.clarity ?? 0,
        impact: output.categoryScores?.impact ?? 0,
        format: output.categoryScores?.format ?? 0,
        relevance: output.categoryScores?.relevance ?? 0,
      },
    };
    return ensuredOutput;
  }
);
