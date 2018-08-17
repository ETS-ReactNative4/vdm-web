import React, { Component } from 'react'
import DataSource from '../components/DataSource'
// eslint-disable-next-line
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Jumbotron, Button, Panel, ListGroup, ListGroupItem, Grid, Row, Col, Clearfix } from 'react-bootstrap';

class DataSourceList extends Component {
    constructor(props) {
        super(props);
        console.log('hello')
        console.log('props' + JSON.stringify(props))
    }


    filterChanged = (e) => {
        var updatedList = this.props.dataSources;
        updatedList = updatedList.filter(function (item) {
            return item.name.toLowerCase().search(
                e.target.value.toLowerCase()) !== -1;
        });
        this.setState({
            dataSources: updatedList
        })
    }

    render() {
        let dataSources = this.props.dataSources;
        return (


            <div>
                <div>Data Sources</div>
                    <input type="text" className="search" onChange={this.filterChanged} />
                    <ul>
                        {
                            dataSources.map((el) => {
                                return <DataSource key={el.id}
                                    name={el.name}
                                />
                            })
                        }
                    </ul>
            </div>

        )
    }
}

export default DataSourceList

