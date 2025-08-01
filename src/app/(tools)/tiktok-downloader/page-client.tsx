'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Download, TriangleAlert, Link as LinkIcon, AlertCircle } from 'lucide-react';

import { getTikTokVideoDetails, type TikTokVideoDetails } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }).refine(
    (url) => /tiktok\.com/.test(url),
    'Please enter a valid TikTok URL.'
  ),
});

type FormValues = z.infer<typeof formSchema>;

const TiktokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16" className="h-10 w-10 text-primary">
        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
    </svg>
);

export default function TiktokDownloaderPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TikTokVideoDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await getTikTokVideoDetails(values.url);
      if (res.success) {
        setResult(res);
      } else {
        setError(res.message || 'An unknown error occurred.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: errorMessage,
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
          TikTok Video Downloader
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Download TikTok videos without watermarks.</p>
      </header>

      <div className="mb-8"><AdPlaceholder adKey="global-ad-script" /></div>

      <main className="mx-auto max-w-4xl space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Enter TikTok URL</CardTitle>
                <CardDescription>Paste the URL of the TikTok video you want to download.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TikTok Video URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="https://www.tiktok.com/@..." {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                  Download Video
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {error && (
            <Alert variant="destructive" className="mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {result?.success && result.downloadUrl && (
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Your Video is Ready!</CardTitle>
                    <CardDescription>Video by @{result.author_name || 'Unknown'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden bg-black relative">
                        <video
                            key={result.downloadUrl}
                            src={result.downloadUrl}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                        >
                          Your browser does not support the video tag.
                        </video>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button asChild size="lg" className="w-full">
                        <a href={result.downloadUrl} download={`${result.domain}-tiktok-${result.id}.mp4`}>
                            <Download className="mr-2 h-5 w-5" />
                            Download MP4
                        </a>
                    </Button>
                    <Alert>
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>Notice</AlertTitle>
                        <AlertDescription>
                            Please respect copyright and the creator's rights. Do not re-upload content without permission.
                        </AlertDescription>
                    </Alert>
                </CardFooter>
            </Card>
        )}
        <AdPlaceholder adKey="global-ad-script" />
      </main>
    </div>
  );
}
