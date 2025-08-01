'use server';

import { z } from 'zod';
import { getSiteConfig } from '@/lib/site-config-service';

const VideoDetailsSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
});

export type VideoDetails = z.infer<typeof VideoDetailsSchema>;

const TikTokVideoDetailsSchema = z.object({
  success: z.boolean(),
  id: z.string().optional(),
  author_name: z.string().optional(),
  downloadUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  domain: z.string().optional(),
  message: z.string().optional(),
});

export type TikTokVideoDetails = z.infer<typeof TikTokVideoDetailsSchema>;


function extractVideoId(url: string): string | null {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function getVideoDetails(url: string): Promise<VideoDetails> {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error('Invalid YouTube URL provided.');
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube API key is not configured.');
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData);
      const message = errorData?.error?.message || response.statusText;
      throw new Error(`Failed to fetch video details: ${message}`);
    }
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found. Please check the URL.');
    }

    const snippet = data.items[0].snippet;
    return VideoDetailsSchema.parse({
      title: snippet.title,
      description: snippet.description,
      tags: snippet.tags || [],
    });
  } catch (error) {
    console.error('Error fetching video details:', error);
    if (error instanceof Error) {
      throw new Error(`Could not fetch video details: ${error.message}`);
    }
    throw new Error(
      'An unknown error occurred while fetching video details.'
    );
  }
}

export async function getTikTokVideoDetails(url: string): Promise<TikTokVideoDetails> {
    const lookupUrl = `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`;
  
    try {
      const response = await fetch(lookupUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      });
  
      if (!response.ok) {
        throw new Error(`API lookup failed with status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data.success) {
        return { success: false, message: data.message || "Failed to process video. It may be private or invalid." };
      }

      if (!data.token || !data.id) {
        return { success: false, message: "Could not retrieve necessary video information from API." };
      }
  
      const downloadUrl = `https://tikmate.app/download/${data.token}/${data.id}.mp4?hd=1`;

      const headResponse = await fetch(downloadUrl, { method: 'HEAD' });
      const contentLength = headResponse.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > 100 * 1024 * 1024) { // 100MB limit
        return { success: false, message: "Video is too large to download (over 100MB)." };
      }
      
      const { domain } = await getSiteConfig();
      const domainName = new URL(domain).hostname;
      
      return TikTokVideoDetailsSchema.parse({
        success: true,
        id: data.id,
        author_name: data.author_name,
        downloadUrl: downloadUrl,
        coverUrl: data.cover,
        domain: domainName,
      });
  
    } catch (error) {
      console.error('Error fetching TikTok video details:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { success: false, message: `Could not fetch video details: ${errorMessage}` };
    }
}
