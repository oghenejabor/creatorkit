
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Sparkles,
  Store,
  Copy,
  Check,
  Download,
  TriangleAlert,
} from 'lucide-react';

import { generateAso, type GenerateAsoOutput } from '@/ai/flows/generate-aso';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LOCAL_STORAGE_KEY = "asoGeneratorResult";

const playStoreCategories = [
  'Art & Design', 'Auto & Vehicles', 'Beauty', 'Books & Reference', 'Business', 'Comics', 'Communication', 'Dating', 'Education', 'Entertainment', 'Events', 'Finance', 'Food & Drink', 'Health & Fitness', 'House & Home', 'Libraries & Demo', 'Lifestyle', 'Maps & Navigation', 'Medical', 'Music & Audio', 'News & Magazines', 'Parenting', 'Personalization', 'Photography', 'Productivity', 'Shopping', 'Social', 'Sports', 'Tools', 'Travel & Local', 'Video Players & Editors', 'Weather', 'Games'
];

const formSchema = z.object({
  appName: z.string().min(2, { message: 'App name must be at least 2 characters.' }),
  appDescription: z.string().min(20, { message: 'Please provide a description of at least 20 characters.' }),
  appCategory: z.string().nonempty({ message: 'Please select a category.' }),
  appType: z.enum(['main', 'affiliate']).default('main'),
});

type FormValues = z.infer<typeof formSchema>;

const ResultSection = ({
  title,
  content,
  onCopy,
  isCopied,
  onDownload,
}: {
  title: string;
  content: string;
  onCopy: () => void;
  isCopied: boolean;
  onDownload?: () => void;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
      <div className="flex items-center gap-2">
        {onDownload && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDownload}>
            <Download className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy}>
          {isCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-auto max-h-64 rounded-md bg-secondary p-3">
        <p className="text-sm text-secondary-foreground whitespace-pre-wrap">{content}</p>
      </ScrollArea>
    </CardContent>
  </Card>
);

export default function AsoGeneratorPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [asoResult, setAsoResult] = useState<GenerateAsoOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedResult) {
        setAsoResult(JSON.parse(savedResult));
        setIsResultOpen(true);
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appName: '',
      appDescription: '',
      appCategory: '',
      appType: 'main',
    },
  });

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownload = () => {
    if (!asoResult) return;
    const blob = new Blob([asoResult.longDescription], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'long_description.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setAsoResult(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    try {
      const result = await generateAso({
        appName: values.appName,
        appDescription: values.appDescription,
        appCategory: values.appCategory,
        isAffiliateApp: values.appType === 'affiliate',
      });
      setAsoResult(result);
      setIsResultOpen(true);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
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
          <Store className="h-10 w-10 text-primary" />
          Google Play ASO Text Generator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Generate optimized titles and descriptions for your app instantly.
        </p>
      </header>

      <div className="mb-8">
        <AdPlaceholder adKey="global-ad-script" />
      </div>

      <main className="mx-auto max-w-4xl space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  Describe Your App
                </CardTitle>
                <CardDescription>
                  Provide some details about your app to get started. The more details you provide, the better the results.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="appName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Buy Labubu Online" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="appDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., An e-commerce app to browse and buy the latest Labubu collectible toys. Features include a wishlist, secure checkout, and new release notifications."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what your app does. The more detail, the better the ASO.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="appCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an app category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {playStoreCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="appType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>App Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="main" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Main App (A primary product or service)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="affiliate" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Affiliate App (Monetized via affiliate links)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
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
                  Generate ASO Text
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <div className="space-y-6 mt-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {asoResult && (
          <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Your ASO Results are Ready!</DialogTitle>
                <DialogDescription>
                  Copy, download, and use these assets for your Google Play Store listing.
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
                  {asoResult.generatedKeywords && asoResult.generatedKeywords.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">Generated Keywords</CardTitle>
                        <CardDescription>AI-suggested keywords based on your app. Use these in your ASO strategy.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {asoResult.generatedKeywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">{keyword}</Badge>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  <ResultSection
                    title="App Title"
                    content={asoResult.title}
                    onCopy={() => handleCopy(asoResult.title, 'title')}
                    isCopied={copiedField === 'title'}
                  />
                  <ResultSection
                    title="Short Description"
                    content={asoResult.shortDescription}
                    onCopy={() => handleCopy(asoResult.shortDescription, 'shortDescription')}
                    isCopied={copiedField === 'shortDescription'}
                  />
                  <ResultSection
                    title="Full Description"
                    content={asoResult.longDescription}
                    onCopy={() => handleCopy(asoResult.longDescription, 'longDescription')}
                    isCopied={copiedField === 'longDescription'}
                    onDownload={handleDownload}
                  />
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
