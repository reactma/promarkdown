import * as React from 'react'

interface IGreeterProps {
  name: string
}

const Greeter = ( { name } : IGreeterProps ) => <div> {`Hello ${name}`}</div>

export default Greeter
