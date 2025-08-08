"use client";
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CommentItem from './comment-item';
import CommentForm from './comment-form';

interface CommentProps {
  _id: string;
  createdAt: string;
  name: string;
  email: string;
  comment: string;
  parentId?: string;
  isOptimistic?: boolean;
  correlationId?: string;
  reactions?: { likes: number; dislikes?: number };
}

interface CommentsEnhancedProps {
  postId: string;
}

export default function CommentsEnhanced({ postId }: CommentsEnhancedProps) {
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [optimisticComments, setOptimisticComments] = useState<CommentProps[]>([]);
  const [failedComments, setFailedComments] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('oldest');
  
  const submitHandler = useCallback(async (commentData: any, success: boolean, error?: boolean) => {
    if (success && !error) {
      const optimisticId = `optimistic-${Date.now()}`;
      
      const newComment: CommentProps = {
        _id: optimisticId,
        createdAt: new Date().toISOString(),
        name: commentData.name,
        email: commentData.email,
        comment: commentData.comment,
        parentId: commentData.parentId,
        isOptimistic: true
      };
      
      setOptimisticComments(prev => [...prev, newComment]);
      
      // After 2 seconds, remove the optimistic flag (keep the comment but remove blue styling)
      setTimeout(() => {
        setOptimisticComments(prev => 
          prev.map(c => c._id === optimisticId ? { ...c, isOptimistic: false } : c)
        );
      }, 2000);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const commentsUrl = `api/comments/${postId}`;
      const res = await fetch(commentsUrl);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // This effect is now handled by fetchComments clearing optimistic comments

  const handleReply = useCallback((parentId: string, replyData: any) => {
    console.log('handleReply called with:', { parentId, replyData, postId });
    
    const fullReplyData = {
      ...replyData,
      parentId,
      _id: postId,
      name: replyData.name || 'אנונימי',
      email: replyData.email || 'anonymous@example.com',
      correlationId: replyData.correlationId // Pass through the correlationId
    };
    
    console.log('Calling submitHandler with:', fullReplyData);
    submitHandler(fullReplyData, true, false);
  }, [postId, submitHandler]);

  const organizeComments = (comments: CommentProps[]) => {
    const commentMap = new Map<string, CommentProps & { replies: CommentProps[] }>();
    const rootComments: (CommentProps & { replies: CommentProps[] })[] = [];
    
    comments.forEach(comment => {
      commentMap.set(comment._id, { ...comment, replies: [] });
    });
    
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment._id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(commentWithReplies);
      } else if (!comment.parentId) {
        rootComments.push(commentWithReplies);
      }
    });
    
    return rootComments;
  };

  // Show both optimistic and real comments
  const allComments = [...optimisticComments, ...comments];
  const sortedComments = sortBy === 'newest' 
    ? [...allComments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [...allComments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  const organizedComments = organizeComments(sortedComments);

  return (
    <div className="mt-12" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          תגובות ({allComments.length})
        </h2>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="newest">החדשות ביותר</option>
          <option value="oldest">הישנות ביותר</option>
        </select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {organizedComments.length > 0 ? (
            organizedComments.map(comment => (
              <CommentItem
                key={comment._id}
                {...comment}
                isFailed={failedComments.has(comment._id)}
                onReply={handleReply}
                postId={postId}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              עדיין אין תגובות. היה הראשון להגיב!
            </p>
          )}
        </div>
      )}
      
      <CommentForm 
        postId={postId} 
        onSubmit={submitHandler}
      />
    </div>
  );
}