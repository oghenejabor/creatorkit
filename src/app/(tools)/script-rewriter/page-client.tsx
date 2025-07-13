
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Sparkles,
  FileText,
  Copy,
  Check,
  ClipboardPaste,
  TriangleAlert,
} from 'lucide-react';

import { rewriteScript, RewriteScriptOutput } from '@/ai/flows/rewrite-script';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LOCAL_STORAGE_KEY_RESULT = "scriptRewriterResult";
const LOCAL_STORAGE_KEY_COMPETITOR = "scriptRewriterCompetitorScript";
const LOCAL_STORAGE_KEY_USER = "scriptRewriterUserScript";

const formSchema = z.object({
  competitorScript: z
    .string()
    .min(50, { message: "Competitor's script must be at least 50 characters long." }),
  userScript: z
    .string()
    .min(50, { message: 'Your script must be at least 50 characters long.' }),
});

type FormValues = z.infer<typeof formSchema>;

const AnalysisSection = ({ title, content }: { title: string; content: string }) => (
  <div className="space-y-2">
    <h4 className="font-headline text-lg font-semibold">{title}</h4>
    <p className="text-sm text-muted-foreground">{content}</p>
  </div>
);

export default function ScriptRewriterPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RewriteScriptOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [originalUserScript, setOriginalUserScript] = useState<string | null>(null);
  const [originalCompetitorScript, setOriginalCompetitorScript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY_RESULT);
      const savedCompetitorScript = localStorage.getItem(LOCAL_STORAGE_KEY_COMPETITOR);
      const savedUserScript = localStorage.getItem(LOCAL_STORAGE_KEY_USER);

      if (savedResult && savedCompetitorScript && savedUserScript) {
        setAnalysisResult(JSON.parse(savedResult));
        setOriginalCompetitorScript(JSON.parse(savedCompetitorScript));
        setOriginalUserScript(JSON.parse(savedUserScript));
        setIsResultOpen(true);
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY_RESULT);
      localStorage.removeItem(LOCAL_STORAGE_KEY_COMPETITOR);
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      competitorScript: '',
      userScript: '',
    },
  });

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult.suggestedScript);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setOriginalUserScript(null);
    setOriginalCompetitorScript(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_RESULT);
    localStorage.removeItem(LOCAL_STORAGE_KEY_COMPETITOR);
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);

    try {
      const result = await rewriteScript({
        competitorScript: values.competitorScript,
        userScript: values.userScript,
      });

      setAnalysisResult(result);
      setOriginalUserScript(values.userScript);
      setOriginalCompetitorScript(values.competitorScript);
      setIsResultOpen(true);
      
      localStorage.setItem(LOCAL_STORAGE_KEY_RESULT, JSON.stringify(result));
      localStorage.setItem(LOCAL_STORAGE_KEY_COMPETITOR, JSON.stringify(values.competitorScript));
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(values.userScript));

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="font-headline flex items-center justify-center gap-3 text-4xl font-bold md:text-5xl">
          <FileText className="h-10 w-10 text-primary" />
          YouTube Script Rewriter
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Transform your script from good to great by learning from the best.
        </p>
      </header>

      <div className="mb-8">
        <AdPlaceholder adKey="global-ad-script" />
      </div>

      <main className="space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  Analyze & Rewrite Your Script
                </CardTitle>
                <CardDescription>
                  Provide a competitor's script and your script to get an AI-powered rewrite.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="competitorScript"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitor's Script</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <ClipboardPaste className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Textarea
                            placeholder="Paste your competitor's video script here..."
                            className="min-h-[200px] pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        You can use services like Tactiq or other YouTube transcript extensions to get the script.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userScript"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Script</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ClipboardPaste className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Textarea
                            placeholder="Paste your video script here..."
                            className="min-h-[200px] pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardContent>
                <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                  )}
                  Rewrite My Script
                </Button>
              </CardContent>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <Card className="mt-8">
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        )}
        
        {analysisResult && originalCompetitorScript && originalUserScript && (
          <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-6xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">
                  AI Script Analysis & Rewrite
                </DialogTitle>
                <DialogDescription>
                  Here's how your script can be improved based on your competitor's successful script.
                </DialogDescription>
              </DialogHeader>
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  AI can make mistakes, so double-check it.
                </AlertDescription>
              </Alert>
              <div className="flex-grow overflow-y-auto pr-4 -mr-4 mt-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-lg bg-secondary/50 p-6">
                      <AnalysisSection title="What Your Competitor Does Well" content={analysisResult.competitorScriptAnalysis} />
                      <AnalysisSection title="Your Script's Opportunity Areas" content={analysisResult.userScriptAnalysis} />
                  </div>

                  <div>
                      <h3 className="font-headline text-xl font-semibold">AI Rewrite Reasoning</h3>
                      <p className="text-sm text-muted-foreground mt-2">{analysisResult.reasoning}</p>
                  </div>
                
                  <Separator />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Competitor's Script */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Competitor's Script</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-56 rounded-md border p-3">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{originalCompetitorScript}</p>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* Your Script */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Original Script</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-56 rounded-md border p-3">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{originalUserScript}</p>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* AI Suggested Script */}
                    <Card className="bg-primary/10 border-primary">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>AI Suggested Script</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-56 rounded-md bg-background p-3">
                          <p className="text-sm font-medium whitespace-pre-wrap">{analysisResult.suggestedScript}</p>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <AdPlaceholder adKey="global-ad-script" />
      </main>
    </div>
  );
}
