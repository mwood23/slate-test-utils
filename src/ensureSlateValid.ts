// Ensures that the hyperscript you create follows the rules of Slate

import cloneDeep from 'lodash.clonedeep'
import { Editor } from 'slate'

/**
 * Ensures the Slate content you create is valid. Useful
 * for unit testing to make sure you are adhering to the
 * rules of Slate.
 */
export const ensureSlateStateValid = (editor: any) => {
  const cloned = cloneDeep(editor)

  Editor.normalize(editor, { force: true })
  expect(editor.children).toEqual(cloned.children)
  expect(editor.selection).toEqual(cloned.selection)
}
