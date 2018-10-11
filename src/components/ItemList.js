import React, { Component } from 'react'
import ListItem from './ListItem'
import $ from 'jquery';

import 'jqueryui/jquery-ui.css'
import './ItemList.css'

window.jQuery = $;

require('jqueryui');

class ItemList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFilter: '',
      displayedItems: this.props.items
    }

    this.searchHandler = this.searchHandler.bind(this)

  }

  filterItems(filter) {
    let displayedItems = this.props.items.filter((el) => {
      let searchValue = el.name.toLowerCase();
      return searchValue.indexOf(filter) !== -1;
    })

    this.setState({ currentFilter: filter, displayedItems: displayedItems })
  }

  static getDerivedStateFromProps(props, current_state) {
    let displayedItems = props.items.filter((el) => {
      let searchValue = el.name.toLowerCase();
      return searchValue.indexOf(current_state.currentFilter) !== -1;
    })

    return {
      currentFilter: current_state.currentFilter,
      displayedItems: displayedItems
    }
  }



  searchHandler(event) {
    this.filterItems(event.target.value.toLowerCase())
  }

  componentDidUpdate(prevProps) {
    $(".list-item").draggable({
      helper: 'clone',
      start: function (event, ui) {
        console.log(event.currentTarget.id);
      }
    });

  }

  componentDidMount() {
    $(".list-item").draggable({
      helper: 'clone',
      start: function (event, ui) {
        console.log(event.currentTarget.id);
      }
    });

  }

  render() {
    // let items = this.state.displayedItems;
    let items = this.state.displayedItems;
    let icon = this.props.icon
    let itemType = this.props.itemType
    return (
      <div className="list-panel">
        <h4>{this.props.title}</h4>
        <input placeholder='Search' type="text" className="search-text" onChange={this.searchHandler} />
        <ul className='list'>
          {
            items.map((el) => {
              return <ListItem
                key={el.id}
                itemType={itemType}
                icon={icon}
                id={el.id}
                name={el.name}
                updateDate={el.updateDate}
              />
            })
          }
        </ul>
      </div>
    )
  }
}

export default ItemList