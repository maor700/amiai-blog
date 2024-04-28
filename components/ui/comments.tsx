"use client";
import { use } from 'react';
import Date from './date'

interface CommentProps {
 _id: string;
 createdAt: string;
 name: string;
 email: string;
 comment: string;
}

interface CommentsProps {
 comments?: CommentProps[];
}

export default function Comments({ comments = [] }: CommentsProps) {
 return (
   <>
     <h2 className="mt-10 mb-4 text-xl leading-tight">
       תגובות
     </h2>
     <ul>
       {comments?.map(({ _id, createdAt, name, email, comment }) => (
         <li key={_id} className="mb-5">
           <hr className="mb-5" />
           <h4 className="mb-2 leading-tight">
             <a href={`mailto:${email}`}>{name}</a> (
             <Date dateString={createdAt} />)
           </h4>
           <p>{comment}</p>
           <hr className="mt-5 mb-5" />
         </li>
       ))}
     </ul>
   </>
 )
}