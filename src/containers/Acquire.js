import React, { Component } from 'react'
import { connect } from 'react-redux'
import ConnectionsList from '../components/ConnectionsList'
import DatasetList from '../components/DatasetList'
import Canvas1 from '../components/Canvas1'
import PropertyPage from '../components/PropertyPage'
import AcquireActions from '../components/AcquireActions'
import "./Acquire.css";
// eslint-disable-next-line
import { Button, Tabs, Tab } from 'react-bootstrap';
import $ from 'jquery';
import { Modal } from 'react-bootstrap';
import * as config from '../config';


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
            acquiredDatasets: [],
            zTreeObj: null,
            currentNode: null,
            plumb: null
        };

        this.addNode = this.addNode.bind(this);
        this.nodeClicked = this.nodeClicked.bind(this);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        window.onUpdateNodeClassName = this.props.onUpdateNodeClassName;
    }

    // Update the current selected node
    nodeClicked = nodeId => {
        var clickedNode = this.props.acquireNodes.find(n => n.id === nodeId);
        this.setState({ currentNode: clickedNode });
        console.log(clickedNode);
    }
    
      handleClose() {
      $('#modal1').hide();
    this.setState({ show: false });
  }

  handleShow() {
    console.log('redirect to explore');
    $("#waitdiv").show();
    this.setState({ show: true });
 	$('#modal1').hide();
 	
 	
 	var result = JSON.parse($('#triurl').val());
 	console.log(result)
 	
 	
 	
 	var win = window.open(result.url,'_blank');
	var timer = setInterval(function() { 
	    if(win.closed) {
	        clearInterval(timer);
	        document.getElementById('explorebtn').click();
	        console.log('closed');
	         $("#waitdiv").hide();
	    }
	}, 1000);

 	
 	
  }

    handleClose() {
        $('#modal1').hide();
        this.setState({ show: false });
    }

    handleShow() {
        console.log('redirect to explore');
        this.setState({ show: true });
        $('#modal1').hide();

        //document.getElementById('explorebtn').click();

        var result = JSON.parse($('#triurl').val());
        console.log(result)
        window.open(result.url, '_blank');

    }
    // Add the node to the node list and to the canvas
    addNode(node, nodeKey, relX, relY, plumb, nodeClicked, isNewNode) {

       	if(node.type == "data"){
    		return false;
    	}
    	
        var vOffset = 0;
        var hOffset = -300;

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
//                    node.relX = ui.position.left + hOffset
//                    node.relY = ui.position.top + vOffset
                }
            });

            plumb.makeSource(el, {
                filter: ".ep",
                anchor: "Continuous",
                //connectorStyle: { stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
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
            var d = document.createElement("div");
            // var id = jsPlumbUtil.uuid();
            var nodeName = node.name;
            if (nodeName.length > 25) { nodeName = nodeName.substring(0, 25) + '...'; }
            d.className = "w";
            d.idloadin = node.id;
            d.innerHTML = `<div class='headerdiv'><b>` + node.itemType + `</b></div><div class='detaildiv'><table class="detailtable">` +
            		`<tr><td>Name:</td><td><input value='${nodeName}'/></td></tr>` + 
            		`<tr><td>Description:</td><td><input value='${node.description}'/></td></tr>` + 
            		`<tr><td>Source ID:</td><td><input value='${node.id}'/></td></tr>` + 
            		`</table></div><div class=\"ep\"></div>`;
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
    	
    	let self = this

        // Create an instance of jsplumb for this canvas
        let plumb = jsPlumb.getInstance({
            Endpoint: ["Dot", { radius: 2 }],
            HoverPaintStyle: { stroke: "#1e8151", strokeWidth: 2 },
            ConnectionOverlays: [
                ["Arrow", {
                	location : 1,
        			id : "arrow",
        			width : 12,
        			length : 8,
        			foldback : 0.8
                }],
               // ["Label", { label: "", id: "label", cssClass: "aLabel" }]
            ],
            Container: "canvas1",
        	Connector : [ "Bezier" ]
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
        	
        	
        	var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        	console.log(info)
        	console.log(info.source.idloadin)
        	
        	var obj = treeObj.getNodeByParam('id', info.source.idloadin)
        	
        	//obj.Source_ID="xxxxxxxxxxxxxxxxxx"
        	
        	self.setState({ currentNode: obj });
        	
//        	$("#root_Name").val(obj.text)
//        	$("#root_Location").val(obj.data.config.path + "/")
//        	$("#root_SourceID").val(info.source.id)
    
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
//        fetch(config.VDM_SERVICE_HOST + '/vdm/getConnections')
//            .then(res => res.json())
//            .then(
//                (result) => {
//                    this.setState({
//                        isLoaded: true,
//                        dataSources: JSON.parse(result)
//                    });
//                },
//                // Note: it's important to handle errors here
//                // instead of a catch() block so that we don't swallow
//                // exceptions from actual bugs in components.
//                (error) => {
//                    this.setState({
//                        isLoaded: true,
//                        error
//                    });
//                }
//            )
        
        
        var xmlhttp = new XMLHttpRequest();
      
        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState === 4) {
          
             //var response = JSON.parse(xmlhttp.responseText);
              if (xmlhttp.status === 200 || xmlhttp.status === 201) {
              
            	  var json = JSON.parse(xmlhttp.responseText)
                 console.log(json);
                 
                 self.setState({
                     isLoaded: true,
                     dataSources: json
                 });
                
        	
              } else {
                 console.log('failed');
              }
          }
        }

        xmlhttp.open("GET", config.VDM_SERVICE_HOST + '/vdm/getConnections');
        xmlhttp.send();
     /*           
        getAllData()
            .then(([dataSources, acquiredDatasets]) => {
                this.setState({
                    isLoaded: true,
                    dataSources: dataSources,
                    acquiredDatasets: acquiredDatasets
                });
            })*/
            

    }

    render() {
        const { error, isLoaded, dataSources, zTreeObj, currentNode, plumb, acquiredDatasets } = this.state;
        const addNode = this.addNode;
        const nodeClicked = this.nodeClicked;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div className="loader"><br/><img src='images/wait.gif'/><br/>Loading...</div>;
        } else {
            return (
                <div>
                    <div className='sub-menu'>
                        <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
                            <Tab className='tab-content' eventKey={1} title="RCG Enable">
                                <div className='col-lg-2  col-md-3 left-pane'>
                                    <ConnectionsList dataSources={dataSources} zTreeObj={zTreeObj}
                                        currentNode={currentNode} addNode={addNode} plumb={plumb}
                                        nodeClicked={nodeClicked}
                                    />
                                </div>
                                <div className="static-modal" id='modal1' style={{ display: 'none' }}>
                                    <Modal.Dialog>
                                        <Modal.Header>
                                            <Modal.Title>Acquire Successful</Modal.Title>
                                        </Modal.Header>

                                        <Modal.Body>Would you like to wrangle this file now ?<input type='hidden' id="triurl" /></Modal.Body>

                                        <Modal.Footer>
                                            <Button onClick={this.handleClose}>No</Button>
                                            <Button bsStyle="primary" onClick={this.handleShow}>Yes</Button>
                                        </Modal.Footer>
                                    </Modal.Dialog>
                                </div>
                                <div className="col-2">
                                    <AcquireActions></AcquireActions>
                                    <Canvas1 addNode={addNode} plumb={plumb} nodeClicked={nodeClicked} nodes={this.props.acquireNodes} currentNode={currentNode} />
                                </div>
                                <div className='col-lg-2  col-md-3'>
                                    <PropertyPage node={currentNode} />
                                </div>
                              
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

/*const getDatasources = () => {
    return fetch('http://localhost:4000/api/datasources')
        .then(res => res.json())
        .then((result) => JSON.parse(result))
};

const getAcquiredDatasets = () => {
    return fetch('http://localhost:4000/api/acquiredDatasets', {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(res => res.json())
};*/

/*const getAllData = () => {
    return Promise.all([getDatasources(), getAcquiredDatasets()])
};*/

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Acquire)