/** @jsx jsx */

import { assertOutput, renderEditor } from '../../dist'
import { RichTextExample } from './Editor'
import { jsx } from './test-utils'
import { fireEvent } from '@testing-library/dom'

it('user inserts an bulleted list with a few items', async () => {
  const input = (
    <editor>
      <hp>
        <htext>
          <cursor />
        </htext>
      </hp>
    </editor>
  )

  const [editor, { type, pressEnter, deleteBackward }, { getByTestId }] =
    await renderEditor(RichTextExample)({
      editor: input,
    })

  const unorderedList = getByTestId('bulleted-list')
  fireEvent.mouseDown(unorderedList)

  assertOutput(
    editor,
    <editor>
      <hbulletedlist>
        <hlistitem>
          <htext>
            <cursor />
          </htext>
        </hlistitem>
      </hbulletedlist>
    </editor>,
  )

  await type('First item')

  assertOutput(
    editor,
    <editor>
      <hbulletedlist>
        <hlistitem>
          <htext>
            First item
            <cursor />
          </htext>
        </hlistitem>
      </hbulletedlist>
    </editor>,
  )

  await pressEnter()
  await type('Second item')

  assertOutput(
    editor,
    <editor>
      <hbulletedlist>
        <hlistitem>
          <htext>First item</htext>
        </hlistitem>
        <hlistitem>
          <htext>
            Second item
            <cursor />
          </htext>
        </hlistitem>
      </hbulletedlist>
    </editor>,
  )

  await pressEnter()
  await type('Third item')

  assertOutput(
    editor,
    <editor>
      <hbulletedlist>
        <hlistitem>
          <htext>First item</htext>
        </hlistitem>
        <hlistitem>
          <htext>Second item</htext>
        </hlistitem>
        <hlistitem>
          <htext>
            Third item
            <cursor />
          </htext>
        </hlistitem>
      </hbulletedlist>
    </editor>,
  )

  // Delete like the user would, one key press at a time
  await deleteBackward()
  await deleteBackward()
  await deleteBackward()
  await deleteBackward()
  await deleteBackward()
  await deleteBackward()
  await deleteBackward()
  await deleteBackward()
  await deleteBackward()
  await deleteBackward()
  await deleteBackward()

  assertOutput(
    editor,
    <editor>
      <hbulletedlist>
        <hlistitem>
          <htext>First item</htext>
        </hlistitem>
        <hlistitem>
          <htext>
            Second item
            <cursor />
          </htext>
        </hlistitem>
      </hbulletedlist>
    </editor>,
  )
})
