import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropertyPage from '../components/PropertyPage'
import './Canvas.css'
require('jqueryui');
require('jsplumb');


const jsPlumb = window.jsPlumb;

class Canvas extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      currentNode: props.currentNode
    };

  }

  componentDidMount() {
    let nodes = this.props.acquireCanvas.nodes;
    let connections = this.props.acquireCanvas.connections;
    let plumb = this.props.plumb;
    let addNode = this.props.addNode;
    let nodeClicked = this.props.nodeClicked;
    let currentNode = this.props.currentNode

    plumb.setContainer('canvas');
    jsPlumb.ready(function () {
      console.log('Plumb ready!')

      plumb.batch(function () {
        // Restore nodes
        nodes.forEach(node => {
          addNode(node, plumb, nodeClicked, false)
        });

        if (connections.length > 0) {
          var c = connections[0];
          plumb.connect(c);
        }

      });
    });

  }

  render() {
    return (
      <div id='canvas' className='col-lg-6 col-md-3'/>    
    )
  }
}

const mapStateToProps = state => {
  console.log(state);
  return {
    acquireCanvas: state.acquireCanvas
  }
}

const mapDispatchToProps = dispatch => {
  return {

  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Canvas)