import React, { Component } from 'react'
import DatasetList from '../components/DatasetList'
// eslint-disable-next-line
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Jumbotron, Button, Panel, ListGroup, ListGroupItem, Grid, Row, Col, Clearfix, Tabs, Tab } from 'react-bootstrap';
import Acquire from './Acquire';
import Iframe from 'react-iframe'
import * as config from '../config';



class Explore extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            dataSources: []
        };
}

 componentDidMount() {

  fetch(config.VDM_SERVICE_HOST + '/vdm/getWrangledSets')
            .then(res => res.json())
            .then(
                (result) => {
                
                console.log(result);
                    this.setState({
                        isLoaded: true,
                        dataSources: JSON.parse(result)
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )



  }
  
  
  

    render() {
        console.log(this.props.match)
       /** return (
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

        );*/
        
        
        
         return (
            <div style={{padding:'20px'}}>Wrangled Datasets<hr/>
           {this.state.datasources}
            </div>

        );
        
    }
}



export default Explore