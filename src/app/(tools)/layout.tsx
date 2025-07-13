'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ImageIcon,
  Sparkles,
  TrendingUp,
  FileText,
  Store,
  Menu,
  Palette,
  TextQuote,
  Youtube,
  Languages,
  Tags,
  Type,
  ChevronDown,
  Clapperboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

const youtubeTools = [
  { href: '/thumbnail-generator', label: 'Thumbnail', icon: ImageIcon },
  { href: '/seo-enhancer', label: 'YouTube SEO', icon: TrendingUp },
  { href: '/script-rewriter', label: 'YouTube Script Rewriter', icon: FileText },
  { href: '/youtube-title-generator', label: 'Title', icon: Type },
  { href: '/youtube-tags-generator', label: 'Tags', icon: Tags },
];

const appStoreTools = [
  { href: '/aso-generator', label: 'ASO Text', icon: Store },
  { href: '/app-icon-generator', label: 'App Icon', icon: Palette },
  { href: '/app-metadata-translator', label: 'Metadata Translator', icon: Languages },
  { href: '/app-privacy-policy-generator', label: 'Privacy Policy Generator', icon: FileText },
];

const tiktokTools = [
    { href: '/tiktok-hook-generator', label: 'Hook', icon: Sparkles },
    { href: '/tiktok-caption-generator', label: 'Caption', icon: FileText },
    { href: '/tiktok-hashtag-generator', label: 'Hashtag', icon: Tags },
    { href: '/tiktok-video-idea-generator', label: 'Video Idea', icon: Sparkles },
    { href: '/tiktok-script-generator', label: 'Script', icon: FileText },
    { href: '/tiktok-voiceover-generator', label: 'Voiceover Text', icon: Sparkles },
    { href: '/tiktok-bio-generator', label: 'Bio', icon: Sparkles },
    { href: '/tiktok-cta-generator', label: 'CTA', icon: Sparkles },
];

const videoGenTools = [
  { href: '/veo-prompt-writer', label: 'Veo Prompt Writer', icon: Clapperboard },
];

const otherTools = [
  { href: '/image-overlay', label: 'Image Overlay', icon: TextQuote },
];

const legalNavItems = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-and-conditions', label: 'Terms & Conditions' },
]

const NavLink = ({ href, children, className, ...props }: { href: string, children: React.ReactNode, className?: string }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={cn('transition-colors hover:text-foreground/80', isActive ? 'text-foreground' : 'text-foreground/60', className)} {...props}>
            {children}
        </Link>
    );
};

const TiktokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
    </svg>
);


export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex w-full items-center justify-between">
          <div className='flex items-center gap-4'>
            <Link href="/" className="mr-4 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg font-bold">CreatorKit AI</span>
            </Link>
            
            <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1 px-3">
                    <Youtube className="h-4 w-4" />
                    <span>YouTube Tools</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {youtubeTools.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1 px-3">
                    <Store className="h-4 w-4" />
                    <span>App Store Tools</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {appStoreTools.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1 px-3">
                    <TiktokIcon />
                    <span>TikTok Tools</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {tiktokTools.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1 px-3">
                    <Clapperboard className="h-4 w-4" />
                    <span>Video Gen Tools</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {videoGenTools.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {otherTools.map(item => (
                <Button key={item.href} variant="ghost" asChild className="px-3">
                  <NavLink href={item.href}>
                    <item.icon className="h-4 w-4 mr-1" />
                    <span>{item.label}</span>
                  </NavLink>
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
                {legalNavItems.map((item) => <NavLink key={item.href} href={item.href}>{item.label}</NavLink>)}
            </nav>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="font-headline text-lg font-bold">CreatorKit AI</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="grid gap-4 py-4 text-muted-foreground">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Youtube className="h-4 w-4" /> YouTube Tools</h3>
                  {youtubeTools.map(item => (
                    <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary', pathname === item.href && 'text-primary bg-muted')}>
                      <item.icon className="h-4 w-4" />{item.label}
                    </Link>
                  ))}

                  <Separator className="my-2" />
                  
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Store className="h-4 w-4" /> App Store Tools</h3>
                  {appStoreTools.map(item => (
                    <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary', pathname === item.href && 'text-primary bg-muted')}>
                      <item.icon className="h-4 w-4" />{item.label}
                    </Link>
                  ))}

                   <Separator className="my-2" />
                   
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><TiktokIcon /> TikTok Tools</h3>
                  {tiktokTools.map(item => (
                    <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary', pathname === item.href && 'text-primary bg-muted')}>
                      <item.icon className="h-4 w-4" />{item.label}
                    </Link>
                  ))}

                  <Separator className="my-2" />

                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Clapperboard className="h-4 w-4" /> Video Gen Tools</h3>
                  {videoGenTools.map(item => (
                    <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary', pathname === item.href && 'text-primary bg-muted')}>
                      <item.icon className="h-4 w-4" />{item.label}
                    </Link>
                  ))}

                   <Separator className="my-2" />

                   {otherTools.map(item => (
                    <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary', pathname === item.href && 'text-primary bg-muted')}>
                      <item.icon className="h-4 w-4" />{item.label}
                    </Link>
                  ))}

                  <Separator className="my-2" />

                  <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                   {legalNavItems.map(item => (
                    <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary', pathname === item.href && 'text-primary bg-muted')}>
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
