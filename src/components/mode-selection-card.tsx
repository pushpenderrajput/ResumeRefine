
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

type ModeSelectionCardProps = {
  onModeSelect: (mode: 'ats' | 'matcher') => void;
  className?: string;
};

const TYPING_TEXTS = [
  "Elevate Your Resume with AI Insights",
  "Unlock Your Career Potential Now",
  "Craft the Perfect Resume, Effortlessly",
  "Get Noticed by Top Recruiters Fast",
  "AI-Driven Feedback for Max Impact"
];

export function ModeSelectionCard({ onModeSelect, className }: ModeSelectionCardProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % TYPING_TEXTS.length);
    }, 10000); // 10 seconds, matching the CSS animation cycle

    return () => clearInterval(intervalId);
  }, []);

  const currentText = TYPING_TEXTS[currentTextIndex];
  const typingSteps = currentText.length;

  return (
    <Card className={cn("w-full max-w-xl mx-auto shadow-2xl", className)}>
      <CardHeader className="text-center pb-4">
        <div className="mb-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-pink-500 animate-gradient-xy"
              style={{ animationDuration: '8s' }} 
            >
              ResumeRefine
            </span>
          </h1>
          <CardDescription className="text-md sm:text-lg mt-3 text-muted-foreground">
            Choose an AI-powered tool to enhance your resume.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-8 p-6 sm:p-8">
        <div 
          className="my-6 h-auto min-h-[60px] sm:min-h-[70px] flex items-center justify-center px-2 text-center overflow-visible" 
          data-ai-hint="animated text professional"
        >
          <h2
            key={currentText} // Add key to force re-render for animation restart on text change
            className="
              text-glow
              bg-clip-text text-transparent
              bg-gradient-to-r from-primary via-accent to-pink-500
              animate-gradient-xy 
              animated-typing-text
              text-xl sm:text-2xl md:text-3xl font-extrabold 
            "
            style={{ '--typing-steps': typingSteps } as React.CSSProperties}
          >
            {currentText}
          </h2>
        </div>

        <div className="w-full space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold text-center text-foreground mb-4">Select Analysis Mode:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => onModeSelect('ats')}
              variant="outline"
              className={cn(
                "mode-button-base mode-button-ats",
                "w-full py-6 sm:py-8 text-base sm:text-lg flex-col h-auto border-2 border-primary/50 hover:bg-primary/5 hover:border-primary"
              )}
            >
              <Zap className="mb-2 h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              ATS Score Analyzer
              <p className="text-xs font-normal text-muted-foreground mt-1 px-2">General resume ATS friendliness check.</p>
            </Button>
            <Button
              onClick={() => onModeSelect('matcher')}
              variant="outline"
              className={cn(
                "mode-button-base mode-button-matcher",
                "w-full py-6 sm:py-8 text-base sm:text-lg flex-col h-auto border-2 border-accent/50 hover:bg-accent/5 hover:border-accent"
              )}
            >
              <FileSearch className="mb-2 h-7 w-7 sm:h-8 sm:w-8 text-accent" />
              Job Description Matcher
              <p className="text-xs font-normal text-muted-foreground mt-1 px-2">Tailor resume for a specific job.</p>
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Get instant feedback to optimize your resume for Applicant Tracking Systems and specific job roles.
        </p>
      </CardContent>
    </Card>
  );
}
