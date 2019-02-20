import * as React from 'react'

import * as CodeMirror from 'codemirror'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/gfm/gfm'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/toml/toml'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/scroll/simplescrollbars'
import 'codemirror/addon/scroll/annotatescrollbar'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/jump-to-line'
import 'codemirror/addon/search/match-highlighter'
import 'codemirror/addon/search/matchesonscrollbar'
import 'codemirror/addon/display/fullscreen'
import 'codemirror/addon/fold/markdown-fold'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/mode/overlay'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/mode/meta'

import 'codemirror/mode/yaml-frontmatter/yaml-frontmatter'

require('./toml-frontmatter')
require('./json-frontmatter')

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

export interface IEditorProps {
  className?: string,
  locale?: string,
  intlPhrases?: any,
  options?: CodeMirror.EditorConfiguration
  [handlers: string]: any // Handler props that will be mapped to CodeMirror's handlers. Should aways start with on
}

//Simplified Chinese phrases for search/replace/go-to-line dialogs

const cnPhrases = {
  'Search:' : '搜索:',
  '(Use /re/ syntax for regexp search)': '(使用 /re/ 语法进行正则式搜索)',
  'Replace?': '替换？',
  'Replace:': '替换:',
  'Replace all:': '全部替换:',
  'With:': '为:',
  'Yes:': '是',
  'No:': '否',
  'All:': '所有',
  'Stop:': '停止',
  'Jump to line:': '跳转到行:',
  '(Use line:column or scroll% syntax)': '(使用 行号:列号 或 滚动比例% 语法)'
}

/* Map user defined codemirror event handlers to CodeMirror cm.on( eventName ... ) event lisener
 * For example onChange is mapped to on(change, ...) of CodeMirror
 */

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

  // This editor is intended for markdown only, supporting yaml-frontmatter / toml-frontmatter / json-frontmatter

  if( props.options && props.options.mode && props.options.mode !== 'yaml-frontmatter' && props.options.mode != 'toml-frontmatter' && props.options.mode !== 'json-frontmatter' )

    throw new Error( 'Current only supports yaml-frontmatter mode, tom-frontmatter and json-fromtmatter modes, with gfm as main mode' )

  useEffect(() => {

    const { options, intlPhrases, locale } = props

    const composedOptions = intlPhrases ?
                            ( locale === 'zh-CN' ?
                              { ...options,
                                phrases : { ...cnPhrases, ...intlPhrases }
                              } :
                              { ...options,
                                phrases : intlPhrases
                              } ) :
                            ( locale === 'zh-CN' ?
                              { ...options, phrases: cnPhrases } :
                              { ...options } )

    cm = CodeMirror(cmEle.current, {
      ...defaultOptions,
      ...composedOptions
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
