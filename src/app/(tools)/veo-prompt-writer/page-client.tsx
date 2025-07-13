
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, TriangleAlert, Copy, Check, Clapperboard } from 'lucide-react';
import * as z from 'zod';

import { generateVeoPrompt, type GenerateVeoPromptOutput } from '@/ai/flows/generate-veo-prompt';
import { VeoPromptCategorySchema } from '@/ai/flows/veo-prompt-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const LOCAL_STORAGE_KEY = "veoPromptResult";

const categories = VeoPromptCategorySchema.enum;

const examplePlaceholders: Record<string, string> = {
  'Street Interview': 'A stylish, elegant elderly woman with white curly hair, sunglasses, and a tweed jacket, adorned with a pearl necklace, sits holding a pink designer handbag. She is being interviewed on an outdoor street by a young man in a light blue shirt, holding a microphone.',
  'Bigfoot': 'A tall, hairy Bigfoot stood in front of a modern bank counter. It wore a pair of flesh-colored pantyhose on its head and held a green water gun on the table.',
  'Consistent Characters': 'A female reporter in a red rain jacket holds a microphone, reporting to the camera in an outdoor, stormy setting with a clothesline in the background. Absurdly, an elderly woman in colorful pajamas is suspended from the clothesline, wildly flailing and swinging in the strong wind.',
  'Environment': 'A baby kitten nibbling on tender raw chicken breast fillets. The kitten chews slowly, making moist ASMR chewing sounds with occasional tiny meows and sniffles.',
  'Dialogue': 'A realistic, anthropomorphic gorilla wearing a green military-style jacket appears to be filming itself in a lush forest. It then turns to a young blonde woman in a blue denim shirt, who is sitting on a rock.',
  'Drone Footage - Nature': 'An aerial shot flying over a massive waterfall in the Amazon rainforest.',
  'Cinematic Apartment Tour': 'A walkthrough of a minimalist apartment in Tokyo at sunset, with soft jazz music.',
  'Found Footage': 'Handheld camera first view of a big green eyed alien crashing and spitting into the camera, his boss must be pissed because he accidentally crashed the UFO, the camera pans to the burning UFO',
};

const formSchema = z.object({
  category: VeoPromptCategorySchema,
  sceneCount: z.coerce.number().min(1).max(5),
  idea: z.string().min(10, { message: 'Please provide an idea of at least 10 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function VeoPromptWriterPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateVeoPromptOutput | null>(null);
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
    defaultValues: {
      category: 'Street Interview',
      sceneCount: 1,
      idea: '',
    },
  });
  
  const selectedCategory = form.watch('category');

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.veoPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    try {
      const res = await generateVeoPrompt(values);
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
          <Clapperboard className="h-10 w-10 text-primary" />
          Veo Prompt Writer
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Generate high-quality, detailed prompts for video AI models.</p>
      </header>

      <div className="mb-8"><AdPlaceholder adKey="global-ad-script" /></div>

      <main className="mx-auto max-w-4xl space-y-8">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Craft Your Prompt</CardTitle>
                <CardDescription>Select a category and write a simple idea. The AI will expand it into a detailed prompt.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a prompt category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(categories).map(category => (
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
                    name="sceneCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Scenes</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select number of scenes" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(count => (
                              <SelectItem key={count} value={String(count)}>{count}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="idea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Idea</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={`e.g., ${examplePlaceholders[selectedCategory] || ''}`}
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                       <FormDescription>
                        Describe the scene, character, or dialogue you want to create.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} size="lg">
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Write Prompt
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <div className="mt-8"><Skeleton className="h-64 w-full" /></div>
        )}

        {result && (
          <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                 <DialogTitle className="text-2xl font-headline">Generated Veo Prompt</DialogTitle>
                <div className="flex justify-between items-center">
                    <DialogDescription>Your detailed prompt is ready. Copy it and use it with your video AI model.</DialogDescription>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="mr-2 h-4 w-4 text-primary" /> : <Copy className="mr-2 h-4 w-4" />}
                        Copy Prompt
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
                <p className="font-medium whitespace-pre-wrap">{result.veoPrompt}</p>
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
