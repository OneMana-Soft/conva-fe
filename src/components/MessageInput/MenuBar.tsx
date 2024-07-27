import React from "react";
import { useCurrentEditor } from '@tiptap/react'
import BoldIcon from '../../assets/bold.svg?react'
import ItalicIcon from '../../assets/italic.svg?react'
import StrikeIcon from '../../assets/strike.svg?react'
import OrderedListIcon from '../../assets/ordered-list-.svg?react'
import BulledtedListIcon from '../../assets/bulleted-list.svg?react'
import BlockquoteIcon from '../../assets/blockquote.svg?react'
import CodeIcon from '../../assets/code-svgrepo-com.svg?react'
import CodeBlockIcon from '../../assets/code-block.svg?react'

const MenuBar: React.FC = () => {
    
    const { editor } = useCurrentEditor()



    if (!editor) {
        return null;
    }

  return (

      <div className=" bg-gray-100 p-1 rounded-lg hidden md:block">
          <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`rounded p-2 m-0.5 hover:bg-gray-300 hover:cursor-pointer hover:color-grey-700 ${editor.isActive("bold") ? "bg-gray-300 color-grey-700" : "color-grey-300"}`}
          >
              <BoldIcon height='1rem' width='1rem' fill={editor.isActive("bold") ? '#000' : '#383838'}/>
          </button>
          <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`rounded p-2 m-0.5 hover:bg-gray-300 hover:cursor-pointer hover:color-grey-700 ${editor.isActive("italic") ? "bg-gray-300" : ""}`}
          >
              <ItalicIcon height='1rem' width='1rem' fill={editor.isActive("italic") ? '#000' : '#383838'}/>
          </button>
          <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={`rounded p-2 m-0.5 hover:bg-gray-300 hover:cursor-pointer hover:color-grey-700 ${editor.isActive("strike") ? "bg-gray-300" : ""}`}
          >
              <StrikeIcon height='1rem' width='1rem' fill={editor.isActive("strike") ? '#000' : '#383838'}/>
          </button>
          <div className="ml-2 mr-2 h-5 w-0.5 inline-block bg-gray-300"></div>


          <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`rounded p-2 m-0.5 hover:bg-gray-300 hover:color-grey-700 ${
                  editor.isActive("bulletList") ? "bg-gray-300" : ""
              }`}
          >
              <BulledtedListIcon height='1rem' width='1rem'
                                 fill={editor.isActive("bulletList") ? '#000' : '#383838'}/>
          </button>
          <div className="ml-2 mr-2 h-5 w-0.5 inline-block bg-gray-300"></div>

          <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`hover:bg-gray-300 hover:color-grey-700 rounded p-2 ${
                  editor.isActive("orderedList") ? "bg-gray-300" : ""
              }`}
          >
              <OrderedListIcon height='1.5rem' width='1.5rem'
                               fill={editor.isActive("orderedList") ? '#000' : '#383838'}/>
          </button>
          <div className="ml-2 mr-2 h-5 w-0.5 inline-block bg-gray-300"></div>


          <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editor.can().chain().focus().toggleCode().run()}
              className={`rounded p-2 m-0.5 hover:bg-gray-300 hover:color-grey-700 ${editor.isActive("code") ? "bg-gray-300" : ""}`}
          >
              <CodeIcon height='1rem' width='1rem' fill={editor.isActive("code") ? '#000' : '#383838'}/>
          </button>
          <div className="ml-2 mr-2 h-5 w-0.5 inline-block bg-gray-300"></div>

          <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`hover:bg-gray-300 hover:color-grey-700 rounded p-2 m-0.5 ${
                  editor.isActive("codeBlock") ? "bg-gray-300" : ""
              }`}
          >
              <CodeBlockIcon height='1rem' width='1rem' fill={editor.isActive("codeBlock") ? '#000' : '#383838'}/>
          </button>
          <div className="ml-2 mr-2 h-5 w-0.5 inline-block bg-gray-300"></div>

          <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`hover:bg-gray-300 hover:color-grey-700 rounded p-2 m-0.5 ${
                  editor.isActive("blockquote") ? "bg-gray-300" : ""
              }`}
          >
              <BlockquoteIcon height='1rem' width='1rem' fill={editor.isActive("blockquote") ? '#000' : '#383838'}/>
          </button>

      </div>

  );
};

export default MenuBar;
