/** @jsx jsx */

import { renderEditor } from '../../dist'
import { RichTextExample } from './Editor'
import { jsx } from './test-utils'

it('should render the editor', async () => {
  const input = (
    <editor>
      <hp>
        <htext>
          <cursor />
        </htext>
      </hp>
    </editor>
  )

  // @ts-ignore
  const [editor, { type }] = await renderEditor(RichTextExample)({
    // @ts-ignore
    editor: input,
  })

  await type('hello')

  setTimeout(() => {
    // @ts-ignore
    console.log('hello', JSON.stringify(editor.operations, null, 2))
  }, 200)

  const output = (
    <editor>
      <hp>
        <htext>
          hello
          <cursor />
        </htext>
      </hp>
    </editor>
  )

  // @ts-ignore
  expect(editor.children).toEqual(output.children)
})
