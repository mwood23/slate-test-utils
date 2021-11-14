// @noflow
import { clear as clearUserAgent, mockUserAgent } from 'jest-useragent-mock'
import { mockPlatform, clear as clearPlatform } from './mocks'

export const testRunner = (
  testCases: any,
  { runMac = true, runWindows = true } = {},
) => {
  if (runMac) {
    describe('Mac', () => {
      beforeAll(() => {
        mockUserAgent('Mac OS X')
        mockPlatform('Mac')
      })

      afterAll(() => {
        clearUserAgent()
        clearPlatform()
      })

      testCases()
    })
  }

  if (runWindows) {
    describe('Windows', () => {
      beforeAll(() => {
        // Windows is !IS_APPLE under the hood for Slate
        mockUserAgent('')
        mockPlatform('')
      })

      afterAll(() => {
        clearUserAgent()
        clearPlatform()
      })

      testCases()
    })
  }
}
