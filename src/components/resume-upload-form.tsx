"use client";

import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, FileText as FileTextIcon, Loader2 } from 'lucide-react'; 

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { handleResumeUploadAction, type ResumeUploadSuccessResult } from '@/app/actions';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const formSchema = z.object({
  resume: z
    .custom<FileList>((val) => val instanceof FileList && val.length > 0, 'Please select a file.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf and .docx files are accepted.'
    ),
});

type ResumeInfo = ResumeUploadSuccessResult;

type ResumeUploadFormProps = {
  setResumeInfo: (data: ResumeInfo | null) => void;
  setIsLoadingText: Dispatch<SetStateAction<boolean>>;
  isLoadingTextGlobal: boolean; 
  className?: string;
};

export function ResumeUploadForm({
  setResumeInfo,
  setIsLoadingText,
  isLoadingTextGlobal,
  className,
}: ResumeUploadFormProps) {
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false); // Renamed to avoid conflict
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resume: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmittingLocal(true);
    setIsLoadingText(true);
    setResumeInfo(null); 

    const formData = new FormData();
    formData.append('resume', data.resume[0]);

    const result = await handleResumeUploadAction(formData);
    
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: result.error,
      });
      setResumeInfo(null); 
    } else if (result.data) {
      setResumeInfo(result.data); 
      toast({
        title: 'Upload Successful',
        description: 'Resume processed. Now, please provide the job description for analysis.',
      });
    }
    setIsSubmittingLocal(false);
    setIsLoadingText(false); // Set global loading to false after processing attempt
    // Do not reset form automatically, let user decide if they want to upload new file
    // form.reset(); 
    // setSelectedFileName(null); // Keep filename until new upload
  };
  
  const fileRef = form.register("resume");

  return (
    <Card className={cn("shadow-lg flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <UploadCloud className="h-6 w-6 text-primary" />
          Upload Your Resume
        </CardTitle>
        <CardDescription>Upload your resume (PDF or DOCX, max 5MB).</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="resume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="resume-upload" className="sr-only">Resume File</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center w-full">
                        <label 
                            htmlFor="resume-upload" 
                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer border-input bg-card hover:bg-secondary transition-colors"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PDF or DOCX (MAX. 5MB)</p>
                                {selectedFileName && (
                                  <p className="mt-2 text-xs text-accent-foreground bg-accent/20 px-2 py-1 rounded-md flex items-center gap-1">
                                    <FileTextIcon size={14}/> {selectedFileName}
                                  </p>
                                )}
                            </div>
                            <Input 
                                id="resume-upload" 
                                type="file" 
                                className="hidden"
                                accept=".pdf,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                {...fileRef}
                                onChange={(event) => {
                                  field.onChange(event.target.files);
                                  if (event.target.files && event.target.files.length > 0) {
                                    setSelectedFileName(event.target.files[0].name);
                                    // Automatically submit form on file select if needed, or rely on button
                                    // form.handleSubmit(onSubmit)(); 
                                  } else {
                                    setSelectedFileName(null);
                                  }
                                }}
                            />
                        </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmittingLocal || isLoadingTextGlobal} className="w-full">
              {isSubmittingLocal || isLoadingTextGlobal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upload & Extract Text'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
