
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, FileType2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ResumeInfo = {
  extractedText: string;
  resumeDataUri: string;
  fileName: string;
  fileType: string;
};

type ResumeDocumentDisplayProps = {
  resumeInfo: ResumeInfo | null;
  className?: string;
};

export function ResumeDocumentDisplay({ resumeInfo, className }: ResumeDocumentDisplayProps) {
  if (!resumeInfo) {
    return (
      <Card className={cn("shadow-lg flex flex-col items-center justify-center", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-primary" />
            Resume Document
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">No resume uploaded yet.</p>
        </CardContent>
      </Card>
    );
  }

  const { resumeDataUri, fileName, fileType } = resumeInfo;

  return (
    <Card className={cn("shadow-lg flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-6 w-6 text-primary" />
          Uploaded Resume
        </CardTitle>
        <CardDescription>{fileName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-2">
        {fileType === 'application/pdf' ? (
          <iframe
            src={resumeDataUri}
            className="w-full h-full border-0"
            title={`Resume: ${fileName}`}
            aria-label={`Resume: ${fileName}`}
          />
        ) : fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
            <FileType2 className="h-16 w-16 mb-4 opacity-70" />
            <p className="text-lg font-medium">DOCX File Uploaded</p>
            <p className="text-sm">Preview for .docx files is not available.</p>
            <p className="text-xs mt-1">Filename: {fileName}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
            <FileText className="h-16 w-16 mb-4 opacity-70" />
            <p className="text-lg font-medium">Unsupported File Type</p>
            <p className="text-sm">Cannot display preview for this file type.</p>
             <p className="text-xs mt-1">Filename: {fileName}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
