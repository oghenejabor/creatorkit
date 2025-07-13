
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles, Tags, TriangleAlert, Copy, Check } from 'lucide-react';

import { generateYoutubeTags, type GenerateYoutubeTagsOutput } from '@/ai/flows/generate-youtube-tags';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const LOCAL_STORAGE_KEY = "youtubeTagsResult";

const formSchema = z.object({
  videoContext: z.string().min(10, { message: 'Please provide at least 10 characters of context.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function YoutubeTagsGeneratorPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [tagsResult, setTagsResult] = useState<GenerateYoutubeTagsOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedResult) {
        setTagsResult(JSON.parse(savedResult));
        setIsResultOpen(true);
      }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { videoContext: '' },
  });

  const handleCopy = () => {
    if (!tagsResult) return;
    navigator.clipboard.writeText(tagsResult.tags.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setTagsResult(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    try {
      const result = await generateYoutubeTags(values);
      setTagsResult(result);
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
          <Tags className="h-10 w-10 text-primary" />
          YouTube Tags Generator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Generate dozens of SEO-optimized tags from your video topic or title.</p>
      </header>

      <div className="mb-8"><AdPlaceholder adKey="global-ad-script" /></div>

      <main className="mx-auto max-w-4xl space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Video Context</CardTitle>
                <CardDescription>Enter your video title, a short description, or a few keywords about your topic.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="videoContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic, Title, or Description</FormLabel>
                      <FormControl><Textarea placeholder="e.g., 'A review of the new a7S III camera for shooting cinematic video'" {...field} rows={5} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Generate Tags
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <div className="mt-8"><Skeleton className="h-64 w-full" /></div>
        )}

        {tagsResult && (
          <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Generated YouTube Tags</DialogTitle>
                <DialogDescription>Copy these tags and paste them into your YouTube video's tag section.</DialogDescription>
              </DialogHeader>
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  AI can make mistakes, so double-check it.
                </AlertDescription>
              </Alert>
              <div className="flex-grow overflow-y-auto pr-4 -mr-4 mt-4 p-4 border rounded-lg bg-secondary/50">
                <div className="flex flex-wrap gap-2">
                  {tagsResult.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-base">{tag}</Badge>
                  ))}
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                 <Button onClick={handleCopy} className="w-full">
                    {copied ? <Check className="mr-2 h-5 w-5" /> : <Copy className="mr-2 h-5 w-5" />}
                    Copy All Tags
                </Button>
                <DialogClose asChild><Button type="button" variant="secondary" className="w-full">Close</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <AdPlaceholder adKey="global-ad-script" />
      </main>
    </div>
  );
}
