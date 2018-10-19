import React, { Component } from 'react'
import { connect } from 'react-redux'
import ItemList from '../components/ItemList'
import Canvas from '../components/Canvas'
import Actions from '../components/Actions'
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

const CDE_CANVAS = "governNewCanvas"
const CDO_CANVAS = "cdoCanvas"

class GovernNew extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            currentNode: null,
            cdePlumb: null,
            cdoPlumb: null,
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
        this.clearConformedDataElementCanvas = this.clearConformedDataElementCanvas.bind(this);
        this.closeConformedDataElement = this.closeConformedDataElement.bind(this)
        this.updateCurrentConformedDataElement = this.updateCurrentConformedDataElement.bind(this)
        this.setCurrentConformedDataElement = this.setCurrentConformedDataElement.bind(this)

        window.onUpdateNodeClassName = this.props.onUpdateNodeClassName;
        window.onAddConnection = this.onAddConnection.bind(this);
        window.onDeleteConnection = this.onDeleteConnection.bind(this);

        this.createConformedDataElement = this.createConformedDataElement.bind(this)
        this.getPlumbInstance = this.getPlumbInstance.bind(this)

    }

    ////////////////////////////
    // Actions
    createConformedDataElement(el) {
        this.setState({
            actionStates: {
                ...this.state.actionStates,
                canClose: true,
                canShowProps: true,
                canSave: false,
                canNew: false
            }
        })

        // Add to metaservice
        // This will get the id

        // For now just assgin an id
        el.id = window.uuid()


        // Add to state
        this.props.addConformedDataElement(el)

        var node = { left: 300, top: 50, type: 'conformed-data-element', name: el.name, id: el.id };
        this.clearConformedDataElementCanvas()
        this.addNode(node, this.state.cdePlumb, null, true);
    }

    setPreferredDataElement(preferred) {
        var de = this.props.conformedDataElements.currentConformedDataElement
        de.preferredSource = preferred
        this.updateCurrentConformedDataElement()

    }

    ////////////
    // UI Actions
    //////////////
    updateCurrentConformedDataElement() {
        var self = this
        var element = this.props.conformedDataElements.currentConformedDataElement
        // Update the sources if any based onthe connections
        let connections = this.props.governNewCanvas.connections.filter(c => c.targetDataId == element.id)
        element.sources = []

        for (let c of connections) {
            console.log(c);
            let de = self.props.dataElements.dataElementList.find(d => d.id == c.sourceDataId)
            if (de) {
                element.sources.push(de)
            }
        }


        console.log(element)
        this.props.updateCurrentConformedDataElement(element)
        this.setState({
            actionStates: {
                ...this.state.actionStates,
                canClose: true,
                canShowProps: true,
                canSave: true,
                canNew: true
            }
        })
    }

    setCurrentConformedDataElement(dataId) {
        let element = this.props.conformedDataElements.conformedDataElementList.find(j => j.id == dataId)
        this.props.updateCurrentConformedDataElement(element)
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
                    self.props.onInitDataElementList(json.dataElementList)

                } else {
                    console.log('failed');
                }
            }
        }

        xmlhttp.open("GET", config.VDM_META_SERVICE_HOST + '/dataElements');
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

        xmlhttp.open("GET", config.VDM_META_SERVICE_HOST + '/conformedDataElements');
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

        xmlhttp.open("GET", config.VDM_META_SERVICE_HOST + '/conformedDataObjects');
        xmlhttp.send();
    }

    svcCreateConformedDataElement(conformedDataElement) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {
                    console.log(xmlhttp.responseText);
                } else {
                    console.log('failed');
                }
            }
        }

        var payload = JSON.stringify(conformedDataElement)
        console.log(payload)

        // TODO: update the war so that this allows origin *. Using LOCAL for now
        xmlhttp.open("POST", config.VDM_META_SERVICE_HOST + '/conformedDataObjects');
        xmlhttp.send(payload);
    }

    ///////////////////////////
    // API calls - END
    ///////////////////////////





    onAddConnection(connection) {
        // At this point we already have a defined connection
        this.props.addConnection(connection)

        // fluff up the dataElement with the connection info
        var dataElement = Object.assign({}, this.props.dataElements.currentJob)

        var source = this.props.governNewCanvas.nodes.find(node => node.id === connection.source)
        dataElement.Source = {
            id: source.id,
            description: source.description,
            location: "/home/user/data",
            name: source.name,
            delimiter: ':',
            fileFormat: 'Data Source',
            sourceID: source.id,
            status: 'Active'
        }

        // Hardcoding some of the parameters for now
        var target = this.props.governNewCanvas.nodes.find(node => node.id === connection.target)
        dataElement.Target = {
            ID: target.id,
            description: target.description,
            location: "/home/user/data",
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

        // this.props.onUpdateCurrentJob(dataElement)

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

    closeConformedDataElement() {
        this.props.closeConformedDataElement();
        this.clearConformedDataElementCanvas();

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

    clearConformedDataElementCanvas() {
        this.props.clearConformedDataElementCanvas();
        this.state.cdePlumb.empty(CDE_CANVAS)
    }

    // Update the current selected node
    nodeClicked = nodeId => {
        var clickedNode = this.props.acquireCanvas.nodes.find(n => n.id === nodeId);
        this.setState({ currentNode: clickedNode });
        console.log(clickedNode);
    }

    // Add the node to the node list and to the canvas
    addNode(node, plumb, nodeClicked, isNewNode) {

        var self = this
        window.governNewCanvas = self.props.governNewCanvas
        window.cdoCanvas = self.props.cdoCanvas

        if (node.type == "data") {
            return false;
        }

        // Init new node properties
        if (isNewNode === true) {
            if (node.id == null || node.id === undefined || node.id == '') {
                node.id = window.uuid()
            }

            // Since the metadata id is not UUID we need to make our own
            // since we need to identify nodes uniquely
            node.dataId = node.id
            node.id = window.uuid()


            if (node.type === 'data-element') {
                node.itemType = "Data Element"
            } else if (node.type === 'conformed-data-element') {
                node.itemType = "Conformed Data Element"
            }

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
                    var dropTarget = event.target.dropTarget
                    if (dropTarget == CDE_CANVAS) {
                        let node = window.governNewCanvas.nodes.find(node => node.id === event.target.id)
                        node.left = ui.position.left
                        node.top = ui.position.top
                    } else if (dropTarget == CDO_CANVAS) {
                        node = window.cdoCanvas.nodes.find(node => node.id === ui.helper[0].id)
                        node.left = ui.position.left
                        node.top = ui.position.top
                    }
                }
            });

            if (node.dropTarget === CDE_CANVAS) {
                if (node.type === 'data-element') {
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
                }

                if (node.type === 'conformed-data-element') {
                    plumb.makeTarget(el, {
                        dropOptions: { hoverClass: "dragHover" },
                        anchor: "Continuous",
                        allowLoopback: false
                    });
                }
            } else if (node.dropTarget === CDO_CANVAS) {
                if (node.type === 'conformed-data-element') {
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
                } else if (node.type === 'conformed-data-object') {
                    plumb.makeTarget(el, {
                        dropOptions: { hoverClass: "dragHover" },
                        anchor: "Continuous",
                        allowLoopback: false
                    });

                }
            }


            return true;
        };

        var newNode = function (self) {
            console.log(self.props.conformedDataElements.currentConformedDataElement)
            var d = document.createElement("div");
            var nodeName = node.name;
            if (nodeName.length > 25) { nodeName = nodeName.substring(0, 25) + '...'; }

            d.className = "w";
            d.id = node.id;
            d.dataId = node.dataId;
            d.dropTarget = node.dropTarget

            var ep = ''
            var preferred = ''
            if (node.type === 'data-element') {
                if (self.props.conformedDataElements.currentConformedDataElement.preferredSource) {
                    node.preferredId = self.props.conformedDataElements.currentConformedDataElement.preferredSource.id
                }
                ep = '<div class="ep"></div>'
                var isPreferred = node.dataId == node.preferredId + "" ? "checked" : ""
                preferred = `<div class="preferred"><label><input type="checkbox" class="preferred-d-e" id="${node.id}" alt="${node.dataId}" name="${node.name}" ${isPreferred}/>Preferred</label></div>`
            } else if (node.type === 'conformed-data-element') {
                if (node.dropTarget === CDO_CANVAS) {
                    ep = '<div class="ep"></div>'
                }
            }


            var header = `<div class='headerdiv ${node.type}'><b>` + node.itemType + '</b>' + preferred + '</div>'

            var detail = `<div class='detaildiv ${node.type}'><table class="detailtable">` +
                `<tr><td>Name:</td><td><input value='${nodeName}'/></td></tr>` +
                `<tr><td>Description:</td><td><input value='${node.description}'/></td></tr>` +
                `<tr><td>Source ID:</td><td><input value='${node.dataId}'/></td></tr>` +
                `</table></div>`



            d.innerHTML = header + detail + ep


            d.style.left = node.left + "px";
            d.style.top = node.top + "px";
            plumb.getContainer().appendChild(d);
            return initNode(d);
        };



        // Create the node
        if (newNode(self) === true) {
            // Add the new node only if it does not already exist
            if (isNewNode === true) {
                var containerId = plumb.getContainer().id
                if (containerId === CDE_CANVAS) {
                    this.props.onAddDataElementNode(node)
                } else if (containerId === CDO_CANVAS) {
                    this.props.onAddCdeNode(node)
                }

            }

        }

        $(".w").on('click', function (e) {
            console.log('clicked ' + e.currentTarget.id)


            // nodeClicked(e.currentTarget.id);
            // e.preventDefault();
        });

        $('.preferred input[type=checkbox]').change(function (e) {
            var elementId = e.currentTarget.id
            var isPreferred = e.currentTarget.checked
            var preferred = {
                id: e.currentTarget.alt,
                name: e.currentTarget.name
            }
            // Update the state
            // Uncheck the other sources
            $('.preferred-d-e').each(function (index, obj) {
                if (this.id != elementId) {
                    this.checked = false
                }
            });

            if (isPreferred) {
                self.setPreferredDataElement(preferred)
            } else {
                self.setPreferredDataElement({ id: 0 })
            }
        });

    }

    getPlumbInstance(container) {
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
            Container: container,
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

            // Have to add the data Id since the dataid is not unique between object types
            var connection = {
                source: info.connection.sourceId,
                sourceDataId: info.source.dataId,
                target: info.connection.targetId,
                targetDataId: info.target.dataId,
                type: 'basic'
            }

            window.onAddConnection(connection)

            // Prepare form for submission
            // window.onUpdateNodeClassName({ id: info.connection.sourceId, className: "source-form" })
            // window.onUpdateNodeClassName({ id: info.connection.targetId, className: "target-form" })
        });

        this.fetchDataElements(config)
        this.fetchConformedDataElements(config)
        this.fetchConformedDataObjects(config)

        $(document).ready(function () {
            $('#' + container).droppable({
                drop: function (event, ui) {

                    // Capture the position of the mouse pointer
                    var wrapper = $(this).parent();
                    var parentOffset = wrapper.offset();
                    var left = event.pageX - parentOffset.left + wrapper.scrollLeft() - this.offsetLeft;
                    var top = event.pageY - parentOffset.top + wrapper.scrollTop() - this.offsetTop;
                    var el = ui.draggable[0];
                    var node = { left: left, top: top, type: 'conformed-data-element', name: el.title, id: el.id, dropTarget: el.getAttribute('dropTarget') };


                    if (el.className.indexOf('conformed-data-element') >= 0) {
                        node.type = 'conformed-data-element'
                        var isNewNode = true;

                        if (container === CDE_CANVAS) {
                            self.clearConformedDataElementCanvas()
                            self.addNode(node, self.state.cdePlumb, null, isNewNode);

                            // Update the current conformed data element
                            self.setCurrentConformedDataElement(node.dataId)
                            return
                        }

                        if (container === CDO_CANVAS) {
                            node.type = 'conformed-data-element'
                            var isNewNode = true;
                            self.addNode(node, self.state.cdoPlumb, null, isNewNode);
                            return
                        }

                    }

                    if (el.className.indexOf('conformed-data-object') >= 0) {

                        return
                    }

                    if (el.className.indexOf('data-element') >= 0) {
                        if (self.props.conformedDataElements.currentConformedDataElement.preferredSource) {
                            node.preferredId = self.props.conformedDataElements.currentConformedDataElement.preferredSource.id
                        }

                        node.type = 'data-element'
                        var isNewNode = true;
                        self.addNode(node, self.state.cdePlumb, null, isNewNode);
                        return
                    }



                }
            });
        });

        return plumb
    }


    componentDidMount() {
        let self = this

        let cdePlumb = this.getPlumbInstance(CDE_CANVAS)
        this.setState({ cdePlumb: cdePlumb });

        let cdoPlumb = this.getPlumbInstance(CDO_CANVAS)
        this.setState({ cdoPlumb: cdoPlumb });

    }

    render() {
        const { error, isLoaded, dataSources, zTreeObj, currentNode, cdePlumb, cdoPlumb, actionStates } = this.state;
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
                            <Tab className='tab-content' eventKey={1} title="Conformed Data">
                                <div className='col-lg-4  col-md-4 left-pane'>
                                    <ItemList
                                        icon='columns'
                                        dropTarget={CDE_CANVAS}
                                        itemType='data-element'
                                        title='Data Elements'
                                        items={dataElements.dataElementList} />

                                    <ItemList
                                        icon='check-square'
                                        dropTarget={CDE_CANVAS}
                                        itemType='conformed-data-element'
                                        title='Conformed Data Elements'
                                        items={conformedDataElements.conformedDataElementList} />

                                </div>

                                <div className="col-lg-8">
                                    <Actions
                                        element={conformedDataElements.currentConformedDataElement}
                                        elementType="Conformed Data Element"
                                        actionStates={actionStates}
                                        onCreate={this.createConformedDataElement}
                                        onClearCanvas={this.clearConformedDataElementCanvas}
                                        onClose={this.closeConformedDataElement}
                                        onSave={this.updateCurrentConformedDataElement}
                                    ></Actions>
                                    <Canvas
                                        id={CDE_CANVAS}
                                        addNode={addNode}
                                        plumb={cdePlumb}
                                        nodeClicked={nodeClicked}
                                        nodes={this.props.governNewCanvas}
                                        currentNode={currentNode} />
                                </div>

                            </Tab>

                            <Tab className='tab-content' eventKey={2} title="Conformed Object">
                                <div className='col-lg-4  col-md-4 left-pane'>
                                    <ItemList
                                        icon='columns'
                                        dropTarget={CDO_CANVAS}
                                        itemType='conformed-data-element'
                                        title='Conformed Data Elements'
                                        items={conformedDataElements.conformedDataElementList} />

                                    <ItemList
                                        icon='check-square'
                                        dropTarget={CDO_CANVAS}
                                        itemType='conformed-data-object'
                                        title='Conformed Data Objects'
                                        items={conformedDataObjects.conformedDataObjectList} />

                                </div>

                                <div className="col-lg-8">
                                    <Actions
                                        element={conformedDataObjects.currentConformedDataObject}
                                        elementType="Conformed Data Element"
                                        actionStates={actionStates}
                                        onCreate={this.createConformedDataObject}
                                        onClearCanvas={this.clearConformedDataObjectCanvas}
                                        onClose={this.closeConformedDataObject}
                                        onSave={this.updateCurrentConformedDataObject}
                                    ></Actions>
                                    <Canvas
                                        id={CDO_CANVAS}
                                        addNode={addNode}
                                        plumb={cdoPlumb}
                                        nodeClicked={nodeClicked}
                                        nodes={this.props.cdoCanvas}
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
        governNewCanvas: state.governNewCanvas,
        cdoCanvas: state.cdoCanvas,
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
        onAddDataElementNode: node => dispatch({ type: 'ADD_DATA_ELEMENT_NODE', node: node }),
        addConnection: connection => dispatch({ type: 'ADD_DE_TO_CDE_CONNECTION', connection: connection }),
        addConformedDataElement: conformedDataElement => dispatch({ type: 'ADD_CONFORMED_DATA_ELEMENT', conformedDataElement: conformedDataElement }),
        updateCurrentConformedDataElement: conformedDataElement => dispatch({ type: 'UPDATE_CURRENT_CONFORMED_DATA_ELEMENT', conformedDataElement: conformedDataElement }),
        // setPreferredDataElement: preferred => dispatch({ type: 'SET_PREFERRED_D_E', preferred: preferred }),
        closeConformedDataElement: () => dispatch({ type: 'CLEAR_CURRENT_CONFORMED_DATA_ELEMENT' }),
        clearConformedDataElementCanvas: () => dispatch({ type: 'CLEAR_GOVERN_CANVAS' }),
        onAddCdeNode: node => dispatch({ type: 'ADD_CDE_NODE', node: node }),
        onUpdateCurrentJob: (dataElement) => dispatch({ type: 'UPDATE_CURRENT_JOB', dataElement: dataElement }),



        onUpdateNodeClassName: node => dispatch({ type: 'UPDATE_NODE_CLASSNAME', node: node })
    };
};


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GovernNew)