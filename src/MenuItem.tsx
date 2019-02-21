import * as React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faEye,faExpand,faQuestion,faColumns   } from '@fortawesome/free-solid-svg-icons'

type ProMarkdownMenuNames = 'preview' | 'fullscreen' | 'help' | 'splitpane' | '|'

const menuNameToIconDefinition : any = {
  preview: faEye,
  fullscreen: faExpand,
  help: faQuestion,
  splitpane: faColumns
}

export interface IMenuItemProps {
  name: string
  state?: 'enabled' | 'disabled' | 'selected'
  tip: string
  onClick?: ( name: string, state: string ) => void

}

const MenuItem = ( props : IMenuItemProps ) => {

  const { name, state, tip, onClick } = props

  if( name === '|' ) {

    return <i className="separator"> | </i>

  } else {

    const  faIcon = menuNameToIconDefinition[name]

    const stateClassName = state === 'selected' ? 'menu-icon-selected' :
                                    state === 'disabled' ? 'menu-icon-disabled' :
                                    'menu-icon-enabled'

    const className= 'menu-icon ' + stateClassName

    return faIcon ? <span className={className} onClick={() => onClick && onClick( name, state || 'enabled' ) } > <dfn title={tip}> <FontAwesomeIcon icon={faIcon} /> </dfn></span> : null

  }

}

export default MenuItem
