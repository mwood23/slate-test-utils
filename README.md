## Issues

- The new automatic JSX runtime with typescript `react-jsx` doesn't play nice with custom hyperscript. You will need to create a typescript file specific for your tests and use `"jsx": "react"`.
- React 17 will work, but at the moment Slate itself is 16.8. We are going to follow their lead.
