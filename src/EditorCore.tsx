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
import 'codemirror/keymap/vim'
import 'codemirror/keymap/emacs'
import 'codemirror/keymap/sublime'

import 'codemirror/mode/yaml-frontmatter/yaml-frontmatter'

import './toml-frontmatter'
import './json-frontmatter'

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
  scrollbarStyle: 'simple',
  highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
  extraKeys: { 'Alt-F': 'findPersistent', 'Ctrl-M': 'replaceShift' }
}

export interface IEditorProps {
  atMounted?: (editor: CodeMirror.Editor) => any
  atUnmounted?: (editor: CodeMirror.Editor) => any
  atChange?: (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string
  ) => any // if atChange is defined, it will override onChange handler
  className?: string
  locale?: string
  intlPhrases?: any
  options?: CodeMirror.EditorConfiguration
  width?: number | string | null
  height?: number | string | null
  [handlers: string]: any // Handler props that will be mapped to CodeMirror's handlers. Should aways start with on
}

// Simplified Chinese phrases for search/replace/go-to-line dialogs

const cnPhrases = {
  'Search:': '搜索:',
  '(Use /re/ syntax for regexp search)': '(使用 /re/ 语法进行正则式搜索)',
  'Replace?': '替换？',
  'Replace:': '替换:',
  'Replace all:': '全部替换:',
  'With:': '为:',
  Yes: '是',
  No: '否',
  All: '所有',
  Stop: '停止',
  'Jump to line:': '跳转到行:',
  '(Use line:column or scroll% syntax)': '(使用 行号:列号 或 滚动比例% 语法)'
}

/* Map user defined codemirror event handlers to CodeMirror cm.on( eventName ... ) event lisener
 * For example onChange is mapped to on(change, ...) of CodeMirror
 */

const mapHandlers = (props: IEditorProps, cm: CodeMirror.Editor) => {
  const handlerNames = Object.keys(props).filter((prop) => {
    return /^on+/.test(prop)
  })

  // map EditorCore's event handler defined in props to CodeMirror's event handler

  for (const handlerName of handlerNames) {
    const cmEvent = handlerName.replace(/^on[A-Z]/g, (s) =>
      s.slice(2).toLowerCase()
    )
    cm.on(cmEvent, props[handlerName])
  }
}

const EditorCore = React.memo((props: IEditorProps) => {
  //  let cm: CodeMirror.Editor | null = null

  const [mounted, setMounted] = React.useState<CodeMirror.Editor | null>(null)

  // This editor is intended for markdown only, supporting yaml-frontmatter / toml-frontmatter / json-frontmatter

  useEffect(() => {
    const {
      options,
      intlPhrases,
      locale,
      atMounted,
      atUnmounted,
      atChange
    } = props

    const gutters = options!.lineNumbers
      ? ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
      : []

    const composedOptions = intlPhrases ?
                            (locale === 'zh-CN' ?
                              {...defaultOptions, ...options, phrases: { ...cnPhrases, ...intlPhrases }, gutters } :
                              {...defaultOptions, ...options, phrases: intlPhrases, gutters }
                            )
                          : (locale === 'zh-CN' ?
                              {...defaultOptions, ...options, phrases: cnPhrases, gutters } :
                              {...defaultOptions, ...options, gutters }
                          )

    // Check cm already mounted. If yes, use already mounted cm

    const cm: CodeMirror.Editor =
      mounted ||
      CodeMirror(cmEle.current, composedOptions)

    if (!mounted) {
      setMounted(cm)

      if (options && options.value) cm.setValue(options.value)

      const composedProps = atChange
                          ? {
                            ...composedOptions,
                            onChange: (
                              editor: CodeMirror.Editor,
                              change: CodeMirror.EditorChange
                            ) => atChange(cm, change, editor.getDoc().getValue())
                          }
                          : composedOptions

      mapHandlers(composedProps, cm)
      if (atMounted) atMounted(cm)
    }
    return () => atUnmounted && atUnmounted(cm)
  })

  const cmEle: any | null = useRef(null)

  const composedClassName = 'promarkdown-codemirror' + (props.className ? ' ' + props.className : '')

  return <div className={composedClassName} ref={cmEle} />
})

export default EditorCore
