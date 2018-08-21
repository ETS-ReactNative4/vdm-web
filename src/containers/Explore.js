import React, { Component } from 'react'
import DatasetList from '../components/DatasetList'
// eslint-disable-next-line
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Jumbotron, Button, Panel, ListGroup, ListGroupItem, Grid, Row, Col, Clearfix, Tabs, Tab } from 'react-bootstrap';
import Acquire from './Acquire';
import Iframe from 'react-iframe'



class Explore extends Component {


 componentDidMount() {
  console.log( window.triurl);
  document.getElementById('myId').src='http://52.201.45.52:3005/data/153/760';
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
            <div>
              <Iframe url="http://52.201.45.52:3005/sign-in"
		        width="450px"
		        height="450px"
		        id="myId"
		        className="myClassname"
		        display="initial"
		        position="relative"
		        allowFullScreen/>
            </div>

        );
        
    }
}



export default Explore