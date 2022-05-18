/** @jsx jsx */

import { assertOutput, buildTestHarness } from '../../../../dist/esm'
import { RichTextExample } from '../Editor'
import { jsx } from '../test-utils'

it('user types, presses undo, presses redo, and types more', async () => {
  const input = (
    <editor>
      <hp>
        <htext>
          <cursor />
        </htext>
      </hp>
    </editor>
  )

  const [editor, { type, undo, redo }] = await buildTestHarness(
    RichTextExample,
  )({
    editor: input,
  })

  await type('banana')

  assertOutput(
    editor,
    <editor>
      <hp>
        <htext>
          banana
          <cursor />
        </htext>
      </hp>
    </editor>,
  )

  await undo()

  assertOutput(
    editor,
    <editor>
      <hp>
        <htext>
          <cursor />
        </htext>
      </hp>
    </editor>,
  )

  await redo()

  assertOutput(
    editor,
    <editor>
      <hp>
        <htext>
          banana
          <cursor />
        </htext>
      </hp>
    </editor>,
  )

  await type(' mango')

  assertOutput(
    editor,
    <editor>
      <hp>
        <htext>
          banana mango
          <cursor />
        </htext>
      </hp>
    </editor>,
  )
})
