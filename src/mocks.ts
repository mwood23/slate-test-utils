// @ts-ignore
window.DataTransfer = class DataTransfer {}

const origin = global.navigator.platform
const cleared = Symbol('clear')
let fakePlatform: any = null

Object.defineProperty(global.navigator, 'platform', {
  get() {
    return fakePlatform === cleared ? origin : fakePlatform || ''
  },
})

export const clear = () => {
  fakePlatform = cleared
}

export const mockPlatform = (agent: any) => {
  fakePlatform = agent
}
