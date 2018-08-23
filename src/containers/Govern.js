import React, { Component } from 'react'
import DatasetList from '../components/DatasetList'
import TrifactaFrame from '../components/TrifactaFrame'
// eslint-disable-next-line
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Jumbotron, Button, Panel, ListGroup, ListGroupItem, Grid, Row, Col, Clearfix, Tabs, Tab } from 'react-bootstrap';


class Govern extends Component {

    render() {
        console.log(this.props.match)
        return (
            <div className='sub-menu'>
                <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
                    <Tab className='tab-content' eventKey={1} title="Conformed Data">
                        <div>
                            <div className='col-lg-2  col-md-3 left-pane'>
                                <DatasetList datasets={window.DATASETS} title='Available Data Elements' />
                            </div>
                            <TrifactaFrame />
                            <div className='col-lg-2  col-md-3 right-pane'>
                                <DatasetList datasets={window.DATASETS} title='Conformed Data Elements' />
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey={2} title="Conformed Object">
                        <div>
                            <div className='col-lg-2  col-md-3 left-pane'>
                                <DatasetList datasets={window.DATASETS} title='Conformed Data Elements' />
                            </div>
                            <TrifactaFrame />
                            <div className='col-lg-2  col-md-3 right-pane'>
                                <DatasetList datasets={window.DATASETS} title='Conformed Objects' />
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey={3} title="Another Tab" disabled>
                        Tab 3 content
                        </Tab>
                </Tabs>
            </div>

        );
    }
}



export default Govern