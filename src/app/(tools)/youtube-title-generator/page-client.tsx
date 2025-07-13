
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles, Type, TriangleAlert, Copy, Check } from 'lucide-react';

import { generateYoutubeTitles, type GenerateYoutubeTitlesOutput } from '@/ai/flows/generate-youtube-titles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const LOCAL_STORAGE_KEY = "youtubeTitlesResult";

const formSchema = z.object({
  videoTopic: z.string().min(10, { message: 'Please provide at least 10 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function YoutubeTitleGeneratorPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [titlesResult, setTitlesResult] = useState<GenerateYoutubeTitlesOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedResult) {
        setTitlesResult(JSON.parse(savedResult));
        setIsResultOpen(true);
      }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { videoTopic: '' },
  });

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setTitlesResult(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    try {
      const result = await generateYoutubeTitles(values);
      setTitlesResult(result);
      setIsResultOpen(true);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="font-headline flex items-center justify-center gap-3 text-4xl font-bold md:text-5xl">
          <Type className="h-10 w-10 text-primary" />
          YouTube Title Generator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Get 5-10 viral, SEO-friendly titles for your next video.</p>
      </header>

      <div className="mb-8"><AdPlaceholder adKey="global-ad-script" /></div>

      <main className="mx-auto max-w-4xl space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Video Topic or Script</CardTitle>
                <CardDescription>Describe your video's topic or paste in part of your script for the best results.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="videoTopic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic / Script</FormLabel>
                      <FormControl><Textarea placeholder="e.g., How to invest in real estate with only $100, explaining different crowdfunding platforms and their pros and cons." {...field} rows={6} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Generate Titles
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <div className="mt-8"><Skeleton className="h-64 w-full" /></div>
        )}

        {titlesResult && (
          <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Generated YouTube Titles</DialogTitle>
                <DialogDescription>Here are some title ideas. Pick your favorite or combine ideas.</DialogDescription>
              </DialogHeader>
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  AI can make mistakes, so double-check it.
                </AlertDescription>
              </Alert>
              <div className="flex-grow overflow-y-auto pr-4 -mr-4 mt-4">
                <div className="space-y-3">
                  {titlesResult.titles.map((title, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-md border bg-secondary p-3">
                      <p className="flex-grow font-medium">{title}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleCopy(title, index)}>
                        {copiedIndex === index ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <AdPlaceholder adKey="global-ad-script" />
      </main>
    </div>
  );
}
