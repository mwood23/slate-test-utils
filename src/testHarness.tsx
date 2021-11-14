import React from 'react'
import { render, queries } from '@testing-library/react'
import { act, fireEvent } from '@testing-library/react'
import * as editorQueries from './editorQueries'
import { parseHotkey } from 'is-hotkey'
import { isApple } from './utils'
import { Editor, Transforms } from 'slate'
import { ComponentType } from 'react'

/**
 * A test harness for the RichTextEditor that adds custom queries to assert on, lots
 * of simulated actions, and a custom rerender in case you want to assert on the DOM.
 * In most cases, you'll want to assert directly on the editor state to check that the editor
 * selection and other pieces of the editor are working as intended.
 */
export const renderEditor =
  (Component: ComponentType<any>) =>
  async ({ debug = false, editor }: { debug: boolean; editor: Editor }) => {
    const options = render(<Component editor={editor} />, {
      queries: { ...queries, ...editorQueries },
    })

    // @ts-ignore
    await act(async () => options)

    const { apply } = editor
    editor.apply = (args) => {
      console.log('apply', args)
      return apply(args)
    }

    const element = options.getByTestId('slate-content-editable')

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

    const typeSpace = () => type(' ')

    /**
     * Deletes forward one character from the current Slate selection.
     */
    const deleteForward = () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteContentForward' }),
        )
      })

    /**
     * Deletes backward one character from the current Slate selection.
     */
    const deleteBackward = () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteContentBackward' }),
        )
      })

    /**
     * Deletes the entire soft line in Slate backwards and forwards from current Slate selection.
     */
    const deleteEntireSoftline = () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteEntireSoftLine' }),
        )
      })

    /**
     * Deletes the entire block content backwards from current Slate selection.
     */
    const deleteHardLineBackward = () =>
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
    const deleteSoftLineBackward = () =>
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

    const deleteHardLineForward = () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteHardLineForward' }),
        )
      })

    /**
     * Deletes the entire block content forwards from current Slate selection.
     */

    const deleteSoftLineForward = () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteSoftLineForward' }),
        )
      })

    /**
     * Deletes a word backwards from Slate's selection
     */
    const deleteWordBackward = () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteWordBackward' }),
        )
      })

    /**
     * Deletes a word forward from Slate's selection
     */
    const deleteWordForward = () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'deleteWordForward' }),
        )
      })

    /**
     * Inserts a line break at the current selection. Simulates pressing 'Enter' in a contenteditable with Slate.
     */
    const pressEnter = () =>
      act(async () => {
        fireEvent(
          element,
          new InputEvent('beforeinput', { inputType: 'insertLineBreak' }),
        )
      })

    /**
     * Simulates the user pressing a key down. This is commonly used for testing hotkeys.
     */
    const triggerKeyboardEvent = (hotkey: string) =>
      act(async () => {
        const eventProps = parseHotkey(hotkey)
        const values = hotkey.split('+')

        fireEvent(
          element,
          new KeyboardEvent('keydown', {
            key: values[values.length - 1],
            code: `${eventProps.which}`,
            keyCode: eventProps.which,
            // altKey: false,
            // ctrlKey: false,
            // metaKey: false,
            // shiftKey: false,
            bubbles: true,
            ...eventProps,
          }),
        )
      })

    /**
     * List of hotkeys we're emulating for Slate React:
     * https://github.com/ianstormtaylor/slate/blob/a5f4170162cefd1c9458544402bb8f2266e05ead/packages/slate-react/src/utils/hotkeys.ts#L8
     *
     * NOTE: Moving up/down or other composition events are not supported because of limitations in JSDom I haven't figured out.
     *
     * For help figuring out keys: https://keycode.info/
     */
    const moveBackward = () => triggerKeyboardEvent('left')
    const moveForward = () => triggerKeyboardEvent('right')
    const moveWordBackward = () => triggerKeyboardEvent('ctrl+left')
    const moveWordForward = () => triggerKeyboardEvent('ctrl+right')
    // const undo = () => triggerKeyboardEvent(getUndoHotkey());
    // const redo = () => triggerKeyboardEvent(getRedoHotkey());
    const tabForward = () => triggerKeyboardEvent('tab')
    const tabBackward = () => triggerKeyboardEvent('shift+tab')
    // Keyboard shortcut wouldn't work within JSDOM so we emulate it
    const selectAll = () => Transforms.select(editor, [])
    const backspaceKeyPress = () => triggerKeyboardEvent('backspace')
    const deleteKeyPress = () => triggerKeyboardEvent('delete')

    const gamepadPressPrevious = () => triggerKeyboardEvent('ctrl+1')
    const gamepadPressRecord = () => triggerKeyboardEvent('ctrl+2')
    const gamepadPressNext = () => triggerKeyboardEvent('ctrl+3')

    if (debug) {
      const { apply } = editor
      editor.apply = (args) => {
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
        moveForward,
        moveBackward,
        moveWordBackward,
        moveWordForward,
        pressEnter,
        typeSpace,
        // undo,
        // redo,
        tabForward,
        tabBackward,
        selectAll,
        backspaceKeyPress,
        deleteKeyPress,
        gamepadPressNext,
        gamepadPressRecord,
        gamepadPressPrevious,
        isApple,
        rerender: () => options.rerender(<Component editor={editor} />),
      },
      options,
    ]
  }
