import * as React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faEye,
  faQuestion,
  faColumns,
  faExpandArrowsAlt
} from '@fortawesome/free-solid-svg-icons'

const menuNameToIconDefinition: any = {
  preview: faEye,
  fullscreen: faExpandArrowsAlt,
  help: faQuestion,
  splitpane: faColumns
}

export interface IMenuItemProps {
  name: string
  state?: 'enabled' | 'disabled' | 'selected'
  tip: string
  onClick?: (name: string, state: string) => void
  keyboard?: string
}

const MenuItem = (props: IMenuItemProps) => {
  const { name, state, tip, onClick } = props

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
        onClick={() => onClick && onClick(name, state || 'enabled')}
      >
        <dfn title={tip}>
          <FontAwesomeIcon icon={faIcon} />{' '}
        </dfn>
      </span>
    ) : null
  }
}

export default MenuItem
