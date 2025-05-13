
"use client";

import { useState, useEffect } from 'react';
import { Briefcase, ArrowLeft, X as CloseIcon } from 'lucide-react';
import { ResumeUploadForm } from '@/components/resume-upload-form';
import { AISuggestionsDisplay } from '@/components/ai-suggestions-display';
import { AtsScoreDisplay } from '@/components/ats-score-display';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/icons/logo';
import { ModeSelectionCard } from '@/components/mode-selection-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getResumeSuggestionsAction, getAtsScoreAction, type ResumeUploadSuccessResult } from './actions';
import type { CalculateAtsScoreOutput } from "@/ai/flows/calculate-ats-score";
import { ResumeDocumentDisplay, type ResumeInfo } from '@/components/resume-document-display';
import { FunnyLoader } from '@/components/funny-loader';

type AnalysisMode = 'ats' | 'matcher' | null;

export default function ResumeRefinePage() {
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>(null);
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');

  const [atsScoreData, setAtsScoreData] = useState<CalculateAtsScoreOutput | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);

  const [isLoadingTextGlobal, setIsLoadingTextGlobal] = useState(false);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const { toast } = useToast();

  const extractedText = resumeInfo?.extractedText || null;

  const handleUploadSuccess = (data: ResumeInfo | null) => {
    setResumeInfo(data);
    // Keep ATS score and suggestions if they were for the previous resume with same JD/mode
    // Or reset them if the context (like JD for matcher) might imply they are no longer relevant
    // For now, let's keep them and let useEffects handle re-fetching if `extractedText` changes.
  };



  const handleModeSelect = (mode: 'ats' | 'matcher') => {
    setSelectedMode(mode);
    setResumeInfo(null);
    setJobDescription('');
    setAtsScoreData(null);
    setSuggestions(null);
  };

  const handleBackToModeSelection = () => {
    setSelectedMode(null);
    setResumeInfo(null);
    setJobDescription('');
    setAtsScoreData(null);
    setSuggestions(null);
    setIsLoadingTextGlobal(false);
    setIsLoadingScore(false);
    setIsLoadingSuggestions(false);
  };

  useEffect(() => {
    if (!extractedText || !selectedMode) {
      setAtsScoreData(null);
      setIsLoadingScore(false);
      return;
    }

    const fetchAtsScore = async () => {
      setIsLoadingScore(true);
      setAtsScoreData(null);
      const jdToUse = selectedMode === 'matcher' ? jobDescription : "";

      if (selectedMode === 'matcher' && (!jdToUse || jdToUse.trim() === "")) {
        // In matcher mode, if JD is empty, don't fetch score, clear existing
        setIsLoadingScore(false);
        setAtsScoreData(null);
        return;
      }

      const result = await getAtsScoreAction(extractedText, jdToUse);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'ATS Score Error',
          description: result.error,
        });
        setAtsScoreData(null);
      } else if (result.atsScore) {
        setAtsScoreData(result.atsScore);
      }
      setIsLoadingScore(false);
    };

    fetchAtsScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractedText, jobDescription, selectedMode, toast]); // Added toast to dependencies

  useEffect(() => {
    if (!extractedText || !selectedMode) {
      setSuggestions(null);
      setIsLoadingSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      setSuggestions(null);

      let jdForSuggestions = "";
      if (selectedMode === 'matcher') {
        if (!jobDescription.trim()) {
          // In matcher mode, if JD is empty, don't fetch suggestions, clear existing
          setIsLoadingSuggestions(false);
          setSuggestions(null);
          return;
        }
        jdForSuggestions = jobDescription;
      }
      // For 'ats' mode, jdForSuggestions remains "" which the flow interprets as general suggestions.

      const result = await getResumeSuggestionsAction(extractedText, jdForSuggestions, selectedMode);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Suggestion Error',
          description: result.error,
        });
        setSuggestions(null);
      } else if (result.suggestions) {
        setSuggestions(result.suggestions);
      }
      setIsLoadingSuggestions(false);
    };

    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractedText, jobDescription, selectedMode, toast]); // Added toast to dependencies


  const showGlobalLoader = isLoadingTextGlobal ||
    (isLoadingScore && extractedText && !atsScoreData && (selectedMode === 'ats' || (selectedMode === 'matcher' && jobDescription.trim() !== ""))) ||
    (isLoadingSuggestions && extractedText && !suggestions && (selectedMode === 'ats' || (selectedMode === 'matcher' && jobDescription.trim() !== "")));

  let analysisStepText = "your request";
  if (isLoadingTextGlobal && !extractedText) {
    analysisStepText = "resume analysis";
  } else if (isLoadingScore && !atsScoreData && extractedText) {
    analysisStepText = selectedMode === 'matcher' && jobDescription.trim() ? "job-specific ATS scoring" : "general ATS scoring";
  } else if (isLoadingSuggestions && !suggestions && extractedText) {
    analysisStepText = selectedMode === 'matcher' && jobDescription.trim() ? "tailored AI suggestions" : "general AI suggestions";
  }


  const cardHeightClass = "min-h-[400px] md:min-h-[450px]";
  const flexGrowCardHeightClass = `${cardHeightClass} flex flex-col`;


  return (
    <div className="min-h-screen flex flex-col bg-secondary/50 dark:bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow container py-8 flex flex-col items-center">
        {!selectedMode ? (
          <ModeSelectionCard onModeSelect={handleModeSelect} className="mt-10" />
        ) : (
          <div className="w-full max-w-6xl">
            <Button variant="outline" onClick={handleBackToModeSelection} className="mb-6 dark:button-glow">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mode Selection
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Inputs & Document */}
              <div className="flex flex-col space-y-6">
                <ResumeUploadForm
                  setResumeInfo={handleUploadSuccess}
                  setIsLoadingText={setIsLoadingTextGlobal}
                  isLoadingTextGlobal={isLoadingTextGlobal}
                  className={`${flexGrowCardHeightClass} md:ml-2 shadow-lg glow-shadow dark:card-glow`}
                />

                {selectedMode === 'matcher' && (
                  <Card className={`${cardHeightClass} md:ml-2 shadow-lg glow-shadow dark:card-glow flex flex-col`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Job Description
                      </CardTitle>
                      <CardDescription>Paste the job description to tailor analysis.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow pt-2 pb-4 px-4 md:px-6">
                      <Label htmlFor="job-description" className="sr-only">Job Description</Label>
                      <Textarea
                        id="job-description"
                        placeholder="Paste job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="flex-grow text-sm resize-none w-full"
                        disabled={isLoadingTextGlobal || isLoadingScore || isLoadingSuggestions || !resumeInfo}
                      />
                    </CardContent>
                  </Card>
                )}

                {resumeInfo && (
                  <ResumeDocumentDisplay
                    resumeInfo={resumeInfo}
                    className={`${flexGrowCardHeightClass} md:ml-2 shadow-lg glow-shadow dark:card-glow`}
                  />
                )}

                {/* Placeholders to maintain column height if elements are missing */}
                {selectedMode === 'matcher' && !resumeInfo && (
                  // If in matcher mode and resume is not yet uploaded, job description card is visible.
                  // This placeholder fills the space where ResumeDocumentDisplay would be.
                  <div className={cardHeightClass} aria-hidden="true"></div>
                )}
                {selectedMode === 'ats' && !resumeInfo && (
                  // If in ATS mode and resume is not yet uploaded, this fills the space.
                  <div className={cardHeightClass} aria-hidden="true"></div>
                )}
              </div>

              {/* Right Column: Analysis */}
              <div className="flex flex-col space-y-6">
                <AtsScoreDisplay
                  atsScoreData={atsScoreData}
                  isLoading={isLoadingScore}
                  mode={selectedMode}
                  hasResume={!!extractedText}
                  hasJobDescription={!!jobDescription.trim()}
                  className={`${flexGrowCardHeightClass} shadow-lg glow-shadow dark:card-glow`}
                />
                <AISuggestionsDisplay
                  suggestions={suggestions}
                  isLoading={isLoadingSuggestions}
                  mode={selectedMode}
                  hasResume={!!extractedText}
                  hasJobDescription={!!jobDescription.trim()}
                  className={`${flexGrowCardHeightClass} shadow-lg glow-shadow dark:card-glow`}
                />
              </div>
            </div>
          </div>
        )}

        {showGlobalLoader && (
          <FunnyLoader analysisStep={analysisStepText} />
        )}
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ResumeRefine. All rights reserved. | Developed By <a href="https://www.linkedin.com/in/pushpender-rajput" target="_blank" rel="noopener noreferrer">
              Pushpender Rajput.</a>

          </p>
        </div>
      </footer>
    </div>
  );
}
