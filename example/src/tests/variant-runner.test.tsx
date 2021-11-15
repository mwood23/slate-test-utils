/** @jsx jsx */

import { Editor } from 'slate'
import { buildTestHarness, testRunner } from '../../../dist/esm'
import { RichTextExample } from '../Editor'
import { jsx } from '../test-utils'

/**
 * This shows OS specific tests for the editor. This is useful if you have logic that's specific
 * This shows OS specific tests for the editor. This is useful if you have logic that's specific
 * to a certain operating system like keyboard events.
 */
const testCases = (variant?: 'comment' | 'wordProcessor') => {
  it('user presses bold and types', async () => {
    const input = (
      <editor>
        <hp>
          <htext>
            <cursor />
          </htext>
        </hp>
      </editor>
    )

    const [editor, { type }, { getByTestId }] = await buildTestHarness(
      RichTextExample,
    )({
      editor: input,
      componentProps: { variant },
    })

    const editorElement = getByTestId('slate-content-editable')

    // Whoop! We run the tests for all of our variants in
    // one quick step.
    expect(editorElement).toHaveAttribute('data-variant', variant)

    // It's control in windows land so this fails!!
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
}

const runVariants = () => {
  describe.each([
    ['Comment', 'comment'],
    ['Word Processor', 'wordProcessor'],
    // It's valid, linter just doesn't like it
    // eslint-disable-next-line jest/valid-describe
    // @ts-ignore
  ])('%s', testCases)
}

testRunner(runVariants)
