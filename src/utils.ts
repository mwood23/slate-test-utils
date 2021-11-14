import { Editor } from 'slate'

export const isApple = (): boolean =>
  typeof navigator !== 'undefined' && /Mac OS X/.test(navigator.userAgent)

export const assertOutput = (input: Editor, expectedOutput: any) => {
  const output = expectedOutput as Editor

  expect(input.children).toEqual(output.children)
  expect(input.selection).toEqual(output.selection)
}
