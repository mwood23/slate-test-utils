/** @jsx jsx */

import { ensureSlateStateValid } from '../../../dist/esm'
import { jsx } from '../test-utils'

/**
 * This helper makes sure that your hyperscript is valid Slate before rendering! If
 * you unskip this test you'll see that it will give you contextual info on what's wrong.
 */
it.skip('ensures valid Slate before testing', async () => {
  const input = (
    <editor>
      {/* Invalid because no text node children! */}
      <hp></hp>
    </editor>
  )

  ensureSlateStateValid(input)
})
