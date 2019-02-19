import * as React from 'react'

import * as CodeMirror from 'codemirror'
import 'codemirror/mode/meta'

const defaultOptions = {
  value: `---
         front: front matter
  ---
         # H1`,
  mode: 'yaml-frontmatter'
}
const EditorCore = (props: any) => {
  let textarea: any | null = null
  let cm: any | null = null

  React.useEffect(() => {
    cm = CodeMirror.fromTextArea(textarea, defaultOptions)
  })
  return (
    <textarea
      ref={instance => {
        textarea = instance
      }}
    />
  )
}

export default EditorCore
