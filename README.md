## Slate Test Utils

A toolkit to test Slate rich text editors with Jest, React Testing Library, and hyperscript! Write user driven integration tests with ease.

- 🚀 Works with Jest, React Testing Library, and JSDOM (Create React App and Vite friendly)
- 🙏 Out of the box support for testing: typing, selection, keyboard events, beforeInput events, normalization, history, operations,
- 🐣 Stage editor state using Hyperscript instead of manual mocking or creating a Storybook story per state
- 🏕 Stage tests with a mocked collapsed, expanded, or reverse expanded selection
- ✅ Supports any Slate React editor
- ⚙️ Supports any number of nodes and custom data structures
- 🌊 Supports emulating Windows and Mac for OS specific testing
- 💃 Conversational API that makes testing complex workflows easy
- 🦆 Test variants of your editor with the same test
- 📸 Snapshot testing friendly (if you're into that kinda thing)
- 👔 Fully typed with TypeScript

### Example

To see full examples go to `example/`.

```tsx
/** @jsx jsx */

import { assertOutput, renderEditor } from '../../dist'
import { RichTextExample } from './Editor'
import { jsx } from './test-utils'
import { fireEvent } from '@testing-library/dom'

it('user inserts an bulleted list with a few items', async () => {
  const input = (
    <editor>
      <hp>
        <htext>
          <cursor />
        </htext>
      </hp>
    </editor>
  )

  const [
    editor,
    { type, pressEnter, deleteBackward, triggerKeyboardEvent },
    { getByTestId },
  ] = await renderEditor(RichTextExample)({
    editor: input,
  })

  // Click the unordered list button in the nav
  const unorderedList = getByTestId('bulleted-list')
  fireEvent.mouseDown(unorderedList)

  await type('🥕')
  await deleteBackward()
  await type('Carrots')

  assertOutput(
    editor,
    <editor>
      <hbulletedlist>
        <hlistitem>
          <htext>
            Carrots
            <cursor />
          </htext>
        </hlistitem>
      </hbulletedlist>
    </editor>,
  )
})
```

## Motivation

**Rich text editors are hard.** What makes them harder is being able to test them in a way the gives you confidence that your code works as expected. There's so many user input mechanisms, edge cases, selection, state, normalization, and more to keep in mind when developing.

You could do an end to end testing framework, but even those aren't [without struggles](https://github.com/ianstormtaylor/slate/issues/3476#issuecomment-617594068), not to mention they're slow and another piece of infrastructure to worry about. Additionally, mocking up every what if scenario becomes difficult because generating the test states become difficult.

After trying, E2E tests, no tests (don't recommend 😅), and unit tests like [Slate core](https://github.com/ianstormtaylor/slate/tree/main/packages/slate/test) nothing seemed to give me enough confidence and convenience to be able to write a thorough test suite on the code.

This is where the Slate Test Utils come in! It's an abstraction that uses hyperscript to generate editor states that be tested in a JSDOM environment with a bit of black magic.

## Installation

The installation to make this work in your environment is going to be a bear, I apologize in advance. Test environments are always difficult to setup.

### Prerequisites

Make sure you have Jest, React Testing Library, and React Testing Library DOM configured.

1. [Setup Jest](https://jestjs.io/docs/getting-started)
1. [Setup React Testing Library](https://testing-library.com/docs/react-testing-library/setup)
1. [Add Patch Package](https://github.com/ds300/patch-package)

### Install Slate Test Utils

```sh
yarn add -D slate-test-utils

# Or

npm install -D slate-test-utils
```

Now this is where the black magic comes into play. We need to patch your `node_modules` with some things that will make JSDOM play friendly with our test harness. Go to this repo and find the `/patches` folder and copy them into a `/patches` folder at the root of your repo. Once you have done that...

```sh
yarn install

# Or

npm install
```

That should apply your patches to your `node_modules`. You may get a warning if the versions mismatch, but long as you don't get an error you are good to go. If you get an error you will need to manually create your own patches based off the ones in this repo.

Lastly, you need to add this line to your `setupTests.js` file for Jest so we can mock things.

```js
import 'slate-test-utils/mocks'

// or if you are in commonjs

require('slate-test-utils/mocks')
```

## Usage

For this to work, your RichTextEditor component has to accept two props:

- `editor`: This is an editor singleton that the test harness creates and passed into your editor. It's what the hyperscript creates for you.
- `initialValue`: This is the `editor.children` from the editor singleton.

Your editor call-site will look something like this to make it test friendly:

```tsx
const emptyEditor: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

export const RichTextExample: FC<{
  editor?: Editor
  initialValue?: Descendant[]
  variant?: 'comment' | 'wordProcessor'
}> = ({
  editor: mockEditor,
  variant = 'wordProcessor',
  initialValue = emptyEditor,
}) => {
  // Starts with a default value same as usual except now we can stage
  // in one for our testing.
  const [value, setValue] = useState<Descendant[]>(initialValue)
  const editor = useMemo(
    // Creates an empty editor if we don't pass a mock one in
    () => withHistory(withReact(mockEditor ?? createEditor())),
    [],
  )
```

## Testing ContentEditable in JSDOM?

It's well documented that [JSDOM does not support](https://github.com/jsdom/jsdom/issues/1670) `contenteditable`, the API that Slate is built on top of. JSDOM is a mocked DOM that you run your tests again when using Jest. However, since Slate has done
an amazing job saving us from the toils of working with `contenteditable` directly there's an opportunity to test a large part of the internal Slate-React API and in turn, our code.

That opportunity is what this library takes advantage of. There's some **big limitations** with this testing approach, but I would estimate that it has covered over 90% of my testing needs and has completely changed how I write Slate code.

## Limitations

There are some big limitations to this approach when testing your editor. You will not be able to test 100% of the behavior of your editor with this framework, so manual testing or E2E tests will be needed depending on your use case.

- Any contenteditable event that is not handled by your or Slate React will not work. For example, if you fire the key down `arrowLeft`, nothing will happen unless you handle that event specifically because `contenteditable` is not fully supported.
- We are using our own jsx pragma to parse the tests so you will not be able to use React components in the same file. That's the reason in the test harness we have a `componentProps` field that lets you put in any amount of custom props you need to test.
- React 17.x will work, but if you use TypeScript, you may run into problems parsing your tests because of [how it works](https://www.typescriptlang.org/docs/handbook/jsx.html). If you do, you will need to create a tsconfig specific for your tests with `"jsx": "react"`.
- Jest 26/27 are supported depending on your version. It is important to note that since we patch JSDOM, you need to make sure that the patch files will work.
- Slate 0.70.0 is the only officially supported version although I have tested this all the way to version 0.59.0. Since Slate is beta, your mileage may vary. Please open an issue if you see anything weird.

## Unknown Support

There is a lot to support with Slate. I'm not sure if these will work or not because I haven't needed to use them often enough to know. Open to PRs to add this functionality or example usages!

1. Copy-paste
2. Void elements

## Errors

- If you get an error about `DataTransfer` not being defined then you haven't imported the `slate-test-utils` mock correctly
- If you get an error about your patch file make sure your versions are consistent with the `/example` file or create a patch specific to that version

## FAQ

- Could I use this with Prosemirror? I suppose you could depending on how they handle their events under the hood.

## TODO

PR the patches to the respective repos, especially the Slate ones.
