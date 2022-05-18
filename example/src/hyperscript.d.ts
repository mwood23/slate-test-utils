declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    hp: any
    editor: any
    htext: {
      bold?: boolean
      underline?: boolean
      italic?: boolean
      children?: any
    }
    himage: any
    hbulletedlist: any
    hlistitem: any
    cursor: any
    focus: any
    anchor: any
  }
}
