import {
  queryHelpers,
  buildQueries,
  AllByAttribute,
  GetErrorFunction,
} from '@testing-library/react'

// Drops the first argument in a tuple
type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

// The queryAllByAttribute is a shortcut for attribute-based matchers
// You can also use document.querySelector or a combination of existing
// testing library utilities to find matching nodes for your query
const queryAllByDataEditorLeaf = (
  ...args: DropFirst<Parameters<AllByAttribute>>
) => queryHelpers.queryAllByAttribute('data-editor-leaf', ...args)

const getMultipleErrorLeaf: GetErrorFunction = (c, dataValue) =>
  `Found multiple elements with the data-editor-leaf attribute of: ${dataValue}`
const getMissingErrorLeaf: GetErrorFunction = (c, dataValue) =>
  `Unable to find an element with the data-editor-leaf attribute of: ${dataValue}`

const [
  queryByDataEditorLeaf,
  getAllByDataEditorLeaf,
  getByDataEditorLeaf,
  findAllByDataEditorLeaf,
  findByDataEditorLeaf,
] = buildQueries(
  queryAllByDataEditorLeaf,
  getMultipleErrorLeaf,
  getMissingErrorLeaf,
)

const queryAllByDataEditorElement = (
  ...args: DropFirst<Parameters<AllByAttribute>>
) => queryHelpers.queryAllByAttribute('data-editor-element', ...args)

const getMultipleErrorElement: GetErrorFunction = (c, dataValue) =>
  `Found multiple elements with the data-editor-element attribute of: ${dataValue}`
const getMissingErrorElement: GetErrorFunction = (c, dataValue) =>
  `Unable to find an element with the data-editor-element attribute of: ${dataValue}`

const [
  queryByDataEditorElement,
  getAllByDataEditorElement,
  getByDataEditorElement,
  findAllByDataEditorElement,
  findByDataEditorElement,
] = buildQueries(
  queryAllByDataEditorElement,
  getMultipleErrorElement,
  getMissingErrorElement,
)

export {
  queryByDataEditorLeaf,
  queryAllByDataEditorLeaf,
  getByDataEditorLeaf,
  getAllByDataEditorLeaf,
  findAllByDataEditorLeaf,
  findByDataEditorLeaf,
  queryByDataEditorElement,
  getAllByDataEditorElement,
  getByDataEditorElement,
  findAllByDataEditorElement,
  findByDataEditorElement,
}
