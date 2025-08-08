import { snClient } from '@/app/lib/sanity';
import { NextRequest, NextResponse } from 'next/server';
import { calculateThreadPath, getRequestMetadata } from '@/lib/utils/comment-threading';

type CommentItem = {
    _id: string;
    name: string;
    email: string;
    comment: string;
};

import { sanitizeHtml } from '@/lib/utils/html-sanitizer';

function sanitizeText(str: string): string {
    // For plain text fields like name, email - strip all HTML
    return str.replace(/<[^>]*>?/gm, '');
}

function sanitizeComment(comment: string): string {
    // For comment content - allow safe HTML tags
    return comment.includes('<') ? sanitizeHtml(comment) : comment;
}

export const GET = async (req: NextRequest, context: any) => {
    const { postId } = context.params;
    console.log('Fetching comments for post:', postId);
    try {
        const query = `*[_type == "comment" && post._ref == '${postId}' && status == "approved"] | order(thread.path asc, createdAt asc) {
            _id,
            "name": author.name,
            "email": author.email, 
            "comment": content,
            createdAt,
            "parentId": parentComment._ref,
            "depth": thread.depth,
            "path": thread.path,
            "rootCommentId": thread.rootComment._ref,
            status,
            reactions,
            "isEdited": metadata.isEdited,
            "editedAt": metadata.editedAt,
            "correlationId": metadata.correlationId
        }`;
        
        const data = await snClient.fetch(query);
        console.log('Fetched comments:', data.length);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
};
  
export const POST = async (req: Request) => {
    try {
      const commentData: any = await req.json();
      console.log('Creating comment:', commentData);
      
      const { _id, name, email, comment, parentId, website, correlationId } = commentData;
      
      // Calculate threading info
      const threadingInfo = await calculateThreadPath(parentId);
      const metadata = getRequestMetadata(req);
      
      const newComment: any = {
        _type: 'comment',
        author: {
          name: sanitizeText(name),
          ...(email && email !== 'anonymous@example.com' && { email: sanitizeText(email) }),
          ...(website && { website: sanitizeText(website) })
        },
        content: sanitizeComment(comment),
        post: {
          _type: 'reference',
          _ref: sanitizeText(_id),
        },
        thread: {
          depth: threadingInfo.depth,
          path: threadingInfo.path,
          ...(threadingInfo.rootCommentId && {
            rootComment: {
              _type: 'reference',
              _ref: threadingInfo.rootCommentId
            }
          })
        },
        status: 'approved', // Auto-approve for now
        metadata: {
          ...metadata,
          isEdited: false,
          correlationId: correlationId || null
        },
        reactions: {
          likes: 0,
          dislikes: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add parent reference if it's a reply
      if (parentId && parentId !== 'undefined') {
        newComment.parentComment = {
          _type: 'reference',
          _ref: parentId
        };
      }
      
      const result = await snClient.create(newComment);
      console.log('Comment created successfully:', result._id);
      
      return NextResponse.json({ success: true, data: { ...commentData, _id: result._id } });
    } catch (error) {
      console.error("Error submitting comment:", error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
};