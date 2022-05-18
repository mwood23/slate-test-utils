/** @jsx jsx */

import { assertOutput, buildTestHarness } from '../../../dist/esm'
import { RichTextExample } from '../Editor'
import { jsx } from '../test-utils'
import { createEvent, fireEvent } from '@testing-library/dom'
import { act } from 'react-dom/test-utils';

// https://drafts.csswg.org/cssom-view/#caretposition
interface CaretPosition {
  readonly offsetNode: Node;
  readonly offset: number;
  getClientRect(): DOMRect | null;
}

// https://stackoverflow.com/a/57272491/9936282
const toBase64 = (file: Blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

async function editorBodySetUp(input: JSX.Element, debug = false) {

  const [editor, slateTestUtils, reactTestUtils] = await buildTestHarness(RichTextExample)({
    editor: input,
    debug,
  });

  return {
    editor,
    slateTestUtils,
    reactTestUtils
  }

}

it('can drag and drop image to editor', async () => {
  const fileName = 'chucknorris';
  const file = new File(['(⌐□_□)'], `${fileName}.png`, { type: 'image/png' });
  const fileDataUrl = await toBase64(file).catch((e) => { throw e });

  const {
    editor,
    slateTestUtils: { getEditorElement }
  } = await editorBodySetUp(
    <editor>
      <hp>
        <htext>
          <cursor />
        </htext>
      </hp>
    </editor>
  )

  const editorElement = getEditorElement();
  // @ts-ignore
  editorElement.isContentEditable = true;

  // See https://github.com/testing-library/react-testing-library/issues/339#issuecomment-526241983
  const dropEvent = createEvent.drop(editorElement)
  // Mocks
  Object.defineProperties(dropEvent, {
    clientX: { value: 0 },
    clientY: { value: 0 },
    dataTransfer: {
      value: {
        files: [new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })],
        getData: () => ''
      }
    }
  });
  Object.defineProperty(window.document, 'caretPositionFromPoint', {
    value: () => ({
      offset: 0,
      // TODO: I am not sure if editorElement is the right Node to be here
      offsetNode: editorElement as Node
    } as CaretPosition)
  })

  await act(async () => {
    /**
     * We are having some errors because of this function:
     * https://github.com/ianstormtaylor/slate/blob/43ca2b56c8bd8bcc30dd38808dd191f804d53ae4/packages/slate-react/src/plugin/react-editor.ts#L401
     * 
     * Directions to fix were these:
     * https://github.com/testing-library/dom-testing-library/blob/90d420d12d21f4bab2ea2dc92ba1cc274f5bd1e4/src/events.js#L65
     * https://github.com/testing-library/react-testing-library/issues/339
     */
    fireEvent(editorElement, dropEvent)
  });

  await act(() => Promise.resolve())

  assertOutput(editor,
    <editor>
      <hp>
        <htext>
        </htext>
      </hp>
      <himage url={fileDataUrl as string} caption={fileName}>
        <htext>
          <cursor />
        </htext>
      </himage>
    </editor>
  )

});