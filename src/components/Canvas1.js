import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropertyPage from '../components/PropertyPage'
import './Canvas.css'
require('jqueryui');
require('jsplumb');


const jsPlumb = window.jsPlumb;

class Canvas1 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      currentNode: props.currentNode
    };

  }

  componentDidMount() {
    let nodes = this.props.nodes;
    let plumb = this.props.plumb;
    let addNode = this.props.addNode;
    let nodeClicked = this.props.nodeClicked;
    let currentNode = this.props.currentNode

    plumb.setContainer('canvas1');
    jsPlumb.ready(function () {
      console.log('Plumb ready!')

      plumb.batch(function () {
        // Restore nodes
        nodes.forEach(node => {
          addNode(node, node.nodeKey, node.relX, node.relY, plumb, nodeClicked, false)
        });

        if (nodes.length > 1) {
          plumb.connect({ source: nodes[0].id, target:  nodes[1].id, type: "basic" });
        }

      });
    });

  }

  render() {
    return (
      <div id='canvas1' className='col-lg-6 col-md-3'/>    
    )
  }
}

const mapStateToProps = state => ({

})

const mapDispatchToProps = dispatch => {
  return {

  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Canvas1)