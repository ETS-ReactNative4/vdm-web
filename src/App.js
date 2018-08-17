import React, { Component } from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
// eslint-disable-next-line
import { faHome, faUpload, faSearch, faGavel } from '@fortawesome/fontawesome-free-solid'
// eslint-disable-next-line
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Jumbotron, Button, Panel, ListGroup, ListGroupItem, Grid, Row, Col, Clearfix } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">

        <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Toggle />
            <Navbar.Brand>
              Visualized Data Management
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <LinkContainer to="/acquire">
                <NavItem><FontAwesomeIcon icon="upload" /> Acquire</NavItem>
              </LinkContainer>
              <LinkContainer to="/explore">
                <NavItem><FontAwesomeIcon icon="search" /> Explore</NavItem>
              </LinkContainer>
              <LinkContainer to="/govern">
                <NavItem><FontAwesomeIcon icon="gavel" /> Govern</NavItem>
              </LinkContainer>
              <LinkContainer to="/operationalize">
                <NavItem><FontAwesomeIcon icon="wrench" /> Operationalize</NavItem>
              </LinkContainer>
              <LinkContainer to="/monitor">
                <NavItem><FontAwesomeIcon icon="heartbeat" /> Monitor</NavItem>
              </LinkContainer>
              <LinkContainer to="/about">
                <NavItem><FontAwesomeIcon icon="book-open" /> About</NavItem>
              </LinkContainer>
              {/* <NavDropdown eventKey={3} title="Community" id="basic-nav-dropdown">
                <MenuItem eventKey={3.1}>Post</MenuItem>
                <MenuItem eventKey={3.2}>Vote</MenuItem>
                <MenuItem eventKey={3.3}>Art</MenuItem>
                <MenuItem divider />
                <MenuItem eventKey={3.4}>Retrieve PIN</MenuItem>
                <LinkContainer to="/matches">
                  <MenuItem eventKey={3.3}>Art</MenuItem>
                </LinkContainer>

              </NavDropdown> */}
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <div className="content">
        </div>
        
        <i className="fa fa-camera-retro"></i>
        <div className="navbar navbar-fixed-bottom footer">
        Copyright &copy; 2018 RCG Global Services
        </div>
      </div>
    );
  }
}

export default App;
