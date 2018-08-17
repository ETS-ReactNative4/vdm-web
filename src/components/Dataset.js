import React, { Component } from 'react'

class Dataset extends Component {
    render () {
      return (
        <li>
          <span>{this.props.name}</span>
        </li>     
      )
    }
  }

  export default Dataset