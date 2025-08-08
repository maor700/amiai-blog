"use client";
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DateComponent from './date';
import { getInitials, getAvatarColor } from '@/lib/utils/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import WysiwygEditor from './wysiwyg-editor';
import { getTextContent, sanitizeHtml } from '@/lib/utils/html-sanitizer';

interface CommentItemProps {
  _id: string;
  createdAt: string;
  name: string;
  email: string;
  comment: string;
  isOptimistic?: boolean;
  isFailed?: boolean;
  parentId?: string;
  replies?: CommentItemProps[];
  reactions?: { likes: number; dislikes?: number };
  onReply?: (parentId: string, replyData: any) => void;
  depth?: number;
  postId?: string;
  onRefreshComments?: () => void;
}

export default function CommentItem({ 
  _id, 
  createdAt, 
  name, 
  email, 
  comment, 
  isOptimistic,
  isFailed,
  replies = [],
  reactions,
  onReply,
  depth = 0,
  postId,
  onRefreshComments
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyMode, setReplyMode] = useState<'simple' | 'wysiwyg'>('simple');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [likes, setLikes] = useState(reactions?.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(() => {
    if (typeof window !== 'undefined') {
      const likedComments = localStorage.getItem('liked_comments');
      return likedComments ? JSON.parse(likedComments).includes(_id) : false;
    }
    return false;
  });
  const maxDepth = 3;
  const avatarColors = getAvatarColor(name);
  
  const handleLike = async () => {
    if (isLiking || !postId) return;
    
    setIsLiking(true);
    const action = hasLiked ? 'unlike' : 'like';
    const optimisticLikes = hasLiked ? likes - 1 : likes + 1;
    const newHasLiked = !hasLiked;
    
    // Optimistic update
    setLikes(optimisticLikes);
    setHasLiked(newHasLiked);
    
    // Update localStorage
    const likedComments = JSON.parse(localStorage.getItem('liked_comments') || '[]');
    if (newHasLiked) {
      likedComments.push(_id);
    } else {
      const index = likedComments.indexOf(_id);
      if (index > -1) likedComments.splice(index, 1);
    }
    localStorage.setItem('liked_comments', JSON.stringify(likedComments));
    
    try {
      const response = await fetch(`/blog/api/comments/${postId}/${_id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like');
      }
      
      const data = await response.json();
      setLikes(data.likes);
      
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      setLikes(likes);
      setHasLiked(hasLiked);
      
      // Revert localStorage
      const currentLikedComments = JSON.parse(localStorage.getItem('liked_comments') || '[]');
      if (hasLiked) {
        currentLikedComments.push(_id);
      } else {
        const index = currentLikedComments.indexOf(_id);
        if (index > -1) currentLikedComments.splice(index, 1);
      }
      localStorage.setItem('liked_comments', JSON.stringify(currentLikedComments));
    }
    
    setIsLiking(false);
  };
  
  const handleReply = async () => {
    const textContent = getTextContent(replyText).trim();
    if (!textContent || !onReply) return;

    setIsSubmittingReply(true);

    // Get saved user data from localStorage
    const savedName = localStorage.getItem('comment_author_name');
    const savedEmail = localStorage.getItem('comment_author_email');
    
    const correlationId = uuidv4();
    
    const replyData = { 
      comment: replyText,
      name: savedName ? JSON.parse(savedName) : 'אנונימי',
      email: (savedEmail && JSON.parse(savedEmail)) || 'anonymous@example.com',
      correlationId: correlationId
    };
    
    console.log('Submitting reply:', replyData, 'to parent:', _id);
    
    // Close form immediately
    setShowReplyForm(false);
    setReplyText('');
    
    // Call parent's onReply to add to global state
    onReply(_id, replyData);
    
    // Make API call
    try {
      if (!postId) {
        throw new Error('No postId available for API call');
      }
      
      const response = await fetch(`api/comments/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: postId,
          name: replyData.name,
          email: replyData.email,
          comment: replyData.comment,
          parentId: _id, // This is the parent comment ID
          correlationId: replyData.correlationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }
      
      console.log('Reply submitted successfully to API');
      
      // Refresh comments to get the real comment from server
      if (onRefreshComments) {
        setTimeout(() => {
          onRefreshComments();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error submitting reply:', error);
      // TODO: Handle API error - could show error state or retry
    }
    
    setIsSubmittingReply(false);
  };

  return (
    <div id={`comment-${_id}`} className={`${depth > 0 ? 'ms-8 border-s-2 border-gray-200 ps-4' : ''}`}>
      <div className={`mb-4 p-4 rounded-lg transition-all duration-500 ${
        isOptimistic ? 'bg-blue-50 border-blue-200 animate-fade-out' : 'bg-white'
      } ${
        isFailed ? 'bg-red-50 border-red-300 border' : 'border border-gray-200'
      } hover:shadow-md comment-card`}>
        <div className="flex items-start gap-3">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold`}
            style={{
              backgroundColor: avatarColors.hexColor,
              color: avatarColors.textColor === 'text-white' ? 'white' : '#1f2937'
            }}
          >
            {getInitials(name)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{name}</h4>
                    {isFailed && (
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">נכשל</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    <DateComponent dateString={createdAt} />
                  </span>
                </div>
            
                <div className="prose prose-sm max-w-none text-gray-700" dir="rtl">
                  {comment.includes('<') ? (
                    // HTML content from WYSIWYG editor
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment) }} />
                  ) : (
                    // Markdown content
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {comment}
                    </ReactMarkdown>
                  )}
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  {!isOptimistic && depth < maxDepth && onReply && (
                    <button
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {showReplyForm ? 'ביטול' : 'תגובה'}
                    </button>
                  )}
                  
                  {/* Like button in same line as reply button */}
                  {!isOptimistic && (
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`flex items-center gap-1 p-2 rounded-full transition-colors ${
                        hasLiked 
                          ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                          : 'text-gray-400 hover:text-red-600 hover:bg-gray-50'
                      } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <svg 
                        className={`w-5 h-5 transition-all ${hasLiked ? 'fill-current' : 'fill-none'}`} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                      {likes > 0 && (
                        <span className="text-sm font-medium">{likes}</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {replies && replies.length > 0 && (
        <div className="mt-2">
          {replies.slice(0, showAllReplies ? replies.length : 1).map((reply) => (
            <CommentItem
              key={reply._id}
              {...reply}
              onReply={onReply}
              depth={depth + 1}
              postId={postId}
              onRefreshComments={onRefreshComments}
            />
          ))}
          
          {replies.length > 1 && (
            <div className="mt-3 ms-8">
              <button
                onClick={() => setShowAllReplies(!showAllReplies)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {showAllReplies ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    הסתר תגובות
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    הצג עוד {replies.length - 1} תגובות
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Reply Form - positioned after all replies */}
      {showReplyForm && (
        <div id={`reply-form-${_id}`} className={`mt-4 ${depth > 0 ? 'ms-8 border-s-2 border-gray-200 ps-4' : ''}`} dir="rtl">
          <div className="p-4 bg-gray-50 rounded-md transition-all duration-300">
            <div className="flex items-start gap-3">
              {(() => {
                const savedName = localStorage.getItem('comment_author_name') ? JSON.parse(localStorage.getItem('comment_author_name')!) : 'אנונימי';
                const replyAvatarColors = getAvatarColor(savedName);
                return (
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold`}
                    style={{
                      backgroundColor: replyAvatarColors.hexColor,
                      color: replyAvatarColors.textColor === 'text-white' ? 'white' : '#1f2937'
                    }}
                  >
                    {getInitials(savedName)}
                  </div>
                );
              })()}
              <div className="flex-1">
                <div className="mb-2 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setReplyMode('simple')}
                    className={`text-xs px-2 py-1 rounded ${
                      replyMode === 'simple' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    פשוט
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyMode('wysiwyg')}
                    className={`text-xs px-2 py-1 rounded ${
                      replyMode === 'wysiwyg' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    עורך מתקדם
                  </button>
                </div>
                
                {replyMode === 'wysiwyg' ? (
                  <WysiwygEditor
                    content={replyText}
                    onChange={setReplyText}
                    placeholder={`תגובה ל-${name}...`}
                    dir="rtl"
                    className="mb-2"
                  />
                ) : (
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`תגובה ל-${name}...`}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-2"
                    rows={3}
                    autoFocus
                    dir="rtl"
                  />
                )}
                
                <div className="flex gap-2 justify-start">
                  <button
                    onClick={handleReply}
                    disabled={!getTextContent(replyText).trim() || isSubmittingReply}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReply ? 'שולח...' : 'שלח תגובה'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyText('');
                    }}
                    disabled={isSubmittingReply}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm disabled:opacity-50"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}