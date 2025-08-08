"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useCallback } from 'react';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  dir?: 'rtl' | 'ltr';
}

export default function WysiwygEditor({ 
  content, 
  onChange, 
  placeholder = "כתוב את התגובה שלך...",
  className = "",
  dir = "rtl"
}: WysiwygEditorProps) {
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-3',
        dir: dir,
      },
    },
    immediatelyRender: false,
  });

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt('הכנס קישור:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const removeLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-gray-300 rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${className}`} dir={dir}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50 rounded-t-md">
        <button
          type="button"
          onClick={toggleBold}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('bold') 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          <strong>מודגש</strong>
        </button>
        
        <button
          type="button"
          onClick={toggleItalic}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('italic') 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          <em>נטוי</em>
        </button>
        
        <button
          type="button"
          onClick={toggleStrike}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('strike') 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          <s>מחוק</s>
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={toggleBulletList}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('bulletList') 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          • רשימה
        </button>
        
        <button
          type="button"
          onClick={toggleOrderedList}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('orderedList') 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          1. רשימה ממוספרת
        </button>
        
        <button
          type="button"
          onClick={toggleBlockquote}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('blockquote') 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          " ציטוט
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={editor.isActive('link') ? removeLink : addLink}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('link') 
              ? 'bg-red-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {editor.isActive('link') ? '🗑️ הסר קישור' : '🔗 קישור'}
        </button>
      </div>
      
      {/* Editor Content */}
      <div className="min-h-[100px]">
        <EditorContent 
          editor={editor} 
          className="h-full"
        />
      </div>
      
      {/* Footer with tips */}
      <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-200 rounded-b-md">
        השתמש בסרגל הכלים למעלה לעיצוב הטקסט שלך
      </div>
    </div>
  );
}