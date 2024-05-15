"use client";
import { use, useCallback, useEffect, useState } from 'react';
import Date from './date'
import Form from './form';
import { Expander } from './Expander';

interface CommentProps {
  _id: string;
  createdAt: string;
  name: string;
  email: string;
  comment: string;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [revision, setRevision] = useState(0);
  const submitHandler = useCallback(() => {
    setTimeout(() => {
      setRevision((r) => r + 1);
    }, 10000);
  }, []);

  useEffect(() => {
    // get root of the current domain
    const commentsUrl = `api/comments/${postId}`;
    fetch(commentsUrl).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }
      return res.json();
    }).then(setComments);
    // This code will only run on the client-side
  }, [postId, revision]);

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
          {comments?.map(({ _id, createdAt, name, email, comment }) => (
            <li key={_id} className="mb-5">
              <h4 className="flex gap-1 justify-between mb-2 leading-tight opacity-50">
                <span>{name}</span>
                <span className='text-sm'>
                  <Date dateString={createdAt} />
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