'use server'

import { submitComment } from '@/app/actions/submitComment'

interface FormProps {
  _id: string
}

interface FormData {
  name: string
  email: string
  comment: string
  _id: string
}

export default async function Form({ _id }: FormProps) {
   return (
    <form action={submitComment} className="w-full max-w-lg">
      <input name="_id" type="hidden" value={_id} />
      <label className="mb-5 block">
        <span className="text-gray-700">Name</span>
        <input
          name="name"
          className="form-input mt-1 block w-full rounded border py-2 px-3 shadow"
          placeholder="John Appleseed"
          required
        />
      </label>
      <label className="mb-5 block">
        <span className="text-gray-700">Email</span>
        <input
          type="email"
          name="email"
          className="form-input mt-1 block w-full rounded border py-2 px-3 shadow"
          placeholder="your@email.com"
          required
        />
      </label>
      <label className="mb-5 block">
        <span className="text-gray-700">Comment</span>
        <textarea
          name="comment"
          className="form-textarea mt-1 block w-full rounded border py-2 px-3 shadow"
          rows={8}
          placeholder="Enter some long form content."
          required
        />
      </label>
      <input
        type="submit"
        className="focus:shadow-outline rounded bg-purple-500 py-2 px-4 font-bold text-white shadow hover:bg-purple-400 focus:outline-none"
      />
    </form>
  )
}