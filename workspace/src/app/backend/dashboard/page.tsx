
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';

import { app } from '@/lib/firebase';
import { getAllPrompts, updatePrompt } from '@/lib/prompt-service';
import { getAllSeoData, updateSeoData, type SeoData } from '@/lib/seo-service';
import { getAllLegalContent, updateLegalContent } from '@/lib/legal-service';
import { getAllAdContent, updateAdContent } from '@/lib/ad-service';
import { getAllModelConfigs, updateModelConfig, type ModelConfig } from '@/lib/model-config-service';
import { getVerificationTags, updateVerificationTags, type VerificationTags } from '@/lib/verification-tag-service';
import { defaultPrompts } from '@/lib/prompt-defaults';
import { defaultSeoData } from '@/lib/seo-defaults';
import { defaultLegalContent } from '@/lib/legal-defaults';
import { defaultAdContent } from '@/lib/ad-defaults';
import { defaultModelConfigs } from '@/lib/model-config-defaults';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PROMPT_METADATA: Record<string, { title: string; description: string }> = {
  enhanceSeo: { title: 'YouTube SEO Prompt', description: 'Guides the AI to analyze and improve YouTube video SEO.' },
  generateAso: { title: 'ASO Generator Prompt', description: 'Instructs the AI to generate a complete ASO package for a mobile app.' },
  generateThumbnailPrompt: { title: 'Thumbnail Idea Prompt', description: 'Helps the AI generate a creative concept for a YouTube thumbnail.' },
  rewriteScript: { title: 'YouTube Script Rewriter Prompt', description: 'Guides the AI in analyzing and rewriting a user\'s video script.' },
  suggestOverlayText: { title: 'Overlay Text Suggestion Prompt', description: 'A simple prompt for the AI to suggest catchy text for a thumbnail.' },
  generateAppIcon: { title: 'App Icon Generator Prompt', description: 'Guides the AI to create a 512x512 app icon based on user input.' },
  translateAppMetadata: { title: 'App Metadata Translator Prompt', description: 'Guides the AI to translate app metadata into multiple languages accurately.' },
  generateYoutubeTags: { title: 'YouTube Tags Generator Prompt', description: 'Instructs the AI to generate a list of SEO-optimized YouTube tags.' },
  generateYoutubeTitles: { title: 'YouTube Title Generator Prompt', description: 'Guides the AI to create several catchy, SEO-friendly YouTube titles.' },
  generateTiktokHook: { title: 'TikTok Hook Generator Prompt', description: 'Prompt for generating engaging first-line hooks for TikTok videos.' },
  generateTiktokCaption: { title: 'TikTok Caption Generator Prompt', description: 'Prompt for generating viral-style captions with emojis and hashtags.' },
  generateTiktokHashtag: { title: 'TikTok Hashtag Generator Prompt', description: 'Prompt for generating relevant and trending TikTok hashtags.' },
  generateTiktokVideoIdea: { title: 'TikTok Video Idea Generator Prompt', description: 'Prompt for generating viral TikTok video ideas with hooks and trend notes.' },
  generateTiktokScript: { title: 'TikTok Script Generator Prompt', description: 'Prompt for generating short-form video scripts with emotional structure.' },
  generateTiktokVoiceover: { title: 'TikTok Voiceover Generator Prompt', description: 'Prompt for generating engaging voiceover text for short-form video.' },
  generateTiktokBio: { title: 'TikTok Bio Generator Prompt', description: 'Prompt for creating a catchy TikTok bio with emojis and a CTA.' },
  generateTiktokCta: { title: 'TikTok CTA Generator Prompt', description: 'Prompt for creating creative calls-to-action for captions and video endings.' },
  generateVeoPrompt: { title: 'Veo Prompt Writer Prompt', description: 'Guides the AI to expand a simple idea into a detailed, cinematic prompt for text-to-video models.' },
  generatePrivacyPolicy: { title: 'App Privacy Policy Generator Prompt', description: 'Guides the AI to generate a privacy policy and terms & conditions for an app.' },
};

const SEO_METADATA: Record<string, { title: string; description: string }> = {
    'thumbnail-generator': { title: 'Thumbnail Generator Page SEO', description: 'Manage the SEO Title, Description, and Keywords for the AI Thumbnail Generator page.' },
    'seo-enhancer': { title: 'YouTube SEO Page SEO', description: 'Manage the SEO Title, Description, and Keywords for the YouTube SEO page.' },
    'script-rewriter': { title: 'YouTube Script Rewriter Page SEO', description: 'Manage the SEO Title, Description, and Keywords for the YouTube Script Rewriter page.' },
    'aso-generator': { title: 'ASO Generator Page SEO', description: 'Manage the SEO Title, Description, and Keywords for the ASO Generator page.' },
    'app-icon-generator': { title: 'App Icon Generator Page SEO', description: 'Manage the SEO Title, Description, and Keywords for the App Icon Generator page.' },
    'image-overlay': { title: 'Image Overlay Page SEO', description: 'Manage the SEO Title, Description, and Keywords for the Image Overlay page.' },
    'privacy-policy': { title: 'Privacy Policy Page SEO', description: 'Manage the SEO Title, Description, and Keywords for the Privacy Policy page.' },
    'cookie-policy': { title: 'Cookie Policy Page SEO', description: 'Manage the SEO Title, Description, and Keywords for the Cookie Policy page.' },
    'terms-and-conditions': { title: 'Terms & Conditions Page SEO', description: 'Manage the SEO Title, Description, and Keywords for the Terms & Conditions page.' },
    'app-metadata-translator': { title: 'App Translator Page SEO', description: 'Manage the SEO for the App Metadata Translator page.' },
    'youtube-tags-generator': { title: 'YouTube Tags Page SEO', description: 'Manage the SEO for the YouTube Tags Generator page.' },
    'youtube-title-generator': { title: 'YouTube Title Page SEO', description: 'Manage the SEO for the YouTube Title Generator page.' },
    'tiktok-hook-generator': { title: 'TikTok Hook Generator Page SEO', description: 'Manage the SEO for the TikTok Hook Generator page.' },
    'tiktok-caption-generator': { title: 'TikTok Caption Generator Page SEO', description: 'Manage the SEO for the TikTok Caption Generator page.' },
    'tiktok-hashtag-generator': { title: 'TikTok Hashtag Generator Page SEO', description: 'Manage the SEO for the TikTok Hashtag Generator page.' },
    'tiktok-video-idea-generator': { title: 'TikTok Video Idea Generator Page SEO', description: 'Manage the SEO for the TikTok Video Idea Generator page.' },
    'tiktok-script-generator': { title: 'TikTok Script Generator Page SEO', description: 'Manage the SEO for the TikTok Script Generator page.' },
    'tiktok-voiceover-generator': { title: 'TikTok Voiceover Generator Page SEO', description: 'Manage the SEO for the TikTok Voiceover Generator page.' },
    'tiktok-bio-generator': { title: 'TikTok Bio Generator Page SEO', description: 'Manage the SEO for the TikTok Bio Generator page.' },
    'tiktok-cta-generator': { title: 'TikTok CTA Generator Page SEO', description: 'Manage the SEO for the TikTok CTA Generator page.' },
    'veo-prompt-writer': { title: 'Veo Prompt Writer Page SEO', description: 'Manage the SEO for the Veo Prompt Writer page.' },
    'app-privacy-policy-generator': { title: 'App Privacy Policy Generator Page SEO', description: 'Manage the SEO for the App Privacy Policy Generator page.' },
};

const LEGAL_METADATA: Record<string, { title: string; description: string }> = {
    'privacy-policy': { title: 'Privacy Policy Content', description: 'Edit the content for the Privacy Policy page.' },
    'terms-and-conditions': { title: 'Terms & Conditions Content', description: 'Edit the content for the Terms & Conditions page.' },
    'cookie-policy': { title: 'Cookie Policy Content', description: 'Edit the content for the Cookie Policy page.' }
};

const AD_METADATA: Record<string, { title: string; description: string }> = {
    'global-ad-script': { title: 'Global Ad Script', description: 'Paste your responsive ad code (e.g., Google AdSense) here. It will be displayed in the ad placeholders across the app.' }
};

const MODEL_CONFIG_METADATA: Record<string, { title: string; description: string }> = Object.keys(defaultModelConfigs).reduce((acc, key) => {
    acc[key] = { title: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Model`, description: `Select the AI model for this tool.` };
    return acc;
}, {} as Record<string, { title: string; description: string }>);

type OriginalData = {
  prompts: Record<string, string>;
  seo: Record<string, SeoData>;
  legal: Record<string, string>;
  ads: Record<string, string>;
  modelConfigs: Record<string, ModelConfig>;
  verificationTags: VerificationTags;
};

// Main Dashboard Skeleton
function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
       <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
    </div>
  );
}


// Editor Card Components (no changes needed, but keeping them in the same file for simplicity)
const EditorCard = ({ title, description, content, onSave, isChanged, onContentChange, placeholder, className = "min-h-[250px] font-mono text-xs" }: { title: string; description: string; content: string; onSave: () => Promise<void>; isChanged: boolean; onContentChange: (newContent: string) => void; placeholder: string; className?: string; }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      toast({ title: 'Success!', description: `${title} has been updated.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save Failed', description: `Could not save ${title}.` });
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent><Textarea value={content} onChange={(e) => onContentChange(e.target.value)} className={className} placeholder={placeholder} /></CardContent>
      <CardFooter><Button onClick={handleSave} disabled={isSaving || !isChanged}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Changes</Button></CardFooter>
    </Card>
  );
};

const SeoEditorCard = ({ pageKey, title, description, seoData, originalSeoData, onSeoChange, onSave }: { pageKey: string; title: string; description: string; seoData: SeoData; originalSeoData: SeoData; onSeoChange: (key: string, newSeoData: SeoData) => void; onSave: (key: string) => Promise<void>; }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(pageKey);
      toast({ title: 'Success!', description: `SEO for ${title} has been updated.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save Failed', description: `Could not save SEO for ${title}.` });
    } finally {
      setIsSaving(false);
    }
  };
  const handleChange = (field: keyof SeoData, value: string | string[]) => onSeoChange(pageKey, { ...seoData, [field]: value });
  const isChanged = JSON.stringify(seoData) !== JSON.stringify(originalSeoData);
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label htmlFor={`seo-title-${pageKey}`}>Title</Label><Input id={`seo-title-${pageKey}`} value={seoData.title} onChange={e => handleChange('title', e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor={`seo-description-${pageKey}`}>Description</Label><Textarea id={`seo-description-${pageKey}`} value={seoData.description} onChange={e => handleChange('description', e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor={`seo-keywords-${pageKey}`}>Keywords</Label><Textarea id={`seo-keywords-${pageKey}`} value={Array.isArray(seoData.keywords) ? seoData.keywords.join(', ') : ''} onChange={e => handleChange('keywords', e.target.value.split(',').map(k => k.trim()))} placeholder="Enter keywords separated by commas" /></div>
      </CardContent>
      <CardFooter><Button onClick={handleSave} disabled={isSaving || !isChanged}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save SEO Changes</Button></CardFooter>
    </Card>
  );
};

const ModelConfigEditorCard = ({ flowKey, title, description, config, originalConfig, onConfigChange, onSave }: { flowKey: string; title: string; description: string; config: ModelConfig; originalConfig: ModelConfig; onConfigChange: (key: string, newConfig: ModelConfig) => void; onSave: (key: string) => Promise<void>; }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(flowKey);
      toast({ title: 'Success!', description: `Model for ${title} has been updated.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save Failed', description: `Could not save model for ${title}.` });
    } finally {
      setIsSaving(false);
    }
  };
  const handleChange = (newModel: string) => onConfigChange(flowKey, { ...config, model: newModel });
  const isChanged = config.model !== originalConfig.model;
  const isReadOnly = config.availableModels.length <= 1;
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent><div className="space-y-2"><Label htmlFor={`model-select-${flowKey}`}>Selected Model</Label><Select value={config.model} onValueChange={handleChange} disabled={isReadOnly}><SelectTrigger id={`model-select-${flowKey}`}><SelectValue placeholder="Select a model" /></SelectTrigger><SelectContent>{config.availableModels.map(modelName => (<SelectItem key={modelName} value={modelName}>{modelName}</SelectItem>))}</SelectContent></Select>{isReadOnly && (<p className="text-sm text-muted-foreground mt-2">This flow only supports one model and cannot be changed.</p>)}</div></CardContent>
      <CardFooter><Button onClick={handleSave} disabled={isSaving || !isChanged}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Model Choice</Button></CardFooter>
    </Card>
  );
};

const VerificationTagsEditorCard = ({ tags, originalTags, onTagChange, onSave }: { tags: VerificationTags; originalTags: VerificationTags; onTagChange: (newTags: VerificationTags) => void; onSave: () => Promise<void>; }) => {
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave();
            toast({ title: 'Success!', description: 'Verification tags have been updated.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save verification tags.' });
        } finally {
            setIsSaving(false);
        }
    };
    const handleChange = (field: keyof VerificationTags, value: string) => onTagChange({ ...tags, [field]: value });
    const isChanged = JSON.stringify(tags) !== JSON.stringify(originalTags);

    return (
        <Card>
            <CardHeader><CardTitle>Site Verification & Analytics</CardTitle><CardDescription>Manage HTML tags for services like Google Search Console and Google Analytics.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="google-site-verification">Google Site Verification Tag</Label><Input id="google-site-verification" value={tags.googleSiteVerification} onChange={e => handleChange('googleSiteVerification', e.target.value)} placeholder='<meta name="google-site-verification" content="..." />' /></div>
                <div className="space-y-2"><Label htmlFor="google-analytics">Google Analytics Script</Label><Textarea id="google-analytics" value={tags.googleAnalytics} onChange={e => handleChange('googleAnalytics', e.target.value)} placeholder="<!-- Google Analytics script... -->" className="min-h-[150px] font-mono text-xs" /></div>
            </CardContent>
            <CardFooter><Button onClick={handleSave} disabled={isSaving || !isChanged}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Tags</Button></CardFooter>
        </Card>
    );
};


export default function DashboardPage() {
  const auth = getAuth(app);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'prompts';

  const [initialData, setInitialData] = useState<OriginalData | null>(null);
  const [editedData, setEditedData] = useState<OriginalData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/backend/login');
      } else {
        // Fetch data only after user is confirmed
        const loadData = async () => {
          try {
            const [prompts, seo, legal, ads, modelConfigs, verificationTags] = await Promise.all([
              getAllPrompts(),
              getAllSeoData(),
              getAllLegalContent(),
              getAllAdContent(),
              getAllModelConfigs(),
              getVerificationTags(),
            ]);
            const data = { prompts, seo, legal, ads, modelConfigs, verificationTags };
            setInitialData(data);
            setEditedData(JSON.parse(JSON.stringify(data))); // Deep copy
          } catch (error) {
            console.error("Failed to load dashboard data:", error);
            toast({ variant: 'destructive', title: 'Error Loading Data', description: 'Could not fetch dashboard settings.' });
          } finally {
            setDataLoading(false);
          }
        };
        loadData();
      }
    }
  }, [user, authLoading, router, toast]);

  if (authLoading || dataLoading || !editedData || !initialData) {
    return <DashboardSkeleton />;
  }
  
  const handleGenerateSitemap = () => {
    const sitemapUrl = `${window.location.origin}/sitemap.xml`;
    window.open(sitemapUrl, '_blank');
    toast({ title: 'Sitemap Opened', description: 'Your sitemap.xml has been opened in a new tab.' });
  };
  
  const promptKeys = Object.keys(defaultPrompts);
  const modelKeys = Object.keys(defaultModelConfigs);
  const seoKeys = Object.keys(defaultSeoData);
  const legalKeys = Object.keys(defaultLegalContent);
  const adKeys = Object.keys(defaultAdContent);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Backend Dashboard</h1>
          <p className="text-muted-foreground">Manage your application's AI prompts, SEO settings, and legal content.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/backend/dashboard?tab=prompts" className="block"><Card className={`hover:border-primary transition-colors ${activeTab === 'prompts' ? 'border-primary' : ''}`}><CardHeader><CardTitle>Prompts</CardTitle><CardDescription>{promptKeys.length} prompts</CardDescription></CardHeader></Card></Link>
        <Link href="/backend/dashboard?tab=models" className="block"><Card className={`hover:border-primary transition-colors ${activeTab === 'models' ? 'border-primary' : ''}`}><CardHeader><CardTitle>Models</CardTitle><CardDescription>{modelKeys.length} configs</CardDescription></CardHeader></Card></Link>
        <Link href="/backend/dashboard?tab=seo" className="block"><Card className={`hover:border-primary transition-colors ${activeTab === 'seo' ? 'border-primary' : ''}`}><CardHeader><CardTitle>SEO</CardTitle><CardDescription>{seoKeys.length} pages</CardDescription></CardHeader></Card></Link>
        <Link href="/backend/dashboard?tab=settings" className="block"><Card className={`hover:border-primary transition-colors ${activeTab === 'settings' ? 'border-primary' : ''}`}><CardHeader><CardTitle>Site Settings</CardTitle><CardDescription>Legal, Ads & more</CardDescription></CardHeader></Card></Link>
      </div>

      {activeTab === 'prompts' && (
        <div className="mt-6 space-y-6">
          {promptKeys.map((key) => {
            const metadata = PROMPT_METADATA[key];
            if (!metadata) return null;
            return (
              <EditorCard
                key={key}
                title={metadata.title}
                description={metadata.description}
                content={editedData.prompts[key]}
                onSave={() => updatePrompt(key, editedData.prompts[key]).then(() => setInitialData(prev => ({ ...prev!, prompts: { ...prev!.prompts, [key]: editedData.prompts[key] } })))}
                isChanged={editedData.prompts[key] !== initialData.prompts[key]}
                onContentChange={(newContent) => setEditedData(prev => ({...prev!, prompts: {...prev!.prompts, [key]: newContent}}))}
                placeholder="Enter prompt here..."
              />
            )
          })}
        </div>
      )}

      {activeTab === 'models' && (
        <div className="mt-6 space-y-6">
          {modelKeys.map((key) => {
            const metadata = MODEL_CONFIG_METADATA[key];
            if (!metadata) return null;
            return (
              <ModelConfigEditorCard
                key={key}
                flowKey={key}
                title={metadata.title}
                description={metadata.description}
                config={editedData.modelConfigs[key]}
                originalConfig={initialData.modelConfigs[key]}
                onSave={() => updateModelConfig(key, editedData.modelConfigs[key]).then(() => setInitialData(prev => ({ ...prev!, modelConfigs: { ...prev!.modelConfigs, [key]: editedData.modelConfigs[key] } })))}
                onConfigChange={(flowKey, newConfig) => setEditedData(prev => ({ ...prev!, modelConfigs: { ...prev!.modelConfigs, [flowKey]: newConfig }}))}
              />
            );
          })}
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="mt-6 space-y-6">
          {seoKeys.map((key) => {
            const metadata = SEO_METADATA[key];
            if (!metadata) return null;
            return (
              <SeoEditorCard
                key={key}
                pageKey={key}
                title={metadata.title}
                description={metadata.description}
                seoData={editedData.seo[key]}
                originalSeoData={initialData.seo[key]}
                onSave={(pageKey) => updateSeoData(pageKey, editedData.seo[pageKey]).then(() => setInitialData(prev => ({ ...prev!, seo: { ...prev!.seo, [pageKey]: editedData.seo[pageKey] } })))}
                onSeoChange={(pageKey, newSeoData) => setEditedData(prev => ({ ...prev!, seo: { ...prev!.seo, [pageKey]: newSeoData }}))}
              />
            );
          })}
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle>Site Management</CardTitle><CardDescription>Global settings for your website's SEO and verification.</CardDescription></CardHeader>
            <CardContent><Button onClick={handleGenerateSitemap}><RefreshCw className="mr-2 h-4 w-4" />Generate & View Sitemap</Button></CardContent>
          </Card>
          <VerificationTagsEditorCard
            tags={editedData.verificationTags}
            originalTags={initialData.verificationTags}
            onSave={() => updateVerificationTags(editedData.verificationTags).then(() => setInitialData(prev => ({ ...prev!, verificationTags: editedData.verificationTags })))}
            onTagChange={(newTags) => setEditedData(prev => ({ ...prev!, verificationTags: newTags }))}
          />
          {legalKeys.map((key) => (
            <EditorCard
              key={key}
              title={LEGAL_METADATA[key]?.title || key}
              description={LEGAL_METADATA[key]?.description || ''}
              content={editedData.legal[key]}
              onSave={() => updateLegalContent(key, editedData.legal[key]).then(() => setInitialData(prev => ({ ...prev!, legal: { ...prev!.legal, [key]: editedData.legal[key] } })))}
              isChanged={editedData.legal[key] !== initialData.legal[key]}
              onContentChange={(newContent) => setEditedData(prev => ({ ...prev!, legal: { ...prev!.legal, [key]: newContent }}))}
              placeholder="Enter legal content here..."
              className="min-h-[250px] font-mono text-sm"
            />
          ))}
          {adKeys.map((key) => (
            <EditorCard
              key={key}
              title={AD_METADATA[key]?.title || key}
              description={AD_METADATA[key]?.description || ''}
              content={editedData.ads[key]}
              onSave={() => updateAdContent(key, editedData.ads[key]).then(() => setInitialData(prev => ({ ...prev!, ads: { ...prev!.ads, [key]: editedData.ads[key] } })))}
              isChanged={editedData.ads[key] !== initialData.ads[key]}
              onContentChange={(newContent) => setEditedData(prev => ({ ...prev!, ads: { ...prev!.ads, [key]: newContent }}))}
              placeholder="Paste your ad script here..."
              className="min-h-[200px] font-mono text-xs bg-muted/50"
            />
          ))}
        </div>
      )}
    </div>
  );
}
