import '@testing-library/jest-dom'
import '../../dist/esm/mocks'

window.DataTransfer = class DataTransfer { }
window.InputEvent.prototype.getTargetRanges = () => []