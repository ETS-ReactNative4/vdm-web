import React, { Component } from 'react'
import { connect } from 'react-redux'
import ItemList from '../components/ItemList'
import Canvas from '../components/Canvas'
import AcquireActions from '../components/AcquireActions'
import "./Acquire.css";
// eslint-disable-next-line
import { Button, Tabs, Tab } from 'react-bootstrap';
import $ from 'jquery';
import { Modal } from 'react-bootstrap';
import * as config from '../config';


require('jqueryui');
require('jsplumb');

const log = (type) => console.log.bind(console, type);

const jsPlumb = window.jsPlumb;

class GovernNew extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            dataSources: [],
            acquiredDatasets: [],
            zTreeObj: null,
            currentNode: null,
            plumb: null,
            actionStates: {
                canNew: true,
                canSave: false,
                canOpen: false,
                canShowProps: false,
                canClose: false
            }
        };

        this.addNode = this.addNode.bind(this);
        this.nodeClicked = this.nodeClicked.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
        this.closeJob = this.closeJob.bind(this)
        this.onRunJob = this.onRunJob.bind(this)
        this.createNewJob = this.createNewJob.bind(this)

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        window.onUpdateNodeClassName = this.props.onUpdateNodeClassName;
        window.onAddConnection = this.onAddConnection.bind(this);
        window.onDeleteConnection = this.onDeleteConnection.bind(this);

        // API calls
        this.fetchDataElements = this.fetchDataElements.bind(this)
    }

    
    ///////////////////////////
    // API calls
    ///////////////////////////
    fetchDataElements = (config) => {
        var self = this
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    var json = JSON.parse(xmlhttp.responseText)
                    console.log(json);

                    self.setState({
                        isLoaded: true
                    });

                    // Update the state
                    self.props.onInitDataElementList(json.DataElementList)

                } else {
                    console.log('failed');
                }
            }
        }

        xmlhttp.open("GET", config.VDM_SERVICE_HOST_LOCAL + '/dataElements');
        xmlhttp.send();
    }

    fetchConformedDataElements = (config) => {
        var self = this
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    var json = JSON.parse(xmlhttp.responseText)
                    console.log(json);

                    self.setState({
                        isLoaded: true
                    });

                    // Update the state
                    self.props.onInitConformedDataElementList(json.ConformedDataElementList)

                } else {
                    console.log('failed');
                }
            }
        }

        xmlhttp.open("GET", config.VDM_SERVICE_HOST_LOCAL + '/conformedDataElements');
        xmlhttp.send();
    }

    fetchConformedDataObjects = (config) => {
        var self = this
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    var json = JSON.parse(xmlhttp.responseText)
                    console.log(json);

                    self.setState({
                        isLoaded: true
                    });

                    // Update the state
                    self.props.onInitConformedDataObjectList(json.ConformedDataObjectList)

                } else {
                    console.log('failed');
                }
            }
        }

        xmlhttp.open("GET", config.VDM_SERVICE_HOST_LOCAL + '/conformedDataObjects');
        xmlhttp.send();
    }

    ///////////////////////////
    // API calls - END
    ///////////////////////////

    createNewJob(dataElement) {
        this.setState({
            actionStates: {
                ...this.state.actionStates,
                canClose: true,
                canShowProps: true,
                canSave: false,
                canNew: false
            }
        })

        this.props.addJob(dataElement)
        // this.svcCreateJob(dataElement)
    }

    onRunJob() {
        // Call the rawfile api method
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {

                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    console.log(xmlhttp.responseText);

                    $('#triurl').val(xmlhttp.responseText);
                    $('#modal1').show()

                } else {
                    console.log('failed');
                }
            }
        }

        var rawFilePayload = JSON.stringify({ rawFile: this.props.dataElements.currentJob.Target })
        console.log(rawFilePayload)

        // TODO: update the war so that this allows origin *. Using LOCAL for now
        xmlhttp.open("POST", config.VDM_SERVICE_HOST_LOCAL + '/vdm/rawfile');
        xmlhttp.send(rawFilePayload);
    }

    onAddConnection(connection) {
        // At this point we already have a defined connection
        console.log(this.props.acquireCanvas)
        this.props.addConnection(connection)

        // fluff up the dataElement with the connection info
        var dataElement = Object.assign({}, this.props.dataElements.currentJob)

        var source = this.props.acquireCanvas.nodes.find(node => node.id === connection.source)
        dataElement.Source = {
            id: source.id,
            location: source.data.config.path,
            name: source.name
        }

        // Hardcoding some of the parameters for now
        var target = this.props.acquireCanvas.nodes.find(node => node.id === connection.target)
        dataElement.Target = {
            ID: target.id,
            description: target.description,
            location: source.data.config.path,
            name: source.name,
            delimiter: ':',
            fileFormat: 'Data Source',
            sourceID: source.id,
            status: 'Active'
        }

        // Time to enable the save button
        this.setState({
            actionStates: {
                ...this.state.actionStates,
                canClose: true,
                canShowProps: true,
                canSave: true,
                canNew: false
            }
        })

        this.props.onUpdateCurrentJob(dataElement)

        console.log(this.props.dataElements)
    }

    onDeleteConnection() {
        this.setState({
            actionStates: {
                ...this.state.actionStates,
                canClose: true,
                canShowProps: true,
                canSave: false,
                canNew: false
            }
        })
    }

    closeJob() {
        this.props.closeCurrentJob();
        this.clearCanvas();

        this.setState({
            actionStates: {
                ...this.state.actionStates,
                canClose: false,
                canShowProps: false,
                canSave: false,
                canNew: true
            }
        })
    }

    clearCanvas() {
        this.props.clearCanvas();
        this.state.plumb.empty('canvas')
    }

    // Update the current selected node
    nodeClicked = nodeId => {
        var clickedNode = this.props.acquireCanvas.nodes.find(n => n.id === nodeId);
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



        var win = window.open(result.url, '_blank');
        var timer = setInterval(function () {
            if (win.closed) {
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
    addNode(node, plumb, nodeClicked, isNewNode) {

        if (this.props.dataElements.currentJob == undefined || this.props.dataElements.currentJob.name === '') {
            window.acquireActions.handleNewButtonClicked()
            return
        }

        if (node.type == "data") {
            return false;
        }

        var initNode = function (el) {

            // initialise draggable elements.
            plumb.draggable(el, {
                containment: true,
                grid: [50, 50]
            });


            // Update the node position
            $(el).draggable({
                cancel: "div.ep",
                stop: function (event, ui) {
                    var nodeId = ui.helper[0].nodeId
                    console.log(nodeId)
                    console.log(ui.position)
                    var node = window.acquireCanvas.nodes.find(node => node.id === nodeId)
                    node.left = ui.position.left
                    node.top = ui.position.top
                }
            });

            plumb.makeSource(el, {
                filter: ".ep",
                anchor: "Continuous",
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

        var newNode = function () {
            var d = document.createElement("div");
            var nodeName = node.name;
            if (nodeName.length > 25) { nodeName = nodeName.substring(0, 25) + '...'; }
            d.className = "w";
            d.id = node.id;
            d.nodeId = node.id;
            d.innerHTML = `<div class='headerdiv'><b>` + node.itemType + `</b></div><div class='detaildiv'><table class="detailtable">` +
                `<tr><td>Name:</td><td><input value='${nodeName}'/></td></tr>` +
                `<tr><td>Description:</td><td><input value='${node.description}'/></td></tr>` +
                `<tr><td>Source ID:</td><td><input value='${node.id}'/></td></tr>` +
                `</table></div><div class=\"ep\"></div>`;
            d.style.left = node.left + "px";
            d.style.top = node.top + "px";
            plumb.getContainer().appendChild(d);
            initNode(d);
        };

        newNode();

        if (isNewNode === true) {
            this.props.onAddNode(node)
        }

        window.acquireCanvas = this.props.acquireCanvas

        $(".w").on('click', function (e) {
            console.log('clicked ' + e.currentTarget.id)
            // nodeClicked(e.currentTarget.id);
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


        plumb.registerConnectionType("basic", { anchor: "Continuous", connector: "StateMachine" });

        // bind a click listener to each connection; the connection is deleted. you could of course
        // just do this: instance.bind("click", instance.deleteConnection), but I wanted to make it clear what was
        // happening.
        plumb.bind("click", function (connection) {
            plumb.deleteConnection(connection);
            window.onDeleteConnection()
        });

        // bind a connection listener. note that the parameter passed to this function contains more than
        // just the new connection - see the documentation for a full list of what is included in 'info'.
        // this listener sets the connection's internal
        // id as the label overlay's text.
        plumb.bind("connection", function (info, e) {
            console.log(info)
            console.log(info.source.nodeId)
            e.preventDefault();

            console.log("Source:" + info.connection.sourceId)
            console.log("Target:" + info.connection.targetId)

            var connection = {
                source: info.connection.sourceId,
                target: info.connection.targetId,
                type: 'basic'
            }
            window.onAddConnection(connection)

            // Prepare form for submission
            // window.onUpdateNodeClassName({ id: info.connection.sourceId, className: "source-form" })
            // window.onUpdateNodeClassName({ id: info.connection.targetId, className: "target-form" })
        });

        this.setState({ plumb: plumb });    

        this.fetchDataElements(config)
        this.fetchConformedDataElements(config)
        this.fetchConformedDataObjects(config)


        // var xmlhttp = new XMLHttpRequest();

        // xmlhttp.onreadystatechange = function () {
        //     if (xmlhttp.readyState === 4) {
        //         if (xmlhttp.status === 200 || xmlhttp.status === 201) {

        //             var json = JSON.parse(xmlhttp.responseText)
        //             console.log(json);

        //             self.setState({
        //                 isLoaded: true
        //             });

        //             // Update the state
        //             self.props.onInitDataElementList(json.DataElementList)


        //         } else {
        //             console.log('failed');
        //         }
        //     }
        // }

        // xmlhttp.open("GET", config.VDM_SERVICE_HOST_LOCAL + '/dataElements');
        // xmlhttp.send();

    }

    render() {
        const { error, isLoaded, dataSources, zTreeObj, currentNode, plumb, actionStates } = this.state;
        const addNode = this.addNode;
        const nodeClicked = this.nodeClicked;
        const dataElements = this.props.dataElements
        const conformedDataElements = this.props.conformedDataElements
        const conformedDataObjects = this.props.conformedDataObjects


        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div className="loader"><br /><img src='images/wait.gif' /><br />Loading...</div>;
        } else {
            return (
                <div>
                    <div className='sub-menu'>
                        <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
                            <Tab className='tab-content' eventKey={1} title="RCG Enable">
                                <div className='col-lg-4  col-md-4 left-pane'>
                                    <ItemList
                                        icon='columns'
                                        dropTarget='governNewCanvas'
                                        listType='dataElementList'
                                        title='Data Elements'
                                        items={dataElements.dataElementList} />

                                    <ItemList
                                        icon='check-square'
                                        dropTarget='governNewCanvas'
                                        listType='conformedDataElementList'
                                        title='Conformed Data Elements'
                                        items={conformedDataElements.conformedDataElementList} />

                                    <ItemList
                                        icon='archive'
                                        dropTarget='governNewCanvas'
                                        listType='conformedDataObjectList'
                                        title='Conformed Data Objects'
                                        items={conformedDataObjects.conformedDataObjectList} />
                                </div>

                                <div className="col-lg-8">
                                    <AcquireActions
                                        actionStates={actionStates}
                                        onCreateNewJob={this.createNewJob}
                                        onClearCanvas={this.clearCanvas}
                                        onCloseJob={this.closeJob}
                                        onRunJob={this.onRunJob}
                                    ></AcquireActions>
                                    <Canvas
                                        id='canvas'
                                        addNode={addNode}
                                        plumb={plumb}
                                        nodeClicked={nodeClicked}
                                        nodes={this.props.acquireCanvas.nodes}
                                        currentNode={currentNode} />
                                </div>

                            </Tab>

                        </Tabs>
                    </div>
                    <div className="static-modal" id='modal1' style={{ display: 'none' }}>
                        <Modal.Dialog>
                            <Modal.Header>
                                <Modal.Title>GovernNew Successful</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>Would you like to wrangle this file now ?<input type='hidden' id="triurl" /></Modal.Body>

                            <Modal.Footer>
                                <Button onClick={this.handleClose}>No</Button>
                                <Button bsStyle="primary" onClick={this.handleShow}>Yes</Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </div>

                </div>
            );
        }

    }

}

const mapStateToProps = state => {
    console.log(state);
    return {
        acquireCanvas: state.acquireCanvas,
        dataElements: state.dataElements,
        conformedDataElements: state.conformedDataElements,
        conformedDataObjects: state.conformedDataObjects
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onInitDataElementList: dataElementList => dispatch({ type: 'INIT_DATA_ELEMENT_LIST', dataElementList: dataElementList }),
        onInitConformedDataElementList: conformedDataElementList => dispatch({ type: 'INIT_CONFORMED_DATA_ELEMENT_LIST', conformedDataElementList: conformedDataElementList }),
        onInitConformedDataObjectList: conformedDataObjectList => dispatch({ type: 'INIT_CONFORMED_DATA_OBJECT_LIST', conformedDataObjectList: conformedDataObjectList }),
        onAddNode: node => dispatch({ type: 'ADD_NODE', node: node }),
        addConnection: connection => dispatch({ type: 'ADD_CONNECTION', connection: connection }),
        addJob: dataElement => dispatch({ type: 'ADD_JOB', dataElement: dataElement }),
        onUpdateCurrentJob: (dataElement) => dispatch({ type: 'UPDATE_CURRENT_JOB', dataElement: dataElement }),
        closeCurrentJob: () => dispatch({ type: 'CLEAR_CURRENT_JOB' }),
        clearCanvas: () => dispatch({ type: 'CLEAR_CANVAS' }),

        onUpdateNodeClassName: node => dispatch({ type: 'UPDATE_NODE_CLASSNAME', node: node })
    };
};


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GovernNew)