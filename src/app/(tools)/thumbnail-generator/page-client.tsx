
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Download,
  X,
  Youtube,
  Info,
  TriangleAlert,
} from "lucide-react";

import { getVideoDetails } from "@/app/actions";
import { generateThumbnailPrompt } from "@/ai/flows/generate-thumbnail-prompt";
import { generateThumbnail } from "@/ai/flows/generate-thumbnail";
import { suggestOverlayText } from "@/ai/flows/suggest-overlay-text";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { AdPlaceholder } from "@/components/common/ad-placeholder";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LOCAL_STORAGE_KEY = "thumbnailGeneratorResult";

const formSchema = z.object({
  youtubeUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .refine((url) => /(?:youtube\.com|youtu\.be)/.test(url), {
      message: "Please enter a valid YouTube URL.",
    }),
  face: z.any().optional(),
  textOverlay: z
    .string()
    .max(50, "Text overlay should not exceed 50 characters.")
    .optional(),
  fontFamily: z.string().optional(),
  fontSize: z.number().optional(),
  fontColor: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ThumbnailGeneratorPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(
    null
  );
  const [videoDetails, setVideoDetails] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedResult = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedResult) {
        setGeneratedThumbnail(JSON.parse(savedResult));
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: "",
      textOverlay: "",
      fontFamily: "Impact",
      fontSize: 64,
      fontColor: "#FFFF00",
    },
  });

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 2MB.",
        });
        return;
      }
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PNG or JPG image.",
        });
        return;
      }
      form.setValue("face", file);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setFacePreview(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFaceImage = () => {
    setFacePreview(null);
    form.setValue("face", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setGeneratedThumbnail(null);
    setVideoDetails(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    try {
      const details = await getVideoDetails(values.youtubeUrl);
      setVideoDetails(details);

      let faceDataUri: string | undefined = undefined;
      if (values.face) {
        faceDataUri = await fileToDataUri(values.face);
      }

      let overlayText = values.textOverlay;
      if (!overlayText) {
        const { textOverlay: suggestedText } = await suggestOverlayText({
          title: details.title,
          description: details.description,
        });
        overlayText = suggestedText;
        form.setValue("textOverlay", overlayText, { shouldValidate: true });
      }

      const { prompt } = await generateThumbnailPrompt({
        title: details.title,
        description: details.description,
        faceDataUri,
        textOverlay: overlayText,
        fontFamily: values.fontFamily,
        fontSize: values.fontSize,
        fontColor: values.fontColor,
      });

      const { thumbnailDataUri } = await generateThumbnail({
        prompt,
        faceDataUri,
      });

      setGeneratedThumbnail(thumbnailDataUri);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(thumbnailDataUri));

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="font-headline flex items-center justify-center gap-3 text-4xl font-bold md:text-5xl">
          <ImageIcon className="h-10 w-10 text-primary" />
          AI Thumbnail Generator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Create stunning YouTube thumbnails with the power of AI
        </p>
      </header>

      <div className="mb-8">
        <AdPlaceholder adKey="global-ad-script" />
      </div>

      <main className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  1. Enter YouTube URL
                </CardTitle>
                <CardDescription>
                  Enter your YouTube video URL to fetch its details
                  automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="youtubeUrl"
                  render={({ field }) => (
                    <FormItem>
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

                {videoDetails && (
                  <Card className="bg-secondary/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="h-5 w-5" />
                        Fetched Video Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="font-semibold text-foreground">
                        {videoDetails.title}
                      </p>
                      <p className="max-h-24 overflow-y-auto text-muted-foreground">
                        {videoDetails.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2 pt-6 border-t">
                  <h3 className="text-lg font-medium text-foreground">
                    2. Customize Thumbnail
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add a face, customize text, or let the AI handle it all.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="textOverlay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overlay Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Leave blank for AI suggestion"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Family</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a font" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Impact">Impact</SelectItem>
                            <SelectItem value="Arial Black">
                              Arial Black
                            </SelectItem>
                            <SelectItem value="Bangers">Bangers</SelectItem>
                            <SelectItem value="Creepster">Creepster</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Size: {field.value || 64}px</FormLabel>
                        <FormControl>
                          <Slider
                            value={[field.value || 64]}
                            min={24}
                            max={128}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fontColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Font Color</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            "#FFFFFF",
                            "#000000",
                            "#FFD700",
                            "#FF4136",
                            "#0074D9",
                            "#2ECC40",
                          ].map((color) => (
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
                            placeholder="#FFFF00"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="face"
                  render={() => (
                    <FormItem className="pt-6 border-t">
                      <FormLabel>Optional Face Upload</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <label
                            htmlFor="face-upload"
                            className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-6 text-center transition-colors hover:border-primary hover:bg-secondary"
                          >
                            {facePreview ? (
                              <>
                                <Image
                                  src={facePreview}
                                  alt="Face preview"
                                  width={128}
                                  height={128}
                                  className="h-32 w-32 rounded-lg object-cover"
                                />
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Click to change image
                                </p>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="mb-2 h-10 w-10 text-muted-foreground" />
                                <span className="font-semibold">
                                  Click to upload a face
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  PNG or JPG (MAX. 2MB)
                                </p>
                              </>
                            )}
                          </label>
                          <Input
                            id="face-upload"
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg"
                            className="sr-only"
                            onChange={handleFaceUpload}
                          />
                          {facePreview && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -right-2 -top-2 h-7 w-7 rounded-full"
                              onClick={removeFaceImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Personalize your thumbnail by adding a face. For best results, use a high-resolution image. The final thumbnail will be generated at the recommended YouTube size of 1280x720px.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                  variant="default"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Thumbnail
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="sticky top-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                3. Your AI Thumbnail
              </CardTitle>
              <CardDescription>
                Your 1280x720 thumbnail will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary">
                {isLoading && !generatedThumbnail && (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                    <Skeleton className="h-full w-full" />
                    <p className="absolute text-center font-medium text-muted-foreground">
                      AI is thinking... this may take a moment.
                    </p>
                  </div>
                )}
                {!isLoading && generatedThumbnail && (
                  <Image
                    src={generatedThumbnail}
                    alt="Generated thumbnail"
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="generated thumbnail"
                  />
                )}
                {!isLoading && !generatedThumbnail && (
                  <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-16 w-16" />
                    <p className="mt-2 text-center font-medium">
                      Your generated thumbnail will be displayed here
                    </p>
                  </div>
                )}
                 {isLoading && generatedThumbnail && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                     <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
               {generatedThumbnail && (
                 <Alert className="mt-4">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>
                    AI can make mistakes, so double-check it.
                  </AlertDescription>
                </Alert>
               )}
            </CardContent>
            {generatedThumbnail && !isLoading && (
              <CardFooter>
                <Button
                  asChild
                  size="lg"
                  className="w-full"
                  variant="secondary"
                >
                  <a href={generatedThumbnail} download="thumbnail.png">
                    <Download className="mr-2 h-5 w-5" />
                    Download Thumbnail
                  </a>
                </Button>
              </CardFooter>
            )}
          </Card>
           <AdPlaceholder adKey="global-ad-script" />
        </div>
      </main>
    </div>
  );
}
