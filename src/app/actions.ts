'use server';

import { z } from 'zod';
import { getYoutubeApiKey } from '@/lib/genkit-service';

const VideoDetailsSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
});

export type VideoDetails = z.infer<typeof VideoDetailsSchema>;

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

  const apiKey = await getYoutubeApiKey();
  if (!apiKey) {
    throw new Error('YouTube API key is not configured in the database.');
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
