import React, { Component } from 'react'
import DatasetList from '../components/DatasetList'
// eslint-disable-next-line
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Jumbotron, Button, Panel, ListGroup, ListGroupItem, Grid, Row, Col, Clearfix, Tabs, Tab } from 'react-bootstrap';


class Explore extends Component {

    render() {
        console.log(this.props.match)
        return (
            <div className='sub-menu'>
                <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
                    <Tab className='tab-content' eventKey={1} title="Acquire Data">
                        <div>
                            <div className='col-lg-2  col-md-3 left-pane'>
                                <DatasetList/>
                            </div>
                            <div className='col-lg-8 col-md-6'>Canvass</div>
                            <div className='col-lg-2  col-md-3 right-pane'>Explored Datasets</div>
                        </div>
                    </Tab>
                    <Tab eventKey={2} title="Rules Parser">
                        Rules Parser content
                        </Tab>
                    <Tab eventKey={3} title="Another Tab" disabled>
                        Tab 3 content
                        </Tab>
                </Tabs>
            </div>

        );
    }
}



export default Explore