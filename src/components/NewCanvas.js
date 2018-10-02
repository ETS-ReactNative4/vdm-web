import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropertyPage from '../components/PropertyPage'
import './Canvas.css'
require('jqueryui');
require('jsplumb');

const jsPlumb = window.jsPlumb;


class NewCanvas extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentNode: props.currentNode
    };

  }



  componentDidMount() {
    let nodes = this.props.acquireCanvas.nodes;
    let connections = this.props.acquireCanvas.connections;
    let addNode = this.props.addNode;
    let nodeClicked = this.props.nodeClicked;
    let currentNode = this.props.currentNode
    let plumb = this.props.plumb;

    // Create an instance of jsplumb for this canvas
    plumb = jsPlumb.getInstance({
      Endpoint: ["Dot", { radius: 2 }],
      HoverPaintStyle: { stroke: "#1e8151", strokeWidth: 2 },
      ConnectionOverlays: [
        ["Arrow", {
          location: 1,
          id: "arrow",
          width: 12,
          length: 8,
          foldback: 0.8
        }],
        // ["Label", { label: "", id: "label", cssClass: "aLabel" }]
      ],
      Container: "canvas",
      Connector: ["Bezier"]
    });

    plumb.setContainer('canvas');
    jsPlumb.ready(function () {
      console.log('Plumb ready!')

      plumb.batch(function () {
        // Restore nodes
        nodes.forEach(node => {
          addNode(node)
        });

        if (connections.length > 1) {
          plumb.connect(connections[0]);
        }

      });
    });

    this.props.setPlumb(plumb)

  }

  render() {
    return (
      <div id='canvas' className='col-lg-6 col-md-3' />
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
)(NewCanvas)