
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Sparkles,
  TrendingUp,
  Youtube,
  Globe,
  ArrowRight,
  Copy,
  Check,
  ArrowDown,
  TriangleAlert,
} from 'lucide-react';

import { EnhanceSeoOutput, enhanceSeo } from '@/ai/flows/enhance-seo';
import { VideoDetails, getVideoDetails } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/lib/countries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LOCAL_STORAGE_KEY_RESULT = "seoEnhancerResult";
const LOCAL_STORAGE_KEY_DETAILS = "seoEnhancerVideoDetails";

const formSchema = z.object({
  youtubeUrl: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .refine((url) => /(?:youtube\.com|youtu\.be)/.test(url), {
      message: 'Please enter a valid YouTube URL.',
    }),
  region: z.string().nonempty({ message: 'Please select a region.' }),
});

type FormValues = z.infer<typeof formSchema>;

const ScoreDisplay = ({ score, label }: { score: number; label: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-baseline">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-primary">{score}<span className="text-base font-normal">/100</span></p>
    </div>
    <Progress value={score} />
  </div>
);

export default function SeoEnhancerPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EnhanceSeoOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY_RESULT);
      const savedDetails = localStorage.getItem(LOCAL_STORAGE_KEY_DETAILS);
      if (savedResult && savedDetails) {
        setAnalysisResult(JSON.parse(savedResult));
        setVideoDetails(JSON.parse(savedDetails));
        setIsResultOpen(true);
      }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY_RESULT);
        localStorage.removeItem(LOCAL_STORAGE_KEY_DETAILS);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: '',
      region: 'US',
    },
  });

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setVideoDetails(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_RESULT);
    localStorage.removeItem(LOCAL_STORAGE_KEY_DETAILS);

    try {
      const details = await getVideoDetails(values.youtubeUrl);
      setVideoDetails(details);

      const result = await enhanceSeo({
        title: details.title,
        description: details.description,
        tags: details.tags || [],
        region: values.region,
      });

      setAnalysisResult(result);
      setIsResultOpen(true);
      localStorage.setItem(LOCAL_STORAGE_KEY_RESULT, JSON.stringify(result));
      localStorage.setItem(LOCAL_STORAGE_KEY_DETAILS, JSON.stringify(details));
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
          <TrendingUp className="h-10 w-10 text-primary" />
          YouTube SEO
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Boost your video's ranking with AI-powered SEO analysis and suggestions.
        </p>
      </header>

      <div className="mb-8">
        <AdPlaceholder adKey="global-ad-script" />
      </div>

      <main className="space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  Analyze Your Video
                </CardTitle>
                <CardDescription>
                  Enter a YouTube video URL and select a target region for analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="youtubeUrl"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>YouTube Video URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Region</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select a region" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                  )}
                  Analyze & Enhance SEO
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
           <Card className="mt-8">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Skeleton className="h-24 w-full" />
                 <Skeleton className="h-24 w-full" />
              </div>
               <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        )}
        
        {analysisResult && videoDetails && (
          <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-6xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">
                  AI SEO Analysis & Suggestions
                </DialogTitle>
                <DialogDescription>
                  Based on trends for{' '}
                  <span className="font-semibold text-primary">
                    {countries.find((c) => c.code === form.getValues('region'))?.name}
                  </span>
                  .
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-lg bg-secondary/50 p-6">
                    <ScoreDisplay score={analysisResult.initialScore} label="Initial SEO Score" />
                    <ScoreDisplay score={analysisResult.enhancedScore} label="Enhanced SEO Score" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-headline text-xl font-semibold">Current SEO Analysis</h3>
                      <p className="text-sm text-muted-foreground">{analysisResult.analysis}</p>
                    </div>
                      <div className="space-y-4">
                      <h3 className="font-headline text-xl font-semibold">AI Reasoning</h3>
                      <p className="text-sm text-muted-foreground">{analysisResult.reasoning}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-headline text-lg font-semibold mb-2">
                      Trend Data Source
                    </h3>
                    {analysisResult.trendDataSource ? (
                      <p className="text-sm text-muted-foreground">
                        Suggestions are based on trends from{' '}
                        <a
                          href={analysisResult.trendDataSource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary underline hover:text-primary/80"
                        >
                          {analysisResult.trendDataSource.text}
                        </a>.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No specific trend data was available for this region. Suggestions are based on general SEO best practices.
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-8">
                    {/* Title */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Title Comparison</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold uppercase text-muted-foreground">Original</Label>
                          <p className="col-span-5 p-3 rounded-md bg-secondary text-sm">{videoDetails.title}</p>
                        </div>
                        <div className="flex justify-center">
                          <ArrowRight className="h-5 w-5 mx-auto text-primary hidden lg:block" />
                          <ArrowDown className="h-5 w-5 mx-auto text-primary lg:hidden" />
                        </div>
                        <div className="relative space-y-1">
                          <Label className="text-xs font-semibold uppercase text-primary">Suggestion</Label>
                          <p className="p-3 pr-12 rounded-md bg-primary/10 text-sm font-medium">{analysisResult.suggestions.title}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopy(analysisResult.suggestions.title, 'title')}
                            aria-label="Copy title"
                          >
                            {copiedField === 'title' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Description Comparison</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold uppercase text-muted-foreground">Original</Label>
                          <ScrollArea className="h-48 col-span-5 p-3 rounded-md bg-secondary text-sm"><p className="whitespace-pre-wrap">{videoDetails.description}</p></ScrollArea>
                        </div>
                        <div className="flex justify-center pt-8">
                          <ArrowRight className="h-5 w-5 mx-auto text-primary hidden lg:block" />
                          <ArrowDown className="h-5 w-5 mx-auto text-primary lg:hidden" />
                        </div>
                        <div className="relative space-y-1">
                          <Label className="text-xs font-semibold uppercase text-primary">Suggestion</Label>
                          <ScrollArea className="h-48 rounded-md bg-primary/10">
                            <p className="whitespace-pre-wrap p-3 pr-12 text-sm font-medium">{analysisResult.suggestions.description}</p>
                          </ScrollArea>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-10 h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopy(analysisResult.suggestions.description, 'description')}
                            aria-label="Copy description"
                          >
                            {copiedField === 'description' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Tags Comparison</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold uppercase text-muted-foreground">Original</Label>
                          <div className="p-3 rounded-md bg-secondary min-h-[10rem]">
                            <div className="flex flex-wrap gap-2">
                              {videoDetails.tags?.map((tag, i) => <Badge key={`current-${i}`} variant="secondary">{tag}</Badge>)}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center pt-8">
                          <ArrowRight className="h-5 w-5 mx-auto text-primary hidden lg:block" />
                          <ArrowDown className="h-5 w-5 mx-auto text-primary lg:hidden" />
                        </div>
                        <div className="relative space-y-1">
                          <Label className="text-xs font-semibold uppercase text-primary">Suggestion</Label>
                          <div className="p-3 pr-12 rounded-md bg-primary/10 min-h-[10rem]">
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.suggestions.tags.map((tag, i) => <Badge key={`new-${i}`} variant="default" className="bg-primary/80">{tag}</Badge>)}
                            </div>
                          </div>
                          <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopy(analysisResult.suggestions.tags.join(', '), 'tags')}
                              aria-label="Copy tags"
                          >
                              {copiedField === 'tags' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
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
