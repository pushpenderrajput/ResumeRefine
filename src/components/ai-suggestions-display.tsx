
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, SearchX, CheckCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';

type AISuggestionsDisplayProps = {
  suggestions: string[] | null;
  isLoading: boolean;
  className?: string;
  mode: 'ats' | 'matcher' | null;
  hasResume: boolean;
  hasJobDescription: boolean;
};

export function AISuggestionsDisplay({ suggestions, isLoading, className, mode, hasResume, hasJobDescription }: AISuggestionsDisplayProps) {
  
  const getPlaceholderTitle = () => {
    if (!hasResume) return "Upload Resume";
    if (mode === 'matcher' && !hasJobDescription) return "Provide Job Description";
    return "AI Insights";
  };

  const getPlaceholderMessage = () => {
    if (!hasResume) return "Upload your resume to get AI-powered suggestions.";
    if (mode === 'matcher' && !hasJobDescription) return "Paste the job description to get tailored suggestions.";
    if (mode === 'ats' && hasResume && suggestions === null && !isLoading) return "General improvement suggestions will appear here.";
    if (suggestions && suggestions.length === 0 && !isLoading) return "The AI couldn't find specific improvement suggestions for this resume.";
    return "Suggestions to improve your resume will appear here.";
  };
  
  const showNoSuggestionsPlaceholder = !isLoading && (!suggestions || suggestions.length === 0);

  return (
    <Card className={cn("shadow-lg flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lightbulb className="h-6 w-6 text-primary" />
          AI Suggestions
        </CardTitle>
        <CardDescription>
          {isLoading ? "Generating AI-powered recommendations..." : 
           mode === 'matcher' ? "Recommendations to improve your resume for the job." :
           "General recommendations to enhance your resume."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden pt-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full w-full p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating suggestions...</p>
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <ScrollArea className="h-full pr-3"> {/* Changed to h-full for better scroll behavior */}
            <ul className="space-y-3.5 py-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed text-foreground/90">{suggestion}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
             <SearchX className="h-16 w-16 mb-4 opacity-70" />
            <p className="text-lg font-medium">{getPlaceholderTitle()}</p>
            <p className="text-sm">
              {getPlaceholderMessage()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
