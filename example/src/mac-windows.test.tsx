/** @jsx jsx */

import { Editor } from 'slate'
import { renderEditor, testRunner } from '../../dist'
import { RichTextExample } from './Editor'
import { jsx } from './test-utils'

/**
 * This shows OS specific tests for the editor. This is useful if you have logic that's specific
 * to a certain operating system like keyboard events.
 */
const testCases = () => {
  it.skip('user presses bold for windows only', async () => {
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
    const [editor, { type, triggerKeyboardEvent }] = await renderEditor(
      RichTextExample,
    )({
      // @ts-ignore
      editor: input,
    })

    // It's control in windows land so this fails!!
    await triggerKeyboardEvent('cmd+b')
    await type('banana')

    const output = (
      <editor>
        <hp>
          <htext bold>
            banana
            <cursor />
          </htext>
        </hp>
      </editor>
    ) as unknown as Editor

    expect(editor.children).toEqual(output.children)
    expect(editor.selection).toEqual(output.selection)
  })
}

testRunner(testCases)
