"use client"
import { createRef, use, useCallback, useState } from 'react'

interface FormProps {
  _id: string,
  onSubmitSuccess: (response: any) => void
}

export default function Form({ _id, onSubmitSuccess }: FormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const formElm = createRef<HTMLFormElement>();

  const handleSubmit = useCallback(async (event: any) => {
    setIsLoading(true);
    const data = Object.fromEntries([...event.entries()]) as any;
    try {
      const commentsUrl = `api/comments/${_id}`;
      const response = await fetch(commentsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        setIsSubmitted(true);
        formElm.current?.reset();
        onSubmitSuccess(data);
      }
    } catch (error) {
      setError('ארעה שגיאה בשליחת התגובה');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsSubmitted(false);
        setError('');
      }, 5000);
    }
  }, [_id, formElm, onSubmitSuccess]);

  return (
    <form ref={formElm} action={handleSubmit} id='add-comment-form' className="w-full max-w-lg relative ">
      <div className={`absolute top-0 left-0 w-full h-full bg-white bg-opacity-50 flex items-center justify-center ${isLoading ? 'visible' : 'hidden'}
      `} role="status">
        <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
      </div>
      <h2 className="mt-10 mb-4 text-xl leading-tight">השאר תגובה</h2>
      <input name="_id" type="hidden" value={_id} />
      <div className="flex gap-3">
        <label className="mb-5 block">
          <input
            name="name"
            className="form-input mt-1 block w-full rounded border py-2 px-3 shadow"
            placeholder="שמך כאן..."
            required
          />
        </label>
        <label className="mb-5 block">
          <input
            type="email"
            name="email"
            className="form-input mt-1 block w-full rounded border py-2 px-3 shadow"
            placeholder="your@email.com"
            required
          />
        </label>
      </div>
      <label className="mb-5 block">
        <span className="text-gray-700">תגובה</span>
        <textarea
          name="comment"
          className="form-textarea mt-1 block w-full rounded border py-2 px-3 shadow"
          rows={3}
          placeholder="התגובה שלך כאן..."
          required
        />
      </label>
      <input
       onClick={()=>{setIsLoading(true);}}
        type="submit"
        className="focus:shadow-outline rounded bg-blue-900 text-white py-2 px-4 rounded-sm hover:bg-blue-800 cursor-pointer focus:outline-none"
      />
      {isLoading && <p>שולח תגובה...</p>}
      {isSubmitted && !error && <p>התגובה נשלחה בהצלחה</p>}
      {error && <p>{error}</p>}
    </form>
  )
}