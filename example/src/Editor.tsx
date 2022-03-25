/**
 * EXAMPLE FROM SLATE'S SOURCE:
 * https://github.com/ianstormtaylor/slate/tree/main/site/examples
 */

import React, { useCallback, useMemo, useState } from 'react'
import isHotkey from 'is-hotkey'
import { Editable, withReact, useSlate, Slate } from 'slate-react'
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
} from 'slate'
import { withHistory } from 'slate-history'

import { Button, Icon, Toolbar, Image } from './Components'
import { FC } from 'react'
import { withImages } from './plugins'
import { EditableProps } from 'slate-react/dist/components/editable'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']

const emptyEditor: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

export const RichTextExample: FC<{
  editor?: Editor
  initialValue?: Descendant[]
  variant?: 'comment' | 'wordProcessor'
}> = ({
  editor: mockEditor,
  variant = 'wordProcessor',
  initialValue = emptyEditor,
}) => {
    const [value, setValue] = useState<Descendant[]>(initialValue)
    const renderElement = useCallback((props) => <Element {...props} />, [])
    const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
    const editor = useMemo(
      () => withImages(withHistory(withReact(mockEditor ?? createEditor()))),
      [],
    )


    const editableProps: EditableProps = {
      renderElement,
      renderLeaf,
      placeholder: "Enter some rich text…",
      autoFocus: true,
      onKeyDown: (event) => {
        for (const hotkey in HOTKEYS) {
          if (isHotkey(hotkey, event as any)) {
            event.preventDefault()
            //   @ts-ignore
            const mark = HOTKEYS[hotkey]
            toggleMark(editor, mark)
          }
        }
      }
    }

    /**
     * Disable scrollSelectionIntoView when testing.
     * We do this to fix `TypeError: Cannot read property 'bind' of undefined`
     * that stems from https://github.com/ianstormtaylor/slate/blob/43ca2b56c8bd8bcc30dd38808dd191f804d53ae4/packages/slate-react/src/components/editable.tsx#L1369
     * and https://github.com/ianstormtaylor/slate/blob/43ca2b56c8bd8bcc30dd38808dd191f804d53ae4/packages/slate-react/src/components/editable.tsx#L234
     * 
     * This error was encountered when testing dropEvent for images
    */
    // TODO: Maybe there is a better fix than this, please check the test file to figure if there is any
    if (mockEditor) {
      editableProps.scrollSelectionIntoView = () => { }
    }

    return (
      <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
        <Toolbar>
          <MarkButton format="bold" icon="format_bold" />
          <MarkButton format="italic" icon="format_italic" />
          <MarkButton format="underline" icon="format_underlined" />
          <MarkButton format="code" icon="code" />
          {variant === 'wordProcessor' && (
            <>
              <BlockButton format="heading-one" icon="looks_one" />
              <BlockButton format="heading-two" icon="looks_two" />
              <BlockButton format="block-quote" icon="format_quote" />
              <BlockButton format="numbered-list" icon="format_list_numbered" />
              <BlockButton format="bulleted-list" icon="format_list_bulleted" />
            </>
          )}
        </Toolbar>
        <Editable
          data-variant={variant}
          data-testid="slate-content-editable"
          {...editableProps}
          onDrop={({dataTransfer})=>{
            console.log(dataTransfer.files[0].name)
          }}
        />
      </Slate>
    )
  }

const toggleBlock = (editor: Editor, format: any) => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      // @ts-ignore
      LIST_TYPES.includes(n.type),
    split: true,
  })
  const newProperties: Partial<SlateElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  }
  // @ts-ignore
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor: Editor, format: any) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor: Editor, format: any) => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  })

  return !!match
}

const isMarkActive = (editor: Editor, format: any) => {
  const marks = Editor.marks(editor)
  //   @ts-ignore
  return marks ? marks[format] === true : false
}

const Element: FC<any> = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    case 'image':
      return <Image element={element} {...attributes}>{children}</Image>
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Leaf: FC<any> = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const BlockButton: FC<any> = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      data-testid={format}
      active={isBlockActive(editor, format)}
      data-active={isBlockActive(editor, format)}
      onMouseDown={(event: any) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton: FC<any> = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      data-testid={format}
      data-active={isMarkActive(editor, format)}
      active={isMarkActive(editor, format)}
      onMouseDown={(event: any) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}
