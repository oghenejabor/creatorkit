
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles, TriangleAlert, Copy, Check } from 'lucide-react';

import { generateTiktokScript, type GenerateTiktokScriptOutput } from '@/ai/flows/generate-tiktok-script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const LOCAL_STORAGE_KEY = "tiktokScriptResult";

const formSchema = z.object({
  topic: z.string().min(10, { message: 'Please provide at least 10 characters.' }),
  voiceoverStyle: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TiktokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16" className="h-10 w-10 text-primary">
        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
    </svg>
);

export default function TiktokScriptGeneratorPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateTiktokScriptOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
        setIsResultOpen(true);
      }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: '', voiceoverStyle: '' },
  });

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    try {
      const res = await generateTiktokScript(values);
      setResult(res);
      setIsResultOpen(true);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res));
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
          <TiktokIcon />
          TikTok Script Generator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Generate a short-form video script with emotional structure and visual cues.</p>
      </header>

      <div className="mb-8"><AdPlaceholder adKey="global-ad-script" /></div>

      <main className="mx-auto max-w-4xl space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Video Details</CardTitle>
                <CardDescription>Describe your video topic and optionally, a voiceover style.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic or Goal</FormLabel>
                      <FormControl><Textarea placeholder="e.g., 'A 60-second tutorial on how to make the perfect cold brew coffee at home'" {...field} rows={4} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="voiceoverStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voiceover Style (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., energetic, calm, funny, cinematic" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Generate Script
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <div className="mt-8"><Skeleton className="h-96 w-full" /></div>
        )}

        {result && (
          <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Generated TikTok Script</DialogTitle>
                <div className="flex justify-between items-center">
                    <DialogDescription>Your 60-second video script is ready.</DialogDescription>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="mr-2 h-4 w-4 text-primary" /> : <Copy className="mr-2 h-4 w-4" />}
                        Copy Script
                    </Button>
                </div>
              </DialogHeader>
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  AI can make mistakes, so double-check it.
                </AlertDescription>
              </Alert>
              <ScrollArea className="flex-grow overflow-y-auto pr-4 -mr-4 mt-4 p-4 border rounded-lg bg-secondary/50">
                <p className="font-medium whitespace-pre-wrap">{result.script}</p>
              </ScrollArea>
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
