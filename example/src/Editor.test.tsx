/** @jsx jsx */

import { Editor } from 'slate'
import { assertOutput, renderEditor, testRunner } from '../../dist'
import { RichTextExample } from './Editor'
import { jsx } from './test-utils'

const testCases = () => {
  it('user types into an empty editor', async () => {
    const input = (
      <editor>
        <hp>
          <htext>
            <cursor />
          </htext>
        </hp>
      </editor>
    )

    const [editor, { type }] = await renderEditor(RichTextExample)({
      editor: input,
    })

    await type('banana')

    const output = (
      <editor>
        <hp>
          <htext>
            banana
            <cursor />
          </htext>
        </hp>
      </editor>
    ) as unknown as Editor

    expect(editor.children).toEqual(output.children)
    expect(editor.selection).toEqual(output.selection)
  })

  it('user types multiple paragraphs into the editor', async () => {
    const input = (
      <editor>
        <hp>
          <htext>
            <cursor />
          </htext>
        </hp>
      </editor>
    )

    const [editor, { type, pressEnter }] = await renderEditor(RichTextExample)({
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

    await pressEnter()
    await type('cucumber')

    assertOutput(
      editor,
      <editor>
        <hp>
          <htext>banana</htext>
        </hp>
        <hp>
          <htext>
            cucumber
            <cursor />
          </htext>
        </hp>
      </editor>,
    )
  })

  it('user types with an expanded selection across paragraphs', async () => {
    const input = (
      <editor>
        <hp>
          <htext>
            ban
            <anchor />
            ana
          </htext>
        </hp>
        <hp>
          <htext>
            cuc
            <focus />
            umber
          </htext>
        </hp>
      </editor>
    )

    const [editor, { type }] = await renderEditor(RichTextExample)({
      editor: input,
    })

    await type('WAT')

    // Beautiful!
    assertOutput(
      editor,
      <editor>
        <hp>
          <htext>
            banWAT
            <cursor />
            umber
          </htext>
        </hp>
      </editor>,
    )
  })
}

testRunner(testCases)
