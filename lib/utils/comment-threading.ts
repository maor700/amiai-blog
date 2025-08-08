import { snClient } from '@/app/lib/sanity';

export async function calculateThreadPath(parentId?: string): Promise<{
  depth: number;
  path: string;
  rootCommentId?: string;
}> {
  if (!parentId) {
    // Root comment
    return {
      depth: 0,
      path: '',
      rootCommentId: undefined
    };
  }

  try {
    // Get parent comment info
    const parent = await snClient.fetch(
      `*[_type == "comment" && _id == $parentId][0] {
        _id,
        "depth": thread.depth,
        "path": thread.path,
        "rootCommentId": thread.rootComment._ref
      }`,
      { parentId }
    );

    if (!parent) {
      throw new Error('Parent comment not found');
    }

    const newDepth = (parent.depth || 0) + 1;
    const rootId = parent.rootCommentId || parent._id;
    
    // Generate new path segment
    const pathSegment = Date.now().toString(36);
    const newPath = parent.path ? `${parent.path}/${pathSegment}` : pathSegment;

    return {
      depth: newDepth,
      path: newPath,
      rootCommentId: rootId
    };
  } catch (error) {
    console.error('Error calculating thread path:', error);
    // Fallback to root comment
    return {
      depth: 0,
      path: '',
      rootCommentId: undefined
    };
  }
}

export function getRequestMetadata(req: Request) {
  const userAgent = req.headers.get('user-agent') || '';
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown';

  return {
    userAgent,
    ipAddress: ipAddress.trim()
  };
}