
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Sparkles,
  Download,
  Palette,
  TriangleAlert,
} from 'lucide-react';

import { generateAppIcon, type GenerateAppIconOutput } from '@/ai/flows/generate-app-icon';
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
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LOCAL_STORAGE_KEY = "appIconResult";

const formSchema = z.object({
  appName: z.string().min(2, { message: 'App name must be at least 2 characters.' }),
  iconDescription: z.string().min(10, { message: 'Please provide a description of at least 10 characters.' }),
  primaryColor: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ImageResultCard = ({
  imageDataUri,
  index,
}: {
  imageDataUri: string;
  index: number;
}) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg font-medium">Option {index + 1}</CardTitle>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={imageDataUri} download={`app-icon-option-${index + 1}.png`}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div
        className='w-full overflow-hidden rounded-lg bg-secondary relative aspect-square'
      >
        <Image
          src={imageDataUri}
          alt={`App icon option ${index + 1}`}
          layout="fill"
          objectFit="cover"
        />
      </div>
    </CardContent>
  </Card>
);


export default function AppIconGeneratorPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [iconResult, setIconResult] = useState<GenerateAppIconOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedResult) {
        setIconResult(JSON.parse(savedResult));
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
      iconDescription: '',
      primaryColor: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setIconResult(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    try {
      const result = await generateAppIcon({
        appName: values.appName,
        iconDescription: values.iconDescription,
        primaryColor: values.primaryColor
      });
      setIconResult(result);
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
          <Palette className="h-10 w-10 text-primary" />
          AI App Icon Generator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Design a stunning 512x512 app icon in seconds.
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
                  Describe Your Icon
                </CardTitle>
                <CardDescription>
                  Provide details about your app and icon concept. The more specific you are, the better the results.
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
                        <Input placeholder="e.g., CreatorKit AI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="iconDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., A minimalist logo featuring a sparkling magic wand creating a thumbnail. Use a flat design style with clean lines. The main colors should be purple and pink."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the icon's style, subject, and feeling.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap items-center gap-2">
                            {['#9C27B0', '#E91E63', '#3B82F6', '#22C55E', '#EAB308', '#F97316'].map((color) => (
                              <Button
                                key={color}
                                type="button"
                                variant="outline"
                                className={cn(
                                  "h-8 w-8 rounded-full p-0 border-2",
                                  field.value === color
                                    ? "border-primary"
                                    : "border-input"
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                                aria-label={`Select color ${color}`}
                              />
                            ))}
                            <Input
                              className="w-28"
                              placeholder="#HEX"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </div>
                        </FormControl>
                         <FormDescription>
                          Pick a main color or enter a custom HEX code to guide the AI.
                        </FormDescription>
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
                  Generate 3 Icons
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <div className="space-y-6 mt-8">
            <h2 className="text-center font-headline text-2xl font-bold">Generating Icons...</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="aspect-square w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {iconResult && (
          <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Your App Icons are Ready!</DialogTitle>
                <DialogDescription>
                  Here are 3 unique app icons generated by AI. Download your favorite.
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {iconResult?.icons.map((iconUri, index) => (
                    <ImageResultCard
                      key={index}
                      imageDataUri={iconUri}
                      index={index}
                    />
                  ))}
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
