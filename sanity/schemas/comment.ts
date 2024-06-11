import { CommentIcon } from '@sanity/icons'

export default {
  name: 'comment',
  type: 'document',
  title: 'Comment',
  icon: CommentIcon,
  fields: [
    {
      name: 'name',
      type: 'string',
    },
    {
      title: 'Approved',
      name: 'approved',
      type: 'boolean',
      description: "Comments won't show on the site without approval",
    },
    {
      name: 'email',
      type: 'string',
    },
    {
      name: 'comment',
      type: 'text',
    },
    {
      name: 'post',
      type: 'reference',
      to: [{ type: 'post' }],
    },
    {
        name: 'createdAt',
        type: 'datetime',
    },
  ],
  preview: {
    select: {
      name: 'name',
      comment: 'comment',
      post: 'post.title',
    },
    prepare(value: any) {
      const { name, comment, post } = value;
      return {
        title: name && post ? `${name} on ${post}` : 'Untitled',
        subtitle: comment ?? '',
      };
    },
  },
}