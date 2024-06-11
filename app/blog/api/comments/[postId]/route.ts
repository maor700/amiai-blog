import { snClient } from '@/app/lib/sanity';
import { Command } from 'lucide-react';
import { NextApiRequest } from 'next';
import { NextRequest, NextResponse } from 'next/server';

type CommentItem = {
    _id: string;
    name: string;
    email: string;
    comment: string;
};

function sanitize(str: string) {
    return str.replace(/<[^>]*>?/gm, '');
}

export const GET = async (req: NextRequest, context: any) => {
    const {  postId } = context.params;
    console.log(postId);
    try {
        const data = await snClient.fetch(`*[_type == "comment" && post._ref == '${postId}'] | order(_createdAt desc)`);
        console.log(data);
        return NextResponse.json(data);
    } catch (error) {
      // status code 400: Bad Request
      return NextResponse.error();
    }
  };
  
  export const POST = async (req: Request) => {
    try {
      const commentData: CommentItem = await req.json();
      console.log('commentData', commentData);
      // sanitize comment
      const { _id, name, email, comment } = commentData;
      await snClient.create({
        _type: 'comment',
        post: {
          _type: 'reference',
          _ref: sanitize(_id),
        },
        name: sanitize(name),
        email: sanitize(email),
        comment: sanitize(comment),
        createdAt: new Date().toISOString(),
        approved: true,
      });
      return NextResponse.json({ success: true, data: commentData });
    } catch (error) {
      console.error("********** Error submitting comment **********");
      return NextResponse.error();
    }
  };