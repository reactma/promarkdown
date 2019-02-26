import * as React from 'react'
import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { render } from 'enzyme'

import EditorCore from './EditorCore'

Enzyme.configure({ adapter: new Adapter() })

describe("Editor core", () => {

  const wrapper = render( <EditorCore className="my-remarkdown" /> )

  test("Editor core is mounted correctly", () => {

    expect(wrapper.find('.remarkdown-codemirror')).toBeDefined()
    expect(wrapper.find('.my-remarkdown')).toBeDefined()

  })

  test("Custom class name is effective", () => {

    expect(wrapper.find('.my-remarkdown')).toBeDefined()

  })

  test("CodeMirror is mounted correctly", () => {

    expect(wrapper.find('.CodeMirror')).toBeDefined()

  })

})
