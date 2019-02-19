import * as React from 'react'

import * as CodeMirror from 'codemirror'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/gfm/gfm'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/addon/scroll/simplescrollbars'
import 'codemirror/addon/scroll/annotatescrollbar'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/jump-to-line'
import 'codemirror/addon/search/match-highlighter'
import 'codemirror/addon/search/matchesonscrollbar'
import 'codemirror/addon/display/fullscreen'
import 'codemirror/mode/yaml-frontmatter/yaml-frontmatter'
import 'codemirror/addon/fold/markdown-fold'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/mode/overlay'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/mode/meta'

const { useEffect, useRef } = React

interface IEditorConfigurationExtra {
  autoScroll?: boolean
  styleActiveLine?: boolean
  highlightSelectionMatches?: any
}

const defaultOptions: CodeMirror.EditorConfiguration &
  IEditorConfigurationExtra = {
  mode: 'yaml-frontmatter',
  autoScroll: true,
  tabSize: 2,
  styleActiveLine: true,
  indentWithTabs: true,
  lineWrapping: true,
  lineNumbers: true,
  foldGutter: true,
  gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  scrollbarStyle: 'simple',
  highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
  extraKeys: { 'Alt-F': 'findPersistent', 'Ctrl-M': 'replaceShift' }
}

interface IEditorProps {
  className?: string
  options?: CodeMirror.EditorConfiguration
  [handlers: string]: any // Handler props that will be mapped to CodeMirror's handlers. Should aways start with on
}

const mapHandlers = (props: IEditorProps, cm: CodeMirror.Editor) => {
  const handlerNames = Object.keys(props).filter(prop => {
    return /^on+/.test(prop)
  })

  // map EditorCore's event handler defined in props to CodeMirror's event handler
  for (let handlerName of handlerNames) {
    const cmEvent = handlerName.replace(/^on[A-Z]/g, s =>
      s.slice(2).toLowerCase()
    )
    cm.on(cmEvent, props[handlerName])
  }
}

const EditorCore = (props: IEditorProps) => {
  let cm: CodeMirror.Editor | null = null

  // Mount codemirror to textarea

  useEffect(() => {
    const { options } = props

    cm = CodeMirror(cmEle.current, {
      ...defaultOptions,
      ...options
    })

    if (options && options.value) cm.setValue(options.value)

    mapHandlers(props, cm)

    // Remove the editor, and restore the original textarea (with the editor's current content).

    //    return () => cm.toTextArea()
  })

  const cmEle: any | null = useRef(null)

  return <div ref={cmEle} />
}

export default EditorCore
