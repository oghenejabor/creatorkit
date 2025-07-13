
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Sparkles,
  Languages,
  TriangleAlert,
  Copy,
  Check,
  ChevronsUpDown,
} from 'lucide-react';

import { translateAppMetadata, type TranslateAppMetadataOutput } from '@/ai/flows/translate-app-metadata';
import { supportedLanguages } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const LOCAL_STORAGE_KEY = "metadataTranslatorResult";

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }).max(30, { message: 'Title must be 30 characters or less.' }),
  shortDescription: z.string().min(10, { message: 'Short description must be at least 10 characters.' }).max(80, { message: 'Short description must be 80 characters or less.' }),
  longDescription: z.string().min(50, { message: 'Long description must be at least 50 characters.' }).max(4000, { message: 'Long description must be 4000 characters or less.' }),
  languages: z.array(z.string()).refine(value => value.length > 0, { message: 'Please select at least one language.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AppMetadataTranslatorPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslateAppMetadataOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedResult) {
        setTranslationResult(JSON.parse(savedResult));
        setIsResultOpen(true);
      }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', shortDescription: '', longDescription: '', languages: [] },
  });

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setTranslationResult(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    try {
      const result = await translateAppMetadata(values);
      setTranslationResult(result);
      setIsResultOpen(true);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
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
          <Languages className="h-10 w-10 text-primary" />
          One-Tap App Metadata Translator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Translate your app's Title and Descriptions into 10+ languages instantly.</p>
      </header>

      <div className="mb-8"><AdPlaceholder adKey="global-ad-script" /></div>

      <main className="mx-auto max-w-4xl space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Enter Your English Metadata</CardTitle>
                <CardDescription>Provide your current Google Play Store metadata. The AI will handle the translation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Languages to Translate To</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value.length && "text-muted-foreground"
                              )}
                            >
                              {field.value.length > 0
                                ? `${field.value.length} language${field.value.length > 1 ? 's' : ''} selected`
                                : "Select languages"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search languages..." />
                            <CommandEmpty>No language found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {Object.entries(supportedLanguages).map(([code, name]) => (
                                  <CommandItem
                                    value={name}
                                    key={code}
                                    onSelect={() => {
                                      const selected = field.value.includes(code)
                                        ? field.value.filter((c) => c !== code)
                                        : [...field.value, code];
                                      field.onChange(selected);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value.includes(code) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                       <div className="pt-2">
                        {field.value.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {field.value.map((code) => (
                              <Badge variant="secondary" key={code}>
                                {supportedLanguages[code as keyof typeof supportedLanguages]}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Title</FormLabel>
                      <FormControl><Input placeholder="Your Awesome App" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl><Textarea placeholder="A catchy one-liner about your app." {...field} rows={2} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Long Description</FormLabel>
                      <FormControl><Textarea placeholder="A full, detailed description of your app's features and benefits." {...field} rows={8} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Translate Metadata
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <div className="mt-8"><Skeleton className="h-64 w-full" /></div>
        )}

        {translationResult && (
          <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Your Translations are Ready!</DialogTitle>
                <DialogDescription>Review and copy the localized metadata for your app store listing.</DialogDescription>
              </DialogHeader>
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  AI can make mistakes, so double-check it.
                </AlertDescription>
              </Alert>
              <div className="flex-grow overflow-y-auto pr-4 -mr-4 mt-4">
                <Accordion type="single" collapsible className="w-full">
                  {translationResult.translations.map((data, index) => (
                    <AccordionItem value={data.languageCode} key={index}>
                      <AccordionTrigger className="font-medium text-lg">{data.languageName}</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        {(['title', 'shortDescription', 'longDescription'] as const).map(field => (
                          <div key={field}>
                            <div className="flex justify-between items-center mb-1">
                              <Label className="capitalize text-sm font-semibold">{field.replace('Description', ' Desc.')}</Label>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(data[field], `${data.languageCode}-${field}`)}>
                                {copiedField === `${data.languageCode}-${field}` ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            <ScrollArea className="max-h-48 rounded-md bg-secondary p-3">
                              <p className="text-sm text-secondary-foreground whitespace-pre-wrap">{data[field]}</p>
                            </ScrollArea>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
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
