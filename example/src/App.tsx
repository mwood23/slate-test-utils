import './App.css'
import React from 'react'
import { RichTextExample } from './Editor'

function App() {
  return (
    <div className="App">
      <h1>Word Processor</h1>
      <RichTextExample />
      <h1>Comment Mode</h1>
      <RichTextExample />
    </div>
  )
}

export default App
