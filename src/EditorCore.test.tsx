import * as React from 'react'
import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { render } from 'enzyme'

import EditorCore from './EditorCore'

Enzyme.configure({ adapter: new Adapter() })

describe("Editor core", () => {

  const wrapper = render( <EditorCore className="my-promarkdown" /> )

  test("Editor core is mounted correctly", () => {

    expect(wrapper.is('.promarkdown-codemirror')).toBeTruthy()
  })

  test("Custom class name is effective", () => {

    expect(wrapper.is('.my-promarkdown')).toBeTruthy()

  })

})
