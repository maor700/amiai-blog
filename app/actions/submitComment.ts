// app/actions/submitComment.ts
'use server'

import { revalidatePath } from 'next/cache'
import { snClient } from '../lib/sanity'

export const submitComment = async (formData: FormData) => {
  const data = {
    _id: formData.get('_id')?.toString() || '',
    name: formData.get('name')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    comment: formData.get('comment')?.toString() || '',
  }

  // Perform server-side validation
  const validationErrors = validateFormData(data)
  if (validationErrors.length > 0) {
    // Handle validation errors
    return { errors: validationErrors }
  }

  try {
    await snClient.create({
      _type: 'comment',
      post: {
        _type: 'reference',
        _ref: data._id,
      },
      name: data.name,
      email: data.email,
      comment: data.comment,
      createdAt: new Date().toISOString(),
      approved: true,
    })

    revalidatePath(`/blog/${data._id}`) // Revalidate the blog post page after a successful submission

    return { ok: true }
  } catch (error) {
    console.error('Error submitting comment:', error)
    return { ok: false, message: 'An error occurred while submitting the comment' }
  }
}

// Validation function
const validateFormData = (data: { _id: string; name: string; email: string; comment: string }) => {
  const errors: string[] = []

  if (!data._id.trim()) {
    errors.push('Post ID is required')
  }

  if (!data.name.trim()) {
    errors.push('Name is required')
  }

  if (!data.email.trim()) {
    errors.push('Email is required')
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.push('Invalid email address')
  }

  if (!data.comment.trim()) {
    errors.push('Comment is required')
  }

  return errors
}