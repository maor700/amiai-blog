"use client";
import { use, useCallback, useEffect, useState } from 'react';
import DateComponent from './date'
import Form from './form';
import { Expander } from './Expander';

interface CommentProps {
  _id: string;
  createdAt: string;
  name: string;
  email: string;
  comment: string;
  isOptimistic?: boolean;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [optimisticComments, setOptimisticComments] = useState<CommentProps[]>([]);
  const [failedComments, setFailedComments] = useState<Set<string>>(new Set());
  
  const submitHandler = useCallback((commentData: any, success: boolean, error?: boolean) => {
    const optimisticId = `optimistic-${Date.now()}`;
    
    if (success && !error) {
      const newComment: CommentProps = {
        _id: optimisticId,
        createdAt: new Date().toISOString(),
        name: commentData.name,
        email: commentData.email,
        comment: commentData.comment,
        isOptimistic: true
      };
      
      setOptimisticComments(prev => [newComment, ...prev]);
      
      // After successful save, convert optimistic to permanent
      setTimeout(() => {
        setOptimisticComments(prev => {
          const savedComment = prev.find(c => c._id === optimisticId);
          if (savedComment) {
            setComments(prevComments => [
              { ...savedComment, isOptimistic: false },
              ...prevComments
            ]);
            return prev.filter(c => c._id !== optimisticId);
          }
          return prev;
        });
      }, 2000);
    } else if (error) {
      // Handle error case
      setFailedComments(prev => new Set(prev).add(commentData.tempId || optimisticId));
    }
  }, []);

  useEffect(() => {
    const commentsUrl = `api/comments/${postId}`;
    fetch(commentsUrl).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }
      return res.json();
    }).then(setComments);
  }, [postId]);

  return (
    <>
      <h2 className="mt-10 mb-4 text-xl leading-tight">
        תגובות
      </h2>
      <Expander 
      maxHeight={300} 
      showHintEdgeGradient
      ButtonText={{ expand: 'הצג את כל התגובות', collapse: 'צמצם את התגובות' }}
      >
        <ul>
          {[...optimisticComments, ...comments]?.map(({ _id, createdAt, name, email, comment, isOptimistic }) => (
            <li key={_id} className={`mb-5 ${isOptimistic ? 'opacity-70' : ''} ${failedComments.has(_id) ? 'border-red-500 border-l-4 pl-4' : ''}`}>
              <h4 className="flex gap-1 justify-between mb-2 leading-tight opacity-50">
                <span>
                  {name} 
                  {isOptimistic && !failedComments.has(_id) && <span className="text-xs text-blue-600">(שולח...)</span>}
                  {failedComments.has(_id) && <span className="text-xs text-red-600">(נכשל - נסה שוב)</span>}
                </span>
                <span className='text-sm'>
                  <DateComponent dateString={createdAt} />
                </span>
              </h4>
              <p>{comment}</p>
              <hr className="mt-5 mb-5" />
            </li>
          ))}
        </ul>
      </Expander>
      <Form onSubmitSuccess={submitHandler} _id={postId} />
    </>
  )
}