import React, { Component } from 'react'
import ConnectionsList from '../components/ConnectionsList'
import Canvas from '../components/Canvas'
import PropertyPage from '../components/PropertyPage'
import "./Acquire.css";
// eslint-disable-next-line
import { Button, Tabs, Tab } from 'react-bootstrap';
import $ from 'jquery';
import { connect } from 'react-redux'


require('jqueryui');
require('jsplumb');

const jsPlumb = window.jsPlumb;
// const jsPlumbUtil = window.jsPlumbUtil;

class Acquire extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            dataSources: [],
            zTreeObj: null,
            currentNode: null,
            plumb: null
        };

        this.addNode = this.addNode.bind(this);
        this.nodeClicked = this.nodeClicked.bind(this);
        window.onUpdateNodeClassName = this.props.onUpdateNodeClassName;
    }

    // Update the current selected node
    nodeClicked = nodeId => {
        var clickedNode = this.props.acquireNodes.find(n => n.id === nodeId);
        this.setState({ currentNode: clickedNode });
        console.log(clickedNode);
    }


    // Add the node to the node list and to the canvas
    addNode(node, nodeKey, relX, relY, plumb, nodeClicked, isNewNode) {

        var initNode = function (el) {

            // initialise draggable elements.
            plumb.draggable(el, {
                containment: true,
                grid: [50, 50]
            });

            $(el).draggable({
                cancel: "div.ep",
                stop: function (event, ui) {
                    console.log(ui.helper[0].id)
                    console.log(ui.position)
                    // Update the node position
                    var node = window.acquireNodes.find(node => node.id === ui.helper[0].id)
                    node.relX = ui.position.left - 300
                    node.relY = ui.position.top - 100
                }
            });

            plumb.makeSource(el, {
                filter: ".ep",
                anchor: "Continuous",
                connectorStyle: { stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
                connectionType: "basic",
                extract: {
                    "action": "the-action"
                },
                maxConnections: 2,
                onMaxConnections: function (info, e) {
                    alert("Maximum connections (" + info.maxConnections + ") reached");
                }
            });

            plumb.makeTarget(el, {
                dropOptions: { hoverClass: "dragHover" },
                anchor: "Continuous",
                allowLoopback: true
            });

        };

        var newNode = function (x, y) {
            var vOffset = 100;
            var hOffset = 300;
            var d = document.createElement("div");
            // var id = jsPlumbUtil.uuid();
            var nodeName = node.name;
            if (nodeName.length > 7) { nodeName = nodeName.substring(0, 7) + '...'; }
            d.className = "w";
            d.id = node.id;
            d.innerHTML = nodeName + "<div class=\"ep\"></div>";
            d.style.left = (x + hOffset) + "px";
            d.style.top = (y + vOffset) + "px";
            plumb.getContainer().appendChild(d);
            initNode(d);
            return d;
        };

        console.log('Nodekey: ' + nodeKey);

        var d = newNode(relX, relY);

        // Fluffup this node with metadata
        node.nodeKey = nodeKey;
        node.relX = relX;
        node.relY = relY;

        if (this.props.acquireNodes.find(x => x.id === node.id) == null) {
            this.props.onAddNode(node)
        } else {
            if (isNewNode === true) {
                plumb.getContainer().removeChild(d);
            }
        }

        window.acquireNodes = this.props.acquireNodes

        $(".w").on('click', function (e) {
            console.log('clicked ' + e.currentTarget.id)
            nodeClicked(e.currentTarget.id);
            e.preventDefault();
        });

    }

    componentDidMount() {

        // Create an instance of jsplumb for this canvas
        let plumb = jsPlumb.getInstance({
            Endpoint: ["Dot", { radius: 2 }],
            Connector: "StateMachine",
            HoverPaintStyle: { stroke: "#1e8151", strokeWidth: 2 },
            ConnectionOverlays: [
                ["Arrow", {
                    location: 1,
                    id: "arrow",
                    length: 14,
                    foldback: 0.8
                }],
                ["Label", { label: "FOO", id: "label", cssClass: "aLabel" }]
            ],
            Container: "canvas"
        });

        plumb.registerConnectionType("basic", { anchor: "Continuous", connector: "StateMachine" });

        // bind a click listener to each connection; the connection is deleted. you could of course
        // just do this: instance.bind("click", instance.deleteConnection), but I wanted to make it clear what was
        // happening.
        plumb.bind("click", function (connection) {
            plumb.deleteConnection(connection);
        });

        // bind a connection listener. note that the parameter passed to this function contains more than
        // just the new connection - see the documentation for a full list of what is included in 'info'.
        // this listener sets the connection's internal
        // id as the label overlay's text.
        plumb.bind("connection", function (info, e) {
            e.preventDefault();
            info.connection.getOverlay("label").setLabel(info.connection.id);
            console.log("Source:" + info.connection.sourceId)
            console.log("Target:" + info.connection.targetId)

            // Prepare form for submission
            window.onUpdateNodeClassName({ id: info.connection.sourceId, className: "source-form" })
            window.onUpdateNodeClassName({ id: info.connection.targetId, className: "target-form" })
        });



        this.setState({ plumb: plumb });


        //fetch('http://localhost:4000/api/getconnections')
        fetch('http://localhost:9988/vdm/getConnections')
            .then(res => res.json())
            .then(
                (result) => {
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
        const { error, isLoaded, dataSources, zTreeObj, currentNode, plumb } = this.state;
        const addNode = this.addNode;
        const nodeClicked = this.nodeClicked;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div>
                    <div className='sub-menu'>
                        <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
                            <Tab className='tab-content' eventKey={1} title="RCG Enable">

                                <div className="main">
                                    <div className="col-1">
                                        <ConnectionsList dataSources={dataSources} zTreeObj={zTreeObj}
                                            currentNode={currentNode} addNode={addNode} plumb={plumb}
                                            nodeClicked={nodeClicked}
                                        />
                                    </div>
                                    <div className="col-2">
                                        <div className="actions-box">
                                            <Button>New</Button>
                                            <Button>Open</Button>
                                            <Button>Close</Button>
                                            <Button>Save</Button>
                                        </div>
                                        <Canvas addNode={addNode} plumb={plumb} nodeClicked={nodeClicked} nodes={this.props.acquireNodes} />
                                    </div>
                                    <div className="col-3">
                                        <PropertyPage node={currentNode} />
                                    </div>
                                </div>

                            </Tab>
                            <Tab eventKey={2} title="Confluent" disabled>
                                Rules Parser content
                                </Tab>
                        </Tabs>
                    </div>
                </div>
            );
        }

    }

}

const mapStateToProps = state => {
    console.log(state);
    return {
        acquireNodes: state.acquireNodes
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onAddNode: node => dispatch({ type: 'ADD_NODE', node: node }),
        onUpdateNodeClassName: node => dispatch({ type: 'UPDATE_NODE_CLASSNAME', node: node })
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Acquire)
