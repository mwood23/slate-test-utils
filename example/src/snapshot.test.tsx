/** @jsx jsx */

import { assertOutput, renderEditor } from '../../dist'
import { RichTextExample } from './Editor'
import { jsx } from './test-utils'
import { fireEvent } from '@testing-library/dom'

it('snapshot = user triggers bold hotkey and types with a collapsed selection', async () => {
  const input = (
    <editor>
      <hp>
        <htext>
          potato
          <cursor />
        </htext>
      </hp>
    </editor>
  )

  const [, { triggerKeyboardEvent, type }, { container }] = await renderEditor(
    RichTextExample,
  )({
    editor: input,
  })

  await triggerKeyboardEvent('mod+b')
  await type(' cucumbers')

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="css-fu1za2"
      >
        <span
          class="css-vbnk1l"
          data-active="true"
          data-testid="bold"
        >
          <span
            class="material-icons css-kxb41r"
          >
            format_bold
          </span>
        </span>
        <span
          class="css-1vdn1ty"
          data-active="false"
          data-testid="italic"
        >
          <span
            class="material-icons css-kxb41r"
          >
            format_italic
          </span>
        </span>
        <span
          class="css-1vdn1ty"
          data-active="false"
          data-testid="underline"
        >
          <span
            class="material-icons css-kxb41r"
          >
            format_underlined
          </span>
        </span>
        <span
          class="css-1vdn1ty"
          data-active="false"
          data-testid="code"
        >
          <span
            class="material-icons css-kxb41r"
          >
            code
          </span>
        </span>
        <span
          class="css-1vdn1ty"
          data-active="false"
          data-testid="heading-one"
        >
          <span
            class="material-icons css-kxb41r"
          >
            looks_one
          </span>
        </span>
        <span
          class="css-1vdn1ty"
          data-active="false"
          data-testid="heading-two"
        >
          <span
            class="material-icons css-kxb41r"
          >
            looks_two
          </span>
        </span>
        <span
          class="css-1vdn1ty"
          data-active="false"
          data-testid="block-quote"
        >
          <span
            class="material-icons css-kxb41r"
          >
            format_quote
          </span>
        </span>
        <span
          class="css-1vdn1ty"
          data-active="false"
          data-testid="numbered-list"
        >
          <span
            class="material-icons css-kxb41r"
          >
            format_list_numbered
          </span>
        </span>
        <span
          class="css-1vdn1ty"
          data-active="false"
          data-testid="bulleted-list"
        >
          <span
            class="material-icons css-kxb41r"
          >
            format_list_bulleted
          </span>
        </span>
      </div>
      <div
        contenteditable="true"
        data-gramm="false"
        data-slate-editor="true"
        data-slate-node="value"
        data-testid="slate-content-editable"
        data-variant="wordProcessor"
        role="textbox"
        style="position: relative; outline: none; white-space: pre-wrap; word-wrap: break-word;"
        zindex="-1"
      >
        <p
          data-slate-node="element"
        >
          <span
            data-slate-node="text"
          >
            <span
              data-slate-leaf="true"
            >
              <span
                data-slate-string="true"
              >
                potato
              </span>
            </span>
          </span>
          <span
            data-slate-node="text"
          >
            <span
              data-slate-leaf="true"
            >
              <strong>
                <span
                  data-slate-string="true"
                >
                   cucumbers
                </span>
              </strong>
            </span>
          </span>
        </p>
      </div>
    </div>
  `)
})
