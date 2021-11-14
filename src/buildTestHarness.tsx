import React from 'react'
import { render, queries } from '@testing-library/react'
import { act, fireEvent } from '@testing-library/react'
import * as editorQueries from './editorQueries'
import { parseHotkey } from 'is-hotkey'
import { isApple } from './utils'
import { Editor, Transforms } from 'slate'
import { ComponentType } from 'react'
import { HistoryEditor } from 'slate-history'
import { ensureSlateStateValid } from './ensureSlateValid'

export type RenderEditorReturnTuple = [
  editor: Editor,
  commands: {
    type: (s: string) => Promise<void>
    deleteForward: () => Promise<void>
    deleteBackward: () => Promise<void>
    deleteEntireSoftline: () => Promise<void>
    deleteHardLineBackward: () => Promise<void>
    deleteSoftLineBackward: () => Promise<void>
    deleteHardLineForward: () => Promise<void>
    deleteSoftLineForward: () => Promise<void>
    deleteWordBackward: () => Promise<void>
    deleteWordForward: () => Promise<void>
    pressEnter: () => Promise<void>
    /**
     * Use a hotkey combination from is-hotkey. See testHarness internals
     * for usage.
     */
    triggerKeyboardEvent: (hotkey: string) => Promise<void>
    typeSpace: () => Promise<void>
    undo: () => Promise<void>
    redo: () => Promise<void>
    selectAll: () => Promise<void>
    isApple: () => boolean
    rerender: () => void
  },
  options: ReturnType<typeof render>,
]

/**
 * A test harness for the RichTextEditor that adds custom queries to assert on, lots
 * of simulated actions, and a custom rerender in case you want to assert on the DOM.
 * In most cases, you'll want to assert directly on the editor state to check that the editor
 * selection and other pieces of the editor are working as intended.
 */
export const buildTestHarness =
  (Component: ComponentType<any>) =>
  async ({
    debug = false,
    strict = false,
    editor,
    componentProps = {},
    testID = 'slate-content-editable',
  }: {
    /**
     * A Slate editor singleton.
     */
    editor: any
    /**
     * Pretty logs out all operations on the editor so you can see what's going on in tests.
     */
    debug?: boolean
    /**
     * Ensures Slate content is valid before rendering. This is not turned on by default
     * because you may want to test invalid states for normalization or testing purposes.
     *
     * @default false
     */
    strict?: boolean
    /**
     * Props you would like to pass down to the element you have passed in to test. This could be disabled states
     * variants, specific styles, or anything else!
     */
    componentProps?: any

    /**
     * The test ID for the Editable component that is used
     * to run the test harness.
     *
     * @default 'slate-content-editable'
     */
    testID?: string
  }): Promise<RenderEditorReturnTuple> => {
    const proppies: any = {
      editor,
      initialValue: editor.children,
      ...componentProps,
    }

    if (strict) {
      ensureSlateStateValid(editor)
    }

    const options = render(
      <Component initialValue={editor.children} {...proppies} />,
      {
        queries: { ...queries, ...editorQueries },
        // TODO: Rest of options...
      },
    )

    // @ts-ignore
    await act(async () => options)

    const element = options.getByTestId(testID)

    /**
     * Manually add this because JSDom doesn't implement this and Slate checks for it
     * internally before doing stuff.
     *
     * https://github.com/jsdom/jsdom/issues/1670
     */
    // @ts-ignore
    element.isContentEditable = true

    /**
     * Slate React uses beforeinput events in order to prevent the default behavior within contenteditables
     * and apply certain operations to the Slate state based on the event type. We emulate all of the operations
     * that Slate applies in order to integration test the editor within a JSDom environment with React Testing
     * Library.
     *
     * Reference events we emulate:
     * https://github.com/ianstormtaylor/slate/blob/a5f4170162cefd1c9458544402bb8f2266e05ead/packages/slate-react/src/components/editable.tsx#L289
     */

    /**
     * Emulates typing content into Slate.
     *
     * @param {string} value
     */
    const type = async (value: string) =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', {
            inputType: 'insertText',
            data: value,
          }),
        )
      })

    const typeSpace = async () => type(' ')

    /**
     * Deletes forward one character from the current Slate selection.
     */
    const deleteForward = async () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteContentForward' }),
        )
      })

    /**
     * Deletes backward one character from the current Slate selection.
     */
    const deleteBackward = async () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteContentBackward' }),
        )
      })

    /**
     * Deletes the entire soft line in Slate backwards and forwards from current Slate selection.
     */
    const deleteEntireSoftline = async () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteEntireSoftLine' }),
        )
      })

    /**
     * Deletes the entire block content backwards from current Slate selection.
     */
    const deleteHardLineBackward = async () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', {
            inputType: 'deleteHardLineBackward',
          }),
        )
      })

    /**
     * Deletes the entire block content backwards from current Slate selection.
     */
    const deleteSoftLineBackward = async () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', {
            inputType: 'deleteSoftLineBackward',
          }),
        )
      })

    /**
     * Deletes the entire block content forwards from current Slate selection.
     */

    const deleteHardLineForward = async () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteHardLineForward' }),
        )
      })

    /**
     * Deletes the entire block content forwards from current Slate selection.
     */
    const deleteSoftLineForward = async () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteSoftLineForward' }),
        )
      })

    /**
     * Deletes a word backwards from Slate's selection
     */
    const deleteWordBackward = async () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteWordBackward' }),
        )
      })

    /**
     * Deletes a word forward from Slate's selection
     */
    const deleteWordForward = async () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteWordForward' }),
        )
      })

    /**
     * Inserts a line break at the current selection. Simulates pressing 'Enter' in a contenteditable with Slate.
     */
    const pressEnter = async () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'insertLineBreak' }),
        )
      })

    /**
     * Simulates the user pressing a key down. This is commonly used for testing hotkeys.
     */
    const triggerKeyboardEvent = async (hotkey: string) =>
      act(async () => {
        const eventProps = parseHotkey(hotkey)
        const values = hotkey.split('+')

        fireEvent(
          element,
          new window.KeyboardEvent('keydown', {
            key: values[values.length - 1],
            code: `${eventProps.which}`,
            keyCode: eventProps.which,
            bubbles: true,
            ...eventProps,
          }),
        )
      })

    const undo = async () => (editor as HistoryEditor).undo()
    const redo = async () => (editor as HistoryEditor).redo()
    // Keyboard shortcut wouldn't work within JSDOM so we emulate it
    const selectAll = async () => Transforms.select(editor, [])

    if (debug) {
      const { apply } = editor
      editor.apply = (args: any) => {
        // eslint-disable-next-line no-console
        console.log('OPERATION APPLIED', JSON.stringify(args, null, 2))
        return apply(args)
      }
    }

    return [
      editor,
      {
        type,
        deleteForward,
        deleteBackward,
        deleteEntireSoftline,
        deleteHardLineBackward,
        deleteSoftLineBackward,
        deleteHardLineForward,
        deleteSoftLineForward,
        deleteWordBackward,
        deleteWordForward,
        triggerKeyboardEvent,
        pressEnter,
        typeSpace,
        undo,
        redo,
        selectAll,
        isApple,
        rerender: () => options.rerender(<Component {...proppies} />),
      },
      options,
    ]
  }
