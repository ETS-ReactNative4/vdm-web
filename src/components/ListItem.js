import React, { Component } from 'react'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'

class ListItem extends Component {

    render () {
        return (
          <li className='list-item' id={this.props.id}>
            <FontAwesomeIcon icon={this.props.icon} />  
            <span className='list-item-name'> {this.props.name}</span>
            <span className="update-date"> {this.props.updateDate}</span>
          </li>     
        )
      }
  }

  export default ListItem