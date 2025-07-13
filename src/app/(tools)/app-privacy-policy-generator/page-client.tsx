
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
  TriangleAlert,
  Link as LinkIcon,
} from 'lucide-react';

import { generatePrivacyPolicy, type GeneratePrivacyPolicyInput, type GeneratePrivacyPolicyOutput } from '@/ai/flows/generate-privacy-policy';
import { savePolicy } from '@/lib/policy-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { app } from '@/lib/firebase';
import { Textarea } from '@/components/ui/textarea';

const LOCAL_STORAGE_KEY = "privacyPolicyResult";

const appTypes = ['Free', 'Open Source', 'Freemium', 'Ad Supported', 'Commercial'] as const;
const mobileOSes = ['Android', 'iOS', 'KaiOS'] as const;
const ownerTypes = ['Individual', 'Company'] as const;

const thirdPartyServices = [
    'Google Play Services', 'AdMob', 'Google Analytics for Firebase', 'Firebase Crashlytics',
    'Facebook', 'Fabric', 'Matomo', 'Clicky', 'Flurry Analytics', 'Appodeal', 'Fathom Analytics',
    'Unity', 'SDKBOX', 'GameAnalytics', 'One Signal', 'Expo', 'Sentry', 'AppLovin', 'Vungle',
    'StartApp', 'AdColony', 'Amplitude', 'Adjust', 'Mapbox', 'Godot', 'Segment', 'Mixpanel',
    'RevenueCat', 'Clerk', 'Adapty', 'ConfigCat', 'Instabug'
];

const formSchema = z.object({
  appName: z.string().min(1, 'Application Name is required.'),
  contactEmail: z.string().email('Email address is required.'),
  effectiveDate: z.string().min(1, 'Policy Effective Date is required.'),
  pii: z.string().optional(),
  appType: z.enum(appTypes, { required_error: 'App Type is required.' }),
  mobileOS: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one Mobile OS.',
  }),
  ownerType: z.enum(ownerTypes, { required_error: 'Owner type is required.' }),
  developerName: z.string().min(1, 'Developer Name is required.'),
  thirdPartyServices: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;
type DocumentType = 'privacyPolicy' | 'termsAndConditions';

export default function AppPrivacyPolicyGeneratorPageClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [savingType, setSavingType] = useState<DocumentType | null>(null);
  const [result, setResult] = useState<GeneratePrivacyPolicyOutput | null>(null);
  const [generatedUrls, setGeneratedUrls] = useState<{ privacyPolicy?: string; termsAndConditions?: string }>({});
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
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
      appName: '',
      contactEmail: '',
      effectiveDate: '',
      pii: '',
      mobileOS: [],
      developerName: '',
      thirdPartyServices: [],
    },
  });

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  const handleGenerateUrl = async (type: DocumentType) => {
    if (!result) {
      toast({
        variant: 'destructive',
        title: 'URL Generation Failed',
        description: 'Missing generated content. Please try generating the policy again.',
      });
      return;
    }
    
    const content = result[type];

    if (!content) {
        toast({
            variant: 'destructive',
            title: 'URL Generation Failed',
            description: 'Cannot save an empty document. Please ensure content was generated correctly.',
        });
        return;
    }

    setSavingType(type);
    try {
        const policyId = await savePolicy(content, type);
        const url = `${window.location.origin}/policy/${policyId}`;
        
        setGeneratedUrls(prev => ({...prev, [type]: url }));

        toast({ title: 'URL Generated!', description: 'Your document is now saved and publicly accessible.' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while saving.';
        toast({
            variant: 'destructive',
            title: 'URL Generation Failed',
            description: `Failed to save to Firebase. This is often due to database security rules. Please check that public writes are allowed for the '/appprivacypolicygenerator' path. Original error: ${errorMessage}`,
        });
    } finally {
        setSavingType(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);
    setGeneratedUrls({});
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    const submissionData: GeneratePrivacyPolicyInput = {
        ...values,
        pii: values.pii ? values.pii.split(',').map(item => item.trim()).filter(Boolean) : [],
        thirdPartyServices: values.thirdPartyServices || [],
    };

    try {
      const res = await generatePrivacyPolicy(submissionData);
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
  
  const renderUrlGenerationSection = (type: DocumentType) => (
    <div className="mt-4">
      {!generatedUrls[type] ? (
        <Button onClick={() => handleGenerateUrl(type)} disabled={savingType === type} className="w-full">
          {savingType === type ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
          Generate Sharable URL
        </Button>
      ) : (
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className='flex-grow'>
              <Label htmlFor={`policy-url-${type}`} className="text-xs font-medium">Your Shareable URL</Label>
              <Input id={`policy-url-${type}`} readOnly value={generatedUrls[type]} className="mt-1 h-8 text-xs w-full" />
            </div>
            <Button variant="outline" size="sm" onClick={() => handleCopy(generatedUrls[type]!, `url-${type}`)} className="w-full sm:w-28 flex-shrink-0">
              {copiedField === `url-${type}` ? <Check className="mr-2 h-4 w-4 text-primary" /> : <Copy className="mr-2 h-4 w-4" />}
              Copy URL
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="font-headline flex items-center justify-center gap-3 text-4xl font-bold md:text-5xl">
          <FileText className="h-10 w-10 text-primary" />
          App Privacy Policy Generator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Generate a Privacy Policy and Terms &amp; Conditions for your app in seconds.</p>
      </header>

      <div className="mb-8"><AdPlaceholder adKey="global-ad-script" /></div>

      <main className="mx-auto max-w-4xl space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">App Details</CardTitle>
                <CardDescription>Tell us about your application and who owns it.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="appName" render={({ field }) => (
                        <FormItem><FormLabel>App Name</FormLabel><FormControl><Input placeholder="e.g., FitTrack" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactEmail" render={({ field }) => (
                        <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder="e.g., contact@fittrack.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="ownerType" render={({ field }) => (
                        <FormItem><FormLabel>Owner Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                            {ownerTypes.map(type => <FormItem key={type} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={type} /></FormControl><FormLabel className="font-normal">{type}</FormLabel></FormItem>)}
                        </RadioGroup></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="developerName" render={({ field }) => (
                        <FormItem><FormLabel>{form.watch('ownerType') === 'Company' ? 'Company Name' : 'Developer Name'}</FormLabel><FormControl><Input placeholder="e.g., FitTrack Inc." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="effectiveDate" render={({ field }) => (
                     <FormItem>
                        <FormLabel>Policy Effective Date</FormLabel>
                        <FormControl>
                            <Input placeholder="DD/MM/YYYY" {...field} />
                        </FormControl>
                        <FormDescription>
                            Enter the date in DD/MM/YYYY format.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Configuration</CardTitle>
                    <CardDescription>Specify the type of app, OS, and the data you collect.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="appType" render={({ field }) => (
                        <FormItem><FormLabel>App Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                           {appTypes.map(type => <FormItem key={type} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={type} /></FormControl><FormLabel className="font-normal">{type}</FormLabel></FormItem>)}
                        </RadioGroup></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="mobileOS" render={({ field }) => (
                        <FormItem><FormLabel>Mobile OS</FormLabel>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {mobileOSes.map((os) => (
                                <FormField key={os} control={form.control} name="mobileOS" render={({ field }) => (
                                    <FormItem key={os} className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl><Checkbox checked={field.value?.includes(os)} onCheckedChange={(checked) => {
                                            return checked ? field.onChange([...(field.value || []), os]) : field.onChange(field.value?.filter((value) => value !== os))
                                        }} /></FormControl>
                                        <FormLabel className="font-normal">{os}</FormLabel>
                                    </FormItem>
                                )} />
                            ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                     )} />
                    <FormField control={form.control} name="pii" render={({ field }) => (
                        <FormItem><FormLabel>Personally Identifiable Information (PII)</FormLabel><FormControl><Textarea placeholder="e.g., email address, name, user ID" {...field} rows={2} /></FormControl><FormDescription>Enter the types of PII you collect, separated by commas.</FormDescription><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Third-Party Services</CardTitle>
                    <CardDescription>Select all third-party services your app uses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField control={form.control} name="thirdPartyServices" render={() => (
                        <FormItem>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {thirdPartyServices.map((service) => (
                                    <FormField key={service} control={form.control} name="thirdPartyServices" render={({ field }) => (
                                        <FormItem key={service} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value?.includes(service)} onCheckedChange={(checked) => {
                                                const currentSelection = field.value || [];
                                                return checked ? field.onChange([...currentSelection, service]) : field.onChange(currentSelection.filter((value) => value !== service))
                                            }} /></FormControl>
                                            <FormLabel className="font-normal text-sm">{service}</FormLabel>
                                        </FormItem>
                                    )} />
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                    Generate Documents
                  </Button>
                </CardFooter>
            </Card>
          </form>
        </Form>

        {isLoading && (
          <div className="mt-8 space-y-4">
              <Skeleton className="h-96 w-full" />
          </div>
        )}

        {result && (
          <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">Your Documents are Ready</DialogTitle>
                <DialogDescription>Review your generated documents. You can copy the content or generate a shareable URL for each one.</DialogDescription>
              </DialogHeader>
              
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  AI can make mistakes, so double-check it.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="privacy-policy" className="flex-grow mt-2 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="privacy-policy">Privacy Policy</TabsTrigger>
                  <TabsTrigger value="terms-conditions">Terms &amp; Conditions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="privacy-policy" className="flex-grow mt-2 flex flex-col">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex-row justify-end p-2 pb-0">
                       <Button variant="outline" size="sm" onClick={() => handleCopy(result.privacyPolicy, 'policy')} className="w-24">
                            {copiedField === 'policy' ? <Check className="mr-2 h-4 w-4 text-primary" /> : <Copy className="mr-2 h-4 w-4" />}
                            Copy
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-grow p-2">
                      <ScrollArea className="h-[40vh] p-4 border rounded-md bg-secondary/50">
                        <pre className="text-xs whitespace-pre-wrap font-sans">{result.privacyPolicy}</pre>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch p-2 pt-0">
                      {renderUrlGenerationSection('privacyPolicy')}
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="terms-conditions" className="flex-grow mt-2 flex flex-col">
                   <Card className="h-full flex flex-col">
                    <CardHeader className="flex-row justify-end p-2 pb-0">
                       <Button variant="outline" size="sm" onClick={() => handleCopy(result.termsAndConditions, 'terms')} className="w-24">
                            {copiedField === 'terms' ? <Check className="mr-2 h-4 w-4 text-primary" /> : <Copy className="mr-2 h-4 w-4" />}
                            Copy
                        </Button>
                    </CardHeader>
                     <CardContent className="flex-grow p-2">
                      <ScrollArea className="h-[40vh] p-4 border rounded-md bg-secondary/50">
                        <pre className="text-xs whitespace-pre-wrap font-sans">{result.termsAndConditions}</pre>
                      </ScrollArea>
                    </CardContent>
                     <CardFooter className="flex-col items-stretch p-2 pt-0">
                      {renderUrlGenerationSection('termsAndConditions')}
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
              
            </DialogContent>
          </Dialog>
        )}
        <AdPlaceholder adKey="global-ad-script" />
      </main>
    </div>
  );
}
