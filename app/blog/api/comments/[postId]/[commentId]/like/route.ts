import { snClient } from '@/app/lib/sanity';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest, context: any) => {
  try {
    const { postId, commentId } = context.params;
    const { action } = await req.json(); // 'like' or 'unlike'
    
    console.log(`${action} comment:`, commentId, 'in post:', postId);
    
    // Get current reactions
    const currentComment = await snClient.fetch(
      `*[_type == "comment" && _id == $commentId][0]{
        reactions
      }`,
      { commentId }
    );
    
    if (!currentComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    const currentLikes = currentComment.reactions?.likes || 0;
    const newLikes = action === 'like' ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    
    // Update the comment
    const result = await snClient
      .patch(commentId)
      .set({
        'reactions.likes': newLikes,
        updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('Like updated successfully:', result._id, 'new likes:', newLikes);
    
    return NextResponse.json({ 
      success: true, 
      likes: newLikes 
    });
  } catch (error) {
    console.error('Error updating like:', error);
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
  }
};