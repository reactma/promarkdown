import * as React from 'react'
import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { render } from 'enzyme'

import ProMarkdown from './ProMarkdown'

Enzyme.configure({ adapter: new Adapter() })

describe("ProMarkdown", () => {

  const wrapper = render( <ProMarkdown className="my-promarkdown" /> )

  test("Promarkdown is mounted correctly", () => {

    expect(wrapper.find('.pro-markdown')).toBeDefined()

  })

})
