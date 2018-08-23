import React, { Component } from 'react'
import Dataset from '../components/Dataset'
// eslint-disable-next-line
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Jumbotron, Button, Panel, ListGroup, ListGroupItem, Grid, Row, Col, Clearfix } from 'react-bootstrap';

class DatasetList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasets: props.datasets,
            title: props.title
        };
    }


    filterChanged = (e) => {
        var updatedList = this.state.datasets;
        updatedList = updatedList.filter(function (item) {
            return item.name.toLowerCase().search(
                e.target.value.toLowerCase()) !== -1;
        });
        this.setState({
            datasets: updatedList
        })
    }

    render() {
        let {datasets, title} = this.state;
        return (
            <div>
                <div className='component-title'>{title}</div>
                <input type="text" className="search" onChange={this.filterChanged} />
                <ul>
                    {
                        datasets.map((el) => {
                            return <Dataset key={el.id}
                                name={el.name}
                            />
                        })
                    }
                </ul>
            </div>

        )
    }
}

export default DatasetList


