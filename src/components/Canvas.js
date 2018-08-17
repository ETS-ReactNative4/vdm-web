import React, { Component } from 'react'
import { connect } from 'react-redux'
import './Canvas.css'
require('jqueryui');
require('jsplumb');


const jsPlumb = window.jsPlumb;

class Canvas extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes
    };

  }

  componentDidMount() {
    let nodes = this.props.nodes;
    let plumb = this.props.plumb;
    let addNode = this.props.addNode;
    let nodeClicked = this.props.nodeClicked;

    plumb.setContainer('canvas');
    jsPlumb.ready(function () {
      console.log('Plumb ready!')

      plumb.batch(function () {
        // Restore nodes
        nodes.forEach(node => {
          addNode(node, node.nodeKey, node.relX, node.relY, plumb, nodeClicked, false)
        });

        if (window.nodes.length > 1) {
          plumb.connect({ source: nodes[0].id, target: window.nodes[1].id, type: "basic" });
        }

      });




    });

  }

  render() {
    return (
      <div id='canvas'>
      </div>
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
)(Canvas)