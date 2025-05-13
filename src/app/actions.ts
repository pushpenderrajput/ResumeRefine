
"use server";

import { extractResumeText as extractResumeTextFlow } from "@/ai/flows/extract-resume-text";
import { provideResumeSuggestions as provideResumeSuggestionsFlow } from "@/ai/flows/provide-resume-suggestions";
import { calculateAtsScore as calculateAtsScoreFlow } from "@/ai/flows/calculate-ats-score";

import type { ExtractResumeTextInput, ExtractResumeTextOutput } from "@/ai/flows/extract-resume-text";
import type { ProvideResumeSuggestionsInput, ProvideResumeSuggestionsOutput } from "@/ai/flows/provide-resume-suggestions";
import type { CalculateAtsScoreInput, CalculateAtsScoreOutput } from "@/ai/flows/calculate-ats-score";
import type { ResumeInfo } from "@/components/resume-document-display"; 

export interface ResumeUploadSuccessResult extends ResumeInfo {}


export async function handleResumeUploadAction(
  formData: FormData
): Promise<{ data?: ResumeUploadSuccessResult; error?: string }> {
  const file = formData.get("resume") as File;

  if (!file || file.size === 0) {
    return { error: "No file uploaded or file is empty." };
  }

  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Invalid file type. Please upload a PDF or DOCX file." };
  }
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");
    const resumeDataUri = `data:${file.type};base64,${base64String}`;

    const input: ExtractResumeTextInput = { resumeDataUri };
    const result: ExtractResumeTextOutput = await extractResumeTextFlow(input);
    
    return { 
      data: {
        extractedText: result.extractedText,
        resumeDataUri: resumeDataUri,
        fileName: file.name,
        fileType: file.type,
      }
    };
  } catch (e) {
    console.error("Error processing resume:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during text extraction.";
    return { error: `Failed to extract text from resume. ${errorMessage}` };
  }
}

export async function getResumeSuggestionsAction(
  extractedText: string,
  jobDescription: string, // jobDescription can be an empty string for general suggestions
  mode: 'ats' | 'matcher'
): Promise<{ suggestions?: string[]; error?: string }> {
  if (!extractedText || extractedText.trim() === "") {
    return { error: "Cannot generate suggestions for empty resume text." };
  }
  // If in matcher mode, job description is strictly required.
  if (mode === 'matcher' && (!jobDescription || jobDescription.trim() === "")) {
    // This specific error is primarily for logical consistency on the server, 
    // client-side checks should prevent this call for 'matcher' mode if JD is empty.
    return { error: "Job description is required to generate tailored suggestions in Matcher mode."}
  }

  try {
    const input: ProvideResumeSuggestionsInput = { 
      resumeText: extractedText, 
      // Pass jobDescription. If mode is 'ats', it will be an empty string.
      // The flow now handles optional jobDescription.
      jobDescription: jobDescription 
    };
    const result: ProvideResumeSuggestionsOutput = await provideResumeSuggestionsFlow(input);
    
    return { suggestions: result.suggestions };
  } catch (e) {
    console.error("Error generating suggestions:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while generating suggestions.";
    return { error: `Failed to generate suggestions. ${errorMessage}` };
  }
}

export async function getAtsScoreAction(
  extractedText: string,
  jobDescription: string, 
): Promise<{ atsScore?: CalculateAtsScoreOutput; error?: string }> {
  if (!extractedText || extractedText.trim() === "") {
    return { error: "Cannot calculate ATS score for empty resume text." };
  }


  try {
    const input: CalculateAtsScoreInput = { 
        resumeText: extractedText, 
        // Pass jobDescription only if it's non-empty and relevant for the flow logic
        jobDescription: jobDescription?.trim() ? jobDescription : "" 
    };
    const result: CalculateAtsScoreOutput = await calculateAtsScoreFlow(input);
    return { atsScore: result };
  } catch (e) {
    console.error("Error calculating ATS score:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while calculating ATS score.";
    return { error: `Failed to calculate ATS score. ${errorMessage}` };
  }
}

