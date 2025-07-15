
import { getAdsTxtContent } from '@/lib/ads-txt-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const content = await getAdsTxtContent();

    if (!content) {
      return new NextResponse('No ads.txt content has been configured.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Failed to generate ads.txt:', error);
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}