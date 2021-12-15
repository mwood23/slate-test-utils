# Slate Test Utils

https://user-images.githubusercontent.com/13633613/141721067-2c1984ac-d73f-4984-a0c8-2bea1be0d389.mp4


_Created with [Wave Snippets](https://wavesnippets.com/)_

A toolkit to test Slate rich text editors with Jest, React Testing Library, and hyperscript! Write user centric integration tests with ease. Read the [announcement](https://www.marcuswood.io/blog/effective-slate-testing-using-react-testing-library).

- 🚀 Works with Jest, React Testing Library, and JSDOM (Create React App and Vite friendly)
- 🙏 Out of the box support for testing: typing, selection, keyboard events, beforeInput events, normalization, history, operations,
- 🐣 Stage editor state using Hyperscript instead of manual mocking or creating a Storybook story per state
- 🏕 Stage tests with a mocked collapsed, expanded, or reverse expanded selection
- ✅ Supports any Slate React editor
- 🎩 Beautiful diffs on failing tests
- ⚙️ Supports any number of nodes and custom data structures
- 🌊 Supports emulating Windows and Mac for OS specific testing
- 💃 Conversational API that makes testing complex workflows easy
- 🦆 Test variants of your editor with the same test
- 📸 Snapshot testing friendly (if you're into that kinda thing)
- 👔 Fully typed with TypeScript

Want to learn more about Slate? [Join the newsletter.](https://marcuswood.ck.page/slate)

![](/static/test-results.png)

### Example

To see full examples go to `example/`.

```tsx
/** @jsx jsx */

import { assertOutput, buildTestHarness } from '../../dist/esm'
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
  ] = await buildTestHarness(RichTextExample)({
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

You could do an end to end testing framework, but even those aren't [without struggles](https://github.com/ianstormtaylor/slate/issues/3476#issuecomment-617594068), not to mention they're slow and another piece of infrastructure to worry about. Additionally, mocking up every what if scenario becomes difficult because generating the test states takes time. Even if you manage to get it all set up, it's hard to see the diff on your breaking tests unlike Jest that has a fantastic reporter for diffing JSON (what Slate state serializes to by default).

After trying, E2E tests, no tests (don't recommend 😅), and unit tests like [Slate core](https://github.com/ianstormtaylor/slate/tree/main/packages/slate/test) nothing seemed to give me enough confidence and convenience that my was code working as intended.

This is where the Slate Test Utils come in! It's an abstraction that uses hyperscript to generate editor states that can be tested in a JSDOM environment with a bit of black magic.

My hope is that by providing a better way to test, everyone can deliver better editor experiences. I also hope that this helps get Slate-React to a stable 1.0 by providing a way to test it internally.

### Testing ContentEditable in JSDOM?

It's well documented that [JSDOM does not support](https://github.com/jsdom/jsdom/issues/1670) `contenteditable`, the API that Slate is built on top of. JSDOM is a mocked DOM that you run your tests again when using Jest. However, since Slate has done
an amazing job saving us from the darkness of working with `contenteditable` directly there's an opportunity to test a large part of the internal Slate-React API and in turn, our code.

That opportunity is what this library takes advantage of. There's some **big limitations** with this testing approach, but I would estimate that it has covered over 90% of my testing needs and has completely changed how I write Slate code.

## Installation

The installation to make this work in your environment is going to be a 🐻 bear, I apologize in advance. Test environments are always difficult to setup.

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
import 'slate-test-utils/dist/cjs/mocks'

// or if you are in commonjs

require('slate-test-utils/dist/cjs/mocks')
```

### Configuring Your Hyperscript

The schemaless core of Slate is truly amazing and is fully supported with slate-test-utils. Since we cannot know what your editor's structure is like you need to configure your own hyperscript. Create a file called `testUtils` or `slateTestUtils` and fill out what your document looks like.

```tsx
// @ts-ignore - Imports will be there from the upstream patch
import { createHyperscript, createText } from 'slate-hyperscript'
/**
 * This is the mapping for the JSX that creates editor state. Add to it as needed.
 * The h prefix isn't needed. It's added to be consistent and to let us know it's
 * hyperscript.
 */
export const jsx = createHyperscript({
  elements: {
    // Add any nodes here with any attributes that's required or optional
    hp: { type: 'paragraph' },
    hbulletedlist: { type: 'bulleted-list' },
    hlistitem: { type: 'list-item' },
    inline: { inline: true },
    block: {},
    wrapper: {},
  },
  creators: {
    htext: createText,
  },
})
```

#### Typescript

If you are using TypeScript you need to let the compiler know about your custom JSX types. Within your `/src` directory add a `hyperscript.d.ts` file.

```ts
declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    hp: any
    editor: any
    htext: {
      // These optional params will show up in the autocomplete!
      bold?: boolean
      underline?: boolean
      italic?: boolean
      children?: any
    }
    hbulletedlist: any
    hlistitem: any
    cursor: any
    focus: any
    anchor: any
  }
}
```

### Making your Editor Test Friendly

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
}> = ({
  editor: mockEditor,
  initialValue = emptyEditor,
}) => {
  // Starts with a default value same as usual except now we can stage
  // in one for our testing.
  const [value, setValue] = useState<Descendant[]>(initialValue)
  const editor = useMemo(() => createEditor(), [])
```

Last step, you need to add a `data-testid` to your `Editable` component.

```tsx
  <Editable
    data-testid="slate-content-editable"
```

## Testing

With your editor configured you should be good to go! Check out `/example` for a bunch of tests and patterns.

For all tests make sure you add this to the top:

```ts
/** @jsx jsx */

import { jsx } from '../test-utils'
```

The first line sets the pragma that will parse your hyperscript. The second line will import the pragma.

## API

The test utils export a few methods that help you create user centric tests for your editor.

### BuildTestHarness

A test harness for the RichTextEditor that adds custom queries to assert on, lots of simulated actions, and a custom rerender in case you want to assert on the DOM. In most cases, you'll want to assert directly on the editor state to check that the editor selection and other pieces of the editor are working as intended.

Your first invocation of the test harness needs to be a React component.

```ts
const richTextHarness = buildTestHarness(RichTextExample)
```

> Tip! You can partially apply the `buildTestHarness` function to create a bunch of test harnesses per
> variant of your editor.

Next, you need to pass in the config to render that component. You must pass an `editor` anything else is optional. You are returned a tuple of props. The first is going to be the editor you passed into the harness. The second is going to be commands for testing. The third is custom queries for asserting and the bag of props from `render` in React Testing Library.

#### Config

Use these properties to customize the testHarness

```ts
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
```

```ts
const [editor, { triggerKeyboardEvent, type }] = await buildTestHarness(
  RichTextExample,
)({
  editor: input,
})
```

Most of your call-sites will look like this:

```ts
const [editor, { triggerKeyboardEvent, type }] = await buildTestHarness(
  RichTextExample,
)({
  editor: input,
})

// Or this, same thing except with this you can reuse the first part of the function!
const richTextHarness = buildTestHarness(RichTextExample)

const [editor, { triggerKeyboardEvent, type }] = await richTextHarness({
  editor: input,
})
```

#### Commands

These commands are what you can use to interact with your rendered editor

```ts
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
paste: (payload: string, { types: 'text/html' | 'text/plain' | 'image/png'[] }) => Promise<void>
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
```

#### Queries

The third param is the bag of props returned from `render`. It includes some helper queries for Slate and all of the default methods returned from React Testing Library.

## Test Runner

The test runner will run your tests simulated in iOS and Windows environments by mocking the user agent. This is useful for testing keyboard events and other OS specific functionality. Refer to `example/src/tests/mac-windows.test.tsx` for usage.

## Running Example Folder

Run the example project to see it in action and get an idea of some fun patterns you can include in your testing.

```sh
git clone https://github.com/mwood23/slate-test-utils

cd slate-test-utils

yarn install && yarn build

cd example

yarn install

yarn test
```

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
- If your editor does not appear to be updating from your tests make sure you have made your editor test friendly
- If you get an error in your test about your hyperscript not being correct or un-parsable make sure you are importing the pragma and your built hyperscript

## FAQ

- Could I use this with ProseMirror? I suppose you could depending on how they handle their events under the hood.

## TODO

- PR the patches to the respective repos, especially the Slate ones.
- Write tests in Slate-React using the test utils?

## Contributing

Any and all PRs, issues, and ideas for improvement welcomes!
