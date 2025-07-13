
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UploadCloud,
  Download,
  Loader2,
  Sparkles,
  TextQuote,
  ArrowLeft,
  User,
  Newspaper,
  Clapperboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  image: z.any().refine((file) => file, 'Please upload the main image.'),
  secondaryImage: z.any().optional(),
  primaryText: z.string().max(280, 'Primary text cannot exceed 280 characters.').optional(),
  secondaryText: z.string().max(80, 'Secondary text cannot exceed 80 characters.').optional(),
  tertiaryText: z.string().max(80, 'Tertiary text cannot exceed 80 characters.').optional(),
  fontFamily: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  bannerColor: z.string().optional(),
  backgroundColor: z.string().optional(),
});


type FormValues = z.infer<typeof formSchema>;

const fontFamilies = [
  { name: 'Anton', family: 'Anton, sans-serif' },
  { name: 'Oswald', family: 'Oswald, sans-serif' },
  { name: 'Bangers', family: 'Bangers, cursive' },
  { name: 'Bebas Neue', family: '"Bebas Neue", sans-serif' },
  { name: 'Archivo Black', family: '"Archivo Black", sans-serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif' },
  { name: 'Roboto', family: 'Roboto, sans-serif' },
  { name: 'Playfair Display', family: '"Playfair Display", serif' },
  { name: 'Creepster', family: 'Creepster, cursive' },
  { name: 'Impact', family: 'Impact, sans-serif' },
];

const templates = [
  {
    id: 'twitter-style',
    name: 'Tweet Style',
    icon: User,
    description: 'Create a social media post that looks like a tweet.',
    fields: {
      image: 'Main Image',
      secondaryImage: 'Profile Picture',
      primaryText: 'Tweet Text',
      secondaryText: 'Username',
      tertiaryText: 'Handle (e.g., @creatorkit)',
      backgroundColor: 'Background Color',
    },
  },
  {
    id: 'breaking-news',
    name: 'Breaking News',
    icon: Newspaper,
    description: 'A professional news graphic with a bold headline.',
    fields: {
      image: 'Background Image',
      primaryText: 'Headline (use *word* for color highlight)',
      secondaryText: 'Ticker Text (Optional)',
      fontFamily: 'Font',
      primaryColor: 'Primary Color',
      secondaryColor: 'Highlight Color',
      bannerColor: 'Banner Color',
    },
  },
  {
    id: 'vlog-story',
    name: 'Vlog Story',
    icon: Clapperboard,
    description: 'A dramatic story-style image with a large, responsive headline.',
    fields: {
      image: 'Main Image',
      secondaryImage: 'Inset Story Image',
      primaryText: 'Headline (use *word* for highlight)',
      secondaryText: 'Vlog/Channel Name',
      fontFamily: 'Headline Font',
      primaryColor: 'Border/Box Color',
      secondaryColor: 'Text Highlight Color',
    },
  },
];

type Template = typeof templates[0];

// --- Canvas Drawing Helpers ---

const drawMultiColorWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  initialFontSize: number,
  lineHeightRatio: number,
  font: string,
  primaryColor: string,
  secondaryColor: string,
  textAlign: 'left' | 'center' | 'right' = 'left',
  verticalAlign: 'top' | 'middle' | 'bottom' = 'middle'
) => {
  const wordSegments = text.split(' ').map(word => {
    if (word.startsWith('*') && word.endsWith('*') && word.length > 2) {
      return { text: word.slice(1, -1), color: secondaryColor };
    }
    return { text: word, color: primaryColor };
  });

  let fontSize = initialFontSize;
  let finalLines: { text: string; color: string }[][] = [];

  while (fontSize > 10) {
    ctx.font = `bold ${fontSize}px ${font}`;
    let lines: { text: string; color: string }[][] = [];
    let currentLine: { text: string; color: string }[] = [];
    let currentLineText = '';

    for (const segment of wordSegments) {
      const testLine = currentLineText ? `${currentLineText} ${segment.text}` : segment.text;
      if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [segment];
        currentLineText = segment.text;
      } else {
        currentLine.push(segment);
        currentLineText = testLine;
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    if (lines.length * (fontSize * lineHeightRatio) <= maxHeight) {
      finalLines = lines;
      break;
    }

    fontSize -= 2;
  }

  const lineHeight = fontSize * lineHeightRatio;
  const totalTextHeight = finalLines.length * lineHeight;
  let startY;

  if (verticalAlign === 'middle') {
    startY = y - totalTextHeight / 2;
  } else if (verticalAlign === 'bottom') {
    startY = y - totalTextHeight + (lineHeight - fontSize) / 2; 
  } else {
    startY = y;
  }

  ctx.font = `bold ${fontSize}px ${font}`;
  ctx.textBaseline = 'middle';

  finalLines.forEach((line, lineIndex) => {
    const lineText = line.map(s => s.text).join(' ');
    const totalWidth = ctx.measureText(lineText).width;
    let currentX;

    if (textAlign === 'center') {
      currentX = x - totalWidth / 2;
    } else if (textAlign === 'right') {
      currentX = x - totalWidth;
    } else {
      currentX = x;
    }
    
    const currentLineY = startY + (lineIndex * lineHeight) + (lineHeight / 2);

    line.forEach((segment, segmentIndex) => {
      ctx.fillStyle = segment.color;
      
      const segmentText = segment.text + (segmentIndex < line.length - 1 ? ' ' : '');
      ctx.fillText(segmentText, currentX, currentLineY);
      currentX += ctx.measureText(segmentText).width;
    });
  });
};


const drawImageWithCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number) => {
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    let sx, sy, sWidth, sHeight;

    if (imgRatio > canvasRatio) { 
        sHeight = img.height;
        sWidth = sHeight * canvasRatio;
        sx = (img.width - sWidth) / 2;
        sy = 0;
    } else { 
        sWidth = img.width;
        sHeight = sWidth / canvasRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
    }
    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);
}

const drawVerifiedBadge = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const path = new Path2D("M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.67-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.33c-.46 1.4-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.33-2.19c1.4.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.66 2.19-1.9 2.19-3.33zm-8.66 4.63l-3.29-3.29a.996.996 0 010-1.41l.04-.04a.996.996 0 011.41 0L12 11.59l5.91-5.91a.996.996 0 011.41 0l.04.04a.996.996 0 010 1.41l-6.58 6.58a.996.996 0 01-1.41 0z");
    ctx.save();
    ctx.fillStyle = '#1DA1F2';
    ctx.translate(x, y);
    ctx.scale(1.5, 1.5);
    ctx.fill(path);
    ctx.restore();
}

const wrapTweetText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, maxHeight: number, color: string) => {
    let fontSize = 48; // Max font size

    while (fontSize > 16) { // Min font size
      const lineHeight = fontSize * 1.25;
      ctx.font = `normal ${fontSize}px Inter`;
      const words = text.split(' ');
      let line = '';
      let lineCount = 1;

      for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
          lineCount++;
          line = word + ' ';
        } else {
          line = testLine;
        }
      }

      if (lineCount * lineHeight <= maxHeight) break;
      fontSize -= 2; 
    }

    const lineHeight = fontSize * 1.25;
    ctx.font = `normal ${fontSize}px Inter`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (const word of words) {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
};

// --- Main Components ---

const GeneratorUI = ({ template, onBack }: { template: Template, onBack: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      primaryText: '', 
      secondaryText: '', 
      tertiaryText: '',
      fontFamily: 'Anton',
      primaryColor: '#D92121', // Red
      secondaryColor: '#FFFF00', // Yellow
      bannerColor: '#D92121',
      backgroundColor: '#000000',
    },
  });

  const watchAllFields = form.watch();

  const fileToImage = (file: File): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
              const img = new window.Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = event.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  };

  const generateImage = async (values: FormValues) => {
    setIsLoading(true);
    setGeneratedImage(null);

    const canvas = canvasRef.current;
    if (!canvas) {
      toast({ variant: 'destructive', title: 'Error', description: 'Canvas not ready.' });
      setIsLoading(false);
      return;
    }
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
        toast({ variant: 'destructive', title: 'Error', description: 'Canvas context not available.' });
        setIsLoading(false);
        return;
    }

    try {
        const mainImg = await fileToImage(values.image);
        const secondaryImg = values.secondaryImage ? await fileToImage(values.secondaryImage) : null;
        
        // --- Template-specific drawing logic ---
        
        if (template.id === 'twitter-style') {
            const bgColor = values.backgroundColor || '#000000';
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const PADDING = 60;
            const primaryTextColor = bgColor === '#FFFFFF' ? '#0F172A' : '#FFFFFF';
            const secondaryTextColor = bgColor === '#FFFFFF' ? '#64748B' : '#8899A6';
            
            // --- Profile Picture ---
            const pfpX = PADDING;
            const pfpY = PADDING;
            const pfpSize = 100;

            if (secondaryImg) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(pfpX + pfpSize / 2, pfpY + pfpSize / 2, pfpSize / 2, 0, Math.PI * 2, true);
              ctx.clip();
              drawImageWithCover(ctx, secondaryImg, pfpX, pfpY, pfpSize, pfpSize);
              ctx.restore();
            }
            
            // --- User Info ---
            ctx.fillStyle = primaryTextColor;
            ctx.font = 'bold 48px Inter';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            const username = values.secondaryText || 'CreatorKit AI';
            const handle = values.tertiaryText || '@creatorkit_ai';
            const usernameWidth = ctx.measureText(username).width;
            ctx.fillText(username, PADDING + 120, PADDING);
            
            drawVerifiedBadge(ctx, PADDING + 120 + usernameWidth + 10, PADDING + 8);
            
            ctx.fillStyle = secondaryTextColor;
            ctx.font = '40px Inter';
            ctx.fillText(handle, PADDING + 120, PADDING + 55);

            // --- Main Image ---
            const imgX = PADDING;
            const imgY = 400;
            const imgWidth = canvas.width - PADDING * 2;
            const imgHeight = canvas.height - imgY - PADDING;
            
            ctx.save();
            const cornerRadius = 20;
            ctx.beginPath();
            ctx.moveTo(imgX + cornerRadius, imgY);
            ctx.lineTo(imgX + imgWidth - cornerRadius, imgY);
            ctx.quadraticCurveTo(imgX + imgWidth, imgY, imgX + imgWidth, imgY + cornerRadius);
            ctx.lineTo(imgX + imgWidth, imgY + imgHeight - cornerRadius);
            ctx.quadraticCurveTo(imgX + imgWidth, imgY + imgHeight, imgX + imgWidth - cornerRadius, imgY + imgHeight);
            ctx.lineTo(imgX + cornerRadius, imgY + imgHeight);
            ctx.quadraticCurveTo(imgX, imgY + imgHeight, imgX, imgY + imgHeight - cornerRadius);
            ctx.lineTo(imgX, imgY + cornerRadius);
            ctx.quadraticCurveTo(imgX, imgY, imgX + cornerRadius, imgY);
            ctx.closePath();
            ctx.clip();
            
            drawImageWithCover(ctx, mainImg, imgX, imgY, imgWidth, imgHeight);
            ctx.restore();
            
            // --- Tweet Text ---
            const textStartY = PADDING + 150;
            const textMaxHeight = imgY - textStartY - 20;
            wrapTweetText(ctx, values.primaryText || "This is a sample tweet generated with CreatorKit AI!", PADDING, textStartY, canvas.width - (PADDING * 2), textMaxHeight, primaryTextColor);

        } else if (template.id === 'breaking-news') {
            drawImageWithCover(ctx, mainImg, 0, 0, canvas.width, canvas.height);
            const headline = values.primaryText || "AI CREATES *STUNNING* IMAGES";
            const ticker = values.secondaryText || "BREAKING NEWS";
            const font = values.fontFamily || "Anton";
            const primaryColor = values.primaryColor || "#FFFFFF";
            const secondaryColor = values.secondaryColor || "#FFFF00";
            const bannerColor = values.bannerColor || "#D92121";
            
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 750, 1080, 180);

            drawMultiColorWrappedText(ctx, headline, 540, 840, 1000, 160, 120, 1.1, font, primaryColor, secondaryColor, 'center', 'middle');
            
            ctx.fillStyle = bannerColor;
            ctx.fillRect(0, 930, 1080, 150);
            
            ctx.font = 'bold 48px Oswald';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            const tickerY = 1005;
            ctx.fillText(ticker.toUpperCase(), 40, tickerY);
        } else if (template.id === 'vlog-story') {
            const headline = values.primaryText || 'THIS IS A LONG HEADLINE THAT WILL *WRAP AND RESIZE* TO FIT THE CONTAINER PERFECTLY';
            const vlogTitle = values.secondaryText || 'NAIJABOSS VLOG';
            const primaryColor = values.primaryColor || '#D92121';
            const highlightColor = values.secondaryColor || '#FFFF00';
            const font = values.fontFamily || 'Archivo Black';
            const titleFont = "bold 40px 'Archivo Black'";

            // 1. Black background & red borders
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = primaryColor;
            ctx.fillRect(0, 0, 1080, 20); // Top border
            ctx.fillRect(0, 1060, 1080, 20); // Bottom border

            // 2. Main Image
            drawImageWithCover(ctx, mainImg, 0, 20, 1080, 630);

            // 3. Vlog Title
            ctx.font = titleFont;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            // Add a shadow for better readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            const titleX = 55;
            const titleY = 615;
            ctx.fillText(vlogTitle.toUpperCase(), titleX, titleY);
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // 4. Inset circular image
            if (secondaryImg) {
                const insetX = 850;
                const insetY = 580;
                const insetRadius = 120;
                const insetBorder = 15;
                ctx.save();
                ctx.beginPath();
                ctx.arc(insetX, insetY, insetRadius, 0, Math.PI * 2);
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = insetBorder;
                ctx.stroke();
                ctx.clip();
                drawImageWithCover(ctx, secondaryImg, insetX - insetRadius, insetY - insetRadius, insetRadius * 2, insetRadius * 2);
                ctx.restore();
            }

            // 5. Responsive Headline Text
            const insetImageBottomY = 580 + 120; // 700
            const bottomContainerY = insetImageBottomY; // Start below inset image
            const bottomContainerHeight = 1060 - bottomContainerY;
            const textCenterY = bottomContainerY + bottomContainerHeight / 2;
            const textPadding = 40;

            drawMultiColorWrappedText(
              ctx,
              headline.toUpperCase(),
              540, // center X
              textCenterY, // center Y
              canvas.width - textPadding * 2, // maxWidth
              bottomContainerHeight - textPadding, // maxHeight
              120, // initialFontSize
              1.1, // lineHeightRatio
              font, // Use selected font
              '#FFFFFF', // primaryColor
              highlightColor, // secondaryColor
              'center', // textAlign
              'middle' // verticalAlign
            );
        }

        setGeneratedImage(canvas.toDataURL('image/png'));
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load images for canvas. Please ensure you upload an image.' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
     if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `${template.id}-generated-image.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const renderFormField = (fieldName: string, fieldType: string) => {
      const fieldKey = fieldName as keyof FormValues;
      const label = template.fields[fieldKey as keyof typeof template.fields];

      if (!label) return null;

      if (fieldType === 'image' || fieldType === 'secondaryImage') {
        const previewSrc = fieldType === 'image' ? watchAllFields.image : watchAllFields.secondaryImage;
        return (
            <FormField
                control={form.control}
                name={fieldKey}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                            />
                        </FormControl>
                        {template.id === 'twitter-style' && fieldType === 'image' && (
                          <FormDescription>
                            For the best results, use an image with a 16:9 aspect ratio (e.g., 1280x720px).
                          </FormDescription>
                        )}
                        {previewSrc && typeof previewSrc !== 'string' && (
                          <Image
                            src={URL.createObjectURL(previewSrc)}
                            alt="preview"
                            width={80}
                            height={80}
                            className="mt-2 rounded-md object-cover"
                          />
                        )}
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
      }

      if (fieldType === 'fontFamily') {
        return (
          <FormField
            control={form.control}
            name={fieldKey}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fontFamilies.map(font => (
                      <SelectItem key={font.name} value={font.name} style={{fontFamily: font.family}}>{font.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      }
      
      if (fieldType.endsWith('Color')) {
        const colors =
          fieldType === 'bannerColor'
            ? ['#D92121', '#1E40AF', '#111827', '#047857']
            : ['#D92121', '#FFFF00', '#FFFFFF', '#000000', '#3B82F6', '#E91E63'];
        return (
          <FormField
            control={form.control}
            name={fieldKey}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap items-center gap-2">
                    {colors.map((color) => (
                      <Button
                        key={color}
                        type="button"
                        variant="outline"
                        className={cn("h-8 w-8 rounded-full p-0 border-2", field.value === color ? "border-primary" : "border-input")}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                    <Input className="w-28" placeholder="#HEX" {...field} value={field.value ?? ""} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      }

      if (fieldType === 'backgroundColor') {
        return (
          <FormField
            control={form.control}
            name="backgroundColor"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center gap-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="#000000" id="bg-black" />
                      </FormControl>
                      <FormLabel htmlFor="bg-black" className="font-normal cursor-pointer flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-black border" />
                        Black
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="#FFFFFF" id="bg-white" />
                      </FormControl>
                      <FormLabel htmlFor="bg-white" className="font-normal cursor-pointer flex items-center gap-2">
                         <div className="w-4 h-4 rounded-full bg-white border" />
                        White
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }
      
       const Component = fieldType === 'textarea' ? Textarea : Input;
       return (
            <FormField
              control={form.control}
              name={fieldKey}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Component placeholder={`Enter ${label}...`} {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
       )
  }

  return (
    <div className="mt-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
      </Button>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(generateImage)}>
              <CardHeader>
                <CardTitle>Editing: {template.name}</CardTitle>
                <CardDescription>Fill out the fields below to create your image.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  {renderFormField('image', 'image')}
                  {renderFormField('secondaryImage', 'secondaryImage')}
                  {renderFormField('primaryText', 'textarea')}
                  {renderFormField('secondaryText', 'text')}
                  {renderFormField('tertiaryText', 'text')}
                  {renderFormField('fontFamily', 'fontFamily')}
                  {renderFormField('primaryColor', 'primaryColor')}
                  {renderFormField('secondaryColor', 'secondaryColor')}
                  {renderFormField('bannerColor', 'bannerColor')}
                  {renderFormField('backgroundColor', 'backgroundColor')}
              </CardContent>
              <CardFooter>
                 <Button type="submit" disabled={isLoading || !watchAllFields.image} size="lg">
                  {isLoading ? ( <Loader2 className="mr-2 h-5 w-5 animate-spin" /> ) : ( <Sparkles className="mr-2 h-5 w-5" /> )}
                  Generate Image
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <div className="sticky top-8 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Your Generated Image</CardTitle>
                    <CardDescription>Your 1080x1080 image will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary">
                        <canvas ref={canvasRef} width="1080" height="1080" className="absolute top-0 left-0 w-full h-full object-cover" />
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        )}
                         {!watchAllFields.image && !generatedImage && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
                            <UploadCloud className="h-16 w-16" />
                            <p className="mt-4 text-center font-medium">Upload an image and click "Generate" to see your result</p>
                          </div>
                        )}
                    </div>
                </CardContent>
                {generatedImage && !isLoading && (
                  <CardFooter>
                     <Button onClick={handleDownload} size="lg" className="w-full" variant="secondary">
                      <Download className="mr-2 h-5 w-5" />
                      Download Image
                    </Button>
                  </CardFooter>
                )}
            </Card>
            <AdPlaceholder adKey="global-ad-script" />
        </div>
      </div>
    </div>
  );
};

export default function ImageOverlayPageClient() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  if (!selectedTemplate) {
    return (
      <div className="container mx-auto min-h-screen px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="font-headline flex items-center justify-center gap-3 text-4xl font-bold md:text-5xl">
            <TextQuote className="h-10 w-10 text-primary" />
            Image Overlay Generator
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Create beautiful images with text overlays in seconds.
          </p>
        </header>
        <AdPlaceholder adKey="global-ad-script" />
        <main className="mt-12">
          <div className="text-center mb-8">
            <h2 className="font-headline text-2xl font-bold">First, Choose a Template</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {templates.map(template => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <template.icon className="h-5 w-5 text-primary"/>
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center p-2 border-2 border-dashed group-hover:border-primary/50 transition-colors">
                     <p className="text-sm font-medium text-muted-foreground">Template Preview</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return <GeneratorUI template={selectedTemplate} onBack={() => setSelectedTemplate(null)} />;
}
