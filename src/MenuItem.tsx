import * as React from 'react'
import * as CodeMirror from 'codemirror'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faBold,
  faCode,
  faColumns,
  faEraser,
  faExpandArrowsAlt,
  faEye,
  faHeading,
  faImage,
  faItalic,
  faLink,
  faListUl,
  faListOl,
  faMinus,
  faQuestion,
  faQuoteRight,
  faStrikethrough,
  faTable
} from '@fortawesome/free-solid-svg-icons'

export type IMenuItemState = 'enabled' | 'disabled' | 'selected'

const menuNameToIconDefinition: any = {
  bold: faBold,
  quote: faQuoteRight,
  heading: faHeading,
  br: faMinus,
  eraser: faEraser,
  link: faLink,
  image: faImage,
  'unordered-list': faListUl,
  'ordered-list': faListOl,
  strikethrough: faStrikethrough,
  italic: faItalic,
  preview: faEye,
  fullscreen: faExpandArrowsAlt,
  help: faQuestion,
  splitpane: faColumns,
  table: faTable,
  code: faCode
}

export interface IMenuItemProps {
  name: string
  editor: CodeMirror.Editor
  state?: IMenuItemState
  tip: string
  onClick?: (editor: CodeMirror.Editor, name: string, state: string) => void
  keyboard?: string
  className?: string
  render?: (props: {
    editor: CodeMirror.Editor
    name: string
    state: string
    tip: string
  }) => React.ComponentElement<any, any>
}

const MenuItem = (props: IMenuItemProps) => {
  const { name, editor, state, tip, onClick, render, className } = props

  if (render) {
    const composedClassName = 'menu-icon ' + className
    return (
      <span
        className={composedClassName}
        onClick={() => onClick && onClick(editor, name, state || 'enabled')}
      >
        {render({
          editor,
          name,
          state,
          tip
        })}
      </span>
    )
  } else {
    if (name === '|') {
      return <i className='separator'> | </i>
    } else {
      const faIcon = menuNameToIconDefinition[name]

      const stateClassName =
        state === 'selected'
          ? 'menu-icon-selected'
          : state === 'disabled'
            ? 'menu-icon-disabled'
            : 'menu-icon-enabled'

      const className = 'menu-icon ' + stateClassName

      return faIcon ? (
        <span
          className={className}
          onClick={() => onClick && onClick(editor, name, state || 'enabled')}
        >
          <dfn title={tip}>
            <FontAwesomeIcon icon={faIcon} />{' '}
          </dfn>
        </span>
      ) : null
    }
  }
}

export default MenuItem
