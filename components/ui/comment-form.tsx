"use client"
import { useState, useCallback, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import WysiwygEditor from './wysiwyg-editor'
import { getTextContent } from '@/lib/utils/html-sanitizer'

interface CommentFormProps {
  postId: string,
  onSubmit: (commentData: any, success: boolean, error?: boolean) => void
  parentId?: string,
  onRefreshComments?: () => void
}

export default function CommentForm({ postId, onSubmit, parentId, onRefreshComments }: CommentFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'markdown'>('wysiwyg');
  
  const [savedName, setSavedName] = useLocalStorage('comment_author_name', '');
  const [savedEmail, setSavedEmail] = useLocalStorage('comment_author_email', '');
  const [rememberMe, setRememberMe] = useLocalStorage('comment_remember_me', true);
  
  const [name, setName] = useState(savedName);
  const [email, setEmail] = useState(savedEmail);
  
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (rememberMe) {
      setName(savedName);
      setEmail(savedEmail);
    }
  }, [savedName, savedEmail, rememberMe]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Get actual text content for validation (strip HTML)
    const textContent = getTextContent(comment).trim();
    if (!textContent) {
      setError('נא להכניס תוכן תגובה');
      setIsLoading(false);
      return;
    }

    const correlationId = uuidv4();
    const data = {
      _id: postId,
      name: name.trim(),
      email: email.trim() || 'anonymous@example.com',
      comment: comment.trim(),
      parentId: parentId,
      correlationId: correlationId
    };
    
    if (rememberMe) {
      setSavedName(data.name);
      setSavedEmail(email.trim()); // Save actual email, not fallback
    }
    
    onSubmit(data, true, false);
    setComment('');
    setIsSubmitted(true);
    
    try {
      const commentsUrl = `api/comments/${postId}`;
      const response = await fetch(commentsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit');
      }
      
      // Refresh comments to get the real comment from server
      if (onRefreshComments) {
        setTimeout(() => {
          onRefreshComments();
        }, 1000);
      }
    } catch (error) {
      setError('ארעה שגיאה בשליחת התגובה');
      onSubmit(data, false, true);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsSubmitted(false);
        setError('');
      }, 3000);
    }
  }, [postId, parentId, name, email, comment, rememberMe, onSubmit, setSavedName, setSavedEmail, onRefreshComments]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full relative bg-white rounded-lg border border-gray-200 p-6" dir="rtl">
      <h3 className="text-lg font-semibold mb-4">השאר תגובה</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שם
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="השם שלך"
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            אימייל <span className="text-gray-400 font-normal">(אופציונלי)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="your@email.com (אופציונלי)"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            תגובה
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditorMode('wysiwyg')}
              className={`text-sm px-2 py-1 rounded ${
                editorMode === 'wysiwyg' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              עורך מתקדם
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('markdown')}
              className={`text-sm px-2 py-1 rounded ${
                editorMode === 'markdown' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              Markdown
            </button>
          </div>
        </div>
        
        {editorMode === 'wysiwyg' ? (
          <WysiwygEditor
            content={comment}
            onChange={setComment}
            placeholder="כתוב את התגובה שלך..."
            dir="rtl"
          />
        ) : (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            placeholder="כתוב את התגובה שלך... (תומך ב-Markdown)"
            disabled={isLoading}
            dir="rtl"
          />
        )}
        
        <p className="mt-1 text-xs text-gray-500">
          {editorMode === 'wysiwyg' 
            ? 'השתמש בעורך המתקדם לעיצוב הטקסט שלך'
            : 'תומך ב-Markdown: **מודגש**, *נטוי*, `קוד`, [קישור](url)'
          }
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="me-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">זכור אותי</span>
        </label>
        
        <button
          type="submit"
          disabled={isLoading || !getTextContent(comment).trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'שולח...' : 'שלח תגובה'}
        </button>
      </div>
      
      {isSubmitted && !error && (
        <p className="mt-3 text-sm text-green-600">התגובה נשלחה בהצלחה!</p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </form>
  )
}