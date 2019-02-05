import React, { Component } from 'react'

class CliFile extends Component {

  handleClick(name, callback) {
    callback(name)
  }

  render() {

    // const {callback} = this.props

    return (
      <li>
        {/* <span>{this.props.name}</span><span><Button onClick={this.handleClick.bind(this, this.props.name, callback)}
        >Parse</Button></span> */}
        <input type="radio" name="cli" value={this.props.name}/>&nbsp;{this.props.name}
      </li>
    )
  }
}

export default CliFile