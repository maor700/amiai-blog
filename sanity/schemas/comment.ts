import { CommentIcon } from '@sanity/icons'

export default {
  name: 'comment',
  type: 'document',
  title: 'Comment',
  icon: CommentIcon,
  fields: [
    {
      name: 'author',
      type: 'object',
      title: 'Author',
      fields: [
        {
          name: 'name',
          type: 'string',
          title: 'Name',
          validation: (Rule: any) => Rule.required().min(2).max(50)
        },
        {
          name: 'email',
          type: 'string',
          title: 'Email',
          validation: (Rule: any) => Rule.email()
        },
        {
          name: 'website',
          type: 'url',
          title: 'Website (optional)'
        }
      ]
    },
    {
      name: 'content',
      type: 'text',
      title: 'Comment Content',
      validation: (Rule: any) => Rule.required().min(1).max(1000)
    },
    {
      name: 'post',
      type: 'reference',
      title: 'Post',
      to: [{ type: 'post' }],
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'parentComment',
      type: 'reference',
      title: 'Parent Comment',
      to: [{ type: 'comment' }],
      description: 'Reference to parent comment for threading (leave empty for root comments)'
    },
    {
      name: 'thread',
      type: 'object',
      title: 'Threading Info',
      fields: [
        {
          name: 'depth',
          type: 'number',
          title: 'Thread Depth',
          description: 'How deep in the thread this comment is (0 = root)',
          initialValue: 0,
          validation: (Rule: any) => Rule.min(0).max(10)
        },
        {
          name: 'path',
          type: 'string',
          title: 'Thread Path',
          description: 'Hierarchical path for efficient querying (e.g., "1/3/5")'
        },
        {
          name: 'rootComment',
          type: 'reference',
          title: 'Root Comment',
          to: [{ type: 'comment' }],
          description: 'Reference to the root comment of this thread'
        }
      ]
    },
    {
      name: 'status',
      type: 'string',
      title: 'Status',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Spam', value: 'spam' }
        ],
        layout: 'radio'
      },
      initialValue: 'pending'
    },
    {
      name: 'metadata',
      type: 'object',
      title: 'Metadata',
      fields: [
        {
          name: 'ipAddress',
          type: 'string',
          title: 'IP Address',
          description: 'For spam protection'
        },
        {
          name: 'userAgent',
          type: 'string',
          title: 'User Agent'
        },
        {
          name: 'isEdited',
          type: 'boolean',
          title: 'Is Edited',
          initialValue: false
        },
        {
          name: 'editedAt',
          type: 'datetime',
          title: 'Last Edited At'
        },
        {
          name: 'correlationId',
          type: 'string',
          title: 'Correlation ID',
          description: 'Used to match optimistic comments with real ones'
        }
      ]
    },
    {
      name: 'reactions',
      type: 'object',
      title: 'Reactions',
      fields: [
        {
          name: 'likes',
          type: 'number',
          title: 'Likes',
          initialValue: 0
        },
        {
          name: 'dislikes',
          type: 'number',
          title: 'Dislikes',
          initialValue: 0
        }
      ]
    },
    {
      name: 'createdAt',
      type: 'datetime',
      title: 'Created At',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'updatedAt',
      type: 'datetime',
      title: 'Updated At'
    }
  ],
  initialValue: {
    status: 'pending',
    createdAt: new Date().toISOString(),
    reactions: {
      likes: 0,
      dislikes: 0
    },
    thread: {
      depth: 0
    },
    metadata: {
      isEdited: false
    }
  },
  orderings: [
    {
      title: 'Created At (Oldest First)',
      name: 'createdAtAsc',
      by: [{ field: 'createdAt', direction: 'asc' }]
    },
    {
      title: 'Created At (Newest First)', 
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }]
    },
    {
      title: 'Thread Path',
      name: 'threadPath',
      by: [{ field: 'thread.path', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      name: 'author.name',
      comment: 'content',
      post: 'post.title',
      status: 'status',
      depth: 'thread.depth',
      createdAt: 'createdAt'
    },
    prepare(value: any) {
      const { name, comment, post, status, depth, createdAt } = value;
      const indent = '→ '.repeat(depth || 0);
      const statusEmoji = {
        pending: '⏳',
        approved: '✅',
        rejected: '❌',
        spam: '🚫'
      }[status] || '❓';
      
      return {
        title: `${indent}${statusEmoji} ${name} on ${post}`,
        subtitle: `${comment?.slice(0, 100)}...`,
        media: CommentIcon
      };
    },
  },
}