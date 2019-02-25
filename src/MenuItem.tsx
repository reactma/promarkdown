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
  link?: string
  render?: (props: {
    editor: CodeMirror.Editor
    name: string
    state: string
    tip: string
  }) => React.ComponentElement<any, any>
}

const MenuItem = (props: IMenuItemProps) => {
  const { name, editor, state = 'enabled', tip, onClick, render, className , link } = props

  const onClickHandler = () =>
    onClick && onClick(editor, name, state || 'enabled')

  if (render) {
    const composedClassName = 'menu-icon ' + className
    return (
      <span className={composedClassName} onClick={onClickHandler}>
        {render({
          editor,
          name,
          state,
          tip
        })}
      </span>
    )
  } else if (name === '|') return <i className='separator'> | </i>
  else {
    const faIcon = menuNameToIconDefinition[name]

    const stateClassName =
      state === 'selected'
        ? 'menu-icon-selected'
        : state === 'disabled'
          ? 'menu-icon-disabled'
          : 'menu-icon-enabled'

    const composedClassName = 'menu-icon ' + stateClassName

    if (name === 'help')
      return faIcon ? (
        <a href={link} target='_blank'>
          <span className={composedClassName} >
            <dfn title={tip}>
              <FontAwesomeIcon icon={faIcon} />{' '}
            </dfn>
          </span>
        </a>
      ) : null

    else
      return faIcon ? (
        <span className={composedClassName} onClick={onClickHandler}>
          <dfn title={tip}>
            <FontAwesomeIcon icon={faIcon} />{' '}
          </dfn>
        </span>
      ) : null
  }
}

export default MenuItem
