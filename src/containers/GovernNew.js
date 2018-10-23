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
            },
            tabKey: 1
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

        this.addCdeConnection = this.addCdeConnection.bind(this)

        this.closeCdo = this.closeCdo.bind(this)
        this.clearCdoCanvas = this.clearCdoCanvas.bind(this)
        this.createCdo = this.createCdo.bind(this)
        this.setCurrentCdo = this.setCurrentCdo.bind(this)
        this.updateCurrentCdo = this.updateCurrentCdo.bind(this)
        this.addCdoConnection = this.addCdoConnection.bind(this)

        this.handleTabSelect = this.handleTabSelect.bind(this)

        this.onCdeCreated = this.onCdeCreated.bind(this)
        this.onCdoCreated = this.onCdoCreated.bind(this)

        this.onCdeUpdated = this.onCdeUpdated.bind(this)
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

        var node = {
            left: 300,
            top: 50,
            type: 'conformed-data-element',
            name: el.name,
            id: el.id,
            description: el.description,
            droptarget: CDE_CANVAS
        };

        // Add to metadata service
        // This will get the id
        this.svcCreateConformedDataElement(node, this.onCdeCreated)

        // For now just assgin an id
        // el.id = window.uuid()
    }

    setPreferredDataElement(preferred) {
        var de = this.props.conformedDataElements.currentConformedDataElement
        de.preferredSource = preferred
        this.updateCurrentConformedDataElement()

    }



    ////////////
    // Events
    //////////
    onCdeCreated(cde) {
        // Add to state
        this.props.addConformedDataElement(cde)
        this.clearConformedDataElementCanvas()
        // Add to canvas
        this.addNode(cde, this.state.cdePlumb, null, true);
    }

    onCdeUpdated(cde){
        this.props.updateCurrentConformedDataElement(cde)
        this.setState({
            actionStates: {
                ...this.state.actionStates,
                canClose: true,
                canShowProps: true,
                canSave: false,
                canNew: true
            }
        })
    }

    onCdoCreated(cdo) {
        // Add to state
        this.props.addCdo(cdo)
        this.clearCdoCanvas()
        // Add to canvas
        this.addNode(cdo, this.state.cdoPlumb, null, true);
    }

    ////////////
    // CDE - UI Actions
    //////////////
    updateCurrentConformedDataElement() {
        var self = this
        var cde = this.props.conformedDataElements.currentConformedDataElement
        // Update the sources if any based onthe connections
        let connections = this.props.governNewCanvas.connections.filter(c => c.targetDataId == cde.id)
        cde.sources = []

        for (let c of connections) {
            console.log(c);
            let de = self.props.dataElements.dataElementList.find(d => d.id == c.sourceDataId)
            if (de) {
                cde.sources.push(de)
            }
        }


        console.log(cde)
        
        // TODO: Update meta data
        this.svcUpdateCde(cde, this.onCdeUpdated)
        
    }

    setCurrentConformedDataElement(dataId) {
        let element = this.props.conformedDataElements.conformedDataElementList.find(j => j.id == dataId)
        this.props.updateCurrentConformedDataElement(element)
    }


    /////////
    // CDO - UI Actions
    //////

    createCdo(el) {
        this.setState({
            actionStates: {
                ...this.state.actionStates,
                canClose: true,
                canShowProps: true,
                canSave: false,
                canNew: false
            }
        })

        var node = {
            left: 300,
            top: 50,
            type: 'conformed-data-object',
            name: el.name,
            id: el.id,
            description: el.description,
            droptarget: CDO_CANVAS
        };

        // Add to metadata service
        // This will get the id
        this.svcCreateCdo(node, this.onCdoCreated)

    }

    updateCurrentCdo() {
        var self = this
        var cdo = this.props.conformedDataObjects.currentConformedDataObject
        // Update the sources if any based onthe connections
        let connections = this.props.cdoCanvas.connections.filter(c => c.targetDataId == cdo.id)
        cdo.sources = []

        for (let c of connections) {
            console.log(c);
            let de = self.props.conformedDataElements.conformedDataElementList.find(d => d.id == c.sourceDataId)
            if (de) {
                cdo.sources.push(de)
            }
        }


        console.log(cdo)
        this.props.updateCurrentCdo(cdo)
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

    setCurrentCdo(dataId) {
        let element = this.props.conformedDataObjects.conformedDataObjectList.find(j => j.id == dataId)
        this.props.updateCurrentCdo(element)
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
                    var cdeList = []
                    if (json.conformedDataElementList) {
                        cdeList = json.conformedDataElementList
                    }
                    // Update the state
                    self.props.onInitConformedDataElementList(cdeList)

                    self.setState({
                        isLoaded: true
                    });

                } else {
                    console.log('failed');
                }
            }
        }


        xmlhttp.open("GET", config.VDM_META_SERVICE_HOST + '/conformedDataElements');
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send();
    }

    fetchConformedDataObjects = (config) => {
        var self = this
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    var json = JSON.parse(xmlhttp.responseText)
                    var cdoList = []
                    if (json.conformedDataObjectList) {
                        cdoList = json.conformedDataObjectList
                    }
                    // Update the state
                    self.props.onInitConformedDataObjectList(cdoList)

                    self.setState({
                        isLoaded: true
                    });

                } else {
                    console.log('failed');
                }
            }
        }

        xmlhttp.open("GET", config.VDM_META_SERVICE_HOST + '/conformedDataObjects');
        xmlhttp.send();
    }

    svcCreateConformedDataElement(conformedDataElement, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {
                    var resp = xmlhttp.responseText.replace('ID', '"ID"')
                    var json = JSON.parse('{' + resp + '}')
                    console.log(json);
                    conformedDataElement.id = json.ID
                    callback(conformedDataElement)
                } else {
                    console.log('failed');
                }
            }
        }

        var cde = {
            ConformedDataElement: {
                name: conformedDataElement.name,
                description: conformedDataElement.description
            }
        }
        var payload = JSON.stringify(cde)
        console.log(payload)

        xmlhttp.open("POST", config.VDM_META_SERVICE_HOST + '/conformedDataElements');
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(payload);
    }

    svcUpdateCde(cde, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {
                    var resp = xmlhttp.responseText.replace('ID', '"ID"')
                    var json = JSON.parse('{' + resp + '}')
                    console.log(json);
                    cde.id = json.ID
                    callback(cde)
                } else {
                    console.log('failed');
                }
            }
        }

        var cdeTemp = {
            ConformedDataElement: {
                objectId: cde.id,
                name: cde.name,
                description: cde.description,
                sources: cde.sources,
                preferredSource: cde.preferredSource,
                status: cde.status
            }
        }
        var payload = JSON.stringify(cdeTemp)
        console.log(payload)

        xmlhttp.open("PUT", config.VDM_META_SERVICE_HOST + '/conformedDataObjects');
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(payload);
    }

    svcCreateCdo(cdo, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {
                    var resp = xmlhttp.responseText.replace('ID', '"ID"')
                    var json = JSON.parse('{' + resp + '}')
                    console.log(json);
                    cdo.id = json.ID
                    callback(cdo)
                } else {
                    console.log('failed');
                }
            }
        }

        var cdoTemp = {
            ConformedDataObject: {
                name: cdo.name,
                description: cdo.description
            }
        }
        var payload = JSON.stringify(cdoTemp)
        console.log(payload)

        xmlhttp.open("POST", config.VDM_META_SERVICE_HOST + '/conformedDataObjects');
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(payload);
    }

    ///////////////////////////
    // API calls - END
    ///////////////////////////


    addCdeConnection(connection) {

        // Make sure connections are not duplicated
        for(let c of this.props.governNewCanvas.connections){
            if(c.source == connection.source){
                return
            }
        }

        // At this point we already have a defined connection
        this.props.addConnection(connection)

        // fluff up the CDE with the connection info
        var cde = Object.assign({}, this.props.conformedDataElements.currentConformedDataElement)

        var source = this.props.governNewCanvas.nodes.find(node => node.id === connection.source)
        cde.Source = {
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
        cde.Target = {
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
    }


    addCdoConnection(connection) {

        for(let c of this.props.cdoCanvas.connections){
            if(c.source == connection.source){
                return
            }
        }

        // At this point we already have a defined connection
        this.props.addCdoConnection(connection)

        // fluff up the dataElement with the connection info
        var cdo = Object.assign({}, this.props.conformedDataObjects.currentConformedDataObject)

        var source = this.props.cdoCanvas.nodes.find(node => node.id === connection.source)
        cdo.Source = {
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
        var target = this.props.cdoCanvas.nodes.find(node => node.id === connection.target)
        cdo.Target = {
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
    }


    onAddConnection(connection, canvas) {
        if (canvas === CDE_CANVAS) {
            this.addCdeConnection(connection)
        } else if (canvas === CDO_CANVAS) {
            this.addCdoConnection(connection)
        }
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

    clearCdoCanvas() {
        this.props.clearCdoCanvas();
        this.state.cdoPlumb.empty(CDO_CANVAS)
    }

    closeCdo() {
        this.props.closeCdo();
        this.clearCdoCanvas();

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

    handleTabSelect(key) {
        this.setState({ tabKey: key })
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
            } else if (node.type === 'conformed-data-object') {
                node.itemType = "Conformed Data Object"
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
                    var droptarget = event.target.droptarget
                    if (droptarget == CDE_CANVAS) {
                        let node = window.governNewCanvas.nodes.find(node => node.id === event.target.id)
                        node.left = ui.position.left
                        node.top = ui.position.top
                    } else if (droptarget == CDO_CANVAS) {
                        node = window.cdoCanvas.nodes.find(node => node.id === ui.helper[0].id)
                        node.left = ui.position.left
                        node.top = ui.position.top
                    }
                }
            });

            if (node.droptarget === CDE_CANVAS) {
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
                } else if (node.type === 'conformed-data-element') {
                    plumb.makeTarget(el, {
                        dropOptions: { hoverClass: "dragHover" },
                        anchor: "Continuous",
                        allowLoopback: false
                    });
                }
            } else if (node.droptarget === CDO_CANVAS) {
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
            var d = document.createElement("div");
            var nodeName = node.name;
            if (nodeName.length > 25) { nodeName = nodeName.substring(0, 25) + '...'; }

            d.className = "w";
            d.id = node.id;
            d.dataId = node.dataId;
            d.droptarget = node.droptarget

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
                if (node.droptarget === CDO_CANVAS) {
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
            // e.preventDefault();

            console.log("Source:" + info.connection.sourceId)
            console.log("Target:" + info.connection.targetId)

            let canvas = info.target.droptarget

            // Have to add the data Id since the dataid is not unique between object types
            var connection = {
                source: info.connection.sourceId,
                sourceDataId: info.source.dataId,
                target: info.connection.targetId,
                targetDataId: info.target.dataId,
                type: 'basic'
            }

            window.onAddConnection(connection, canvas)

            // Prepare form for submission
            // window.onUpdateNodeClassName({ id: info.connection.sourceId, className: "source-form" })
            // window.onUpdateNodeClassName({ id: info.connection.targetId, className: "target-form" })
        });

        this.fetchDataElements(config)
        this.fetchConformedDataElements(config)
        this.fetchConformedDataObjects(config)

        console.log($(this.refs))



        return plumb
    }


    componentDidMount() {
        let self = this

        let cdePlumb = this.getPlumbInstance(CDE_CANVAS)
        this.setState({ cdePlumb: cdePlumb });

        let cdoPlumb = this.getPlumbInstance(CDO_CANVAS)
        this.setState({ cdoPlumb: cdoPlumb });

        setTimeout(() => {
            $('.canvas').droppable();

            $('.canvas').on("drop", function (event, ui) {

                // Capture the position of the mouse pointer
                var wrapper = $(this).parent();
                var parentOffset = wrapper.offset();
                var left = event.pageX - parentOffset.left + wrapper.scrollLeft() - this.offsetLeft;
                var top = event.pageY - parentOffset.top + wrapper.scrollTop() - this.offsetTop;
                var el = ui.draggable[0];
                var node = { left: left, top: top, type: 'conformed-data-element', name: el.title, id: el.id, droptarget: el.getAttribute('droptarget') };

                let container = wrapper.prevObject[0].id
                if (el.className.indexOf('conformed-data-element') >= 0) {
                    node.type = 'conformed-data-element'
                    var isNewNode = true;

                    if (container === CDE_CANVAS) {
                        self.clearConformedDataElementCanvas()

                        var cde = self.props.conformedDataElements.conformedDataElementList.find(n=>n.id == node.id)
                        node.description = cde.description
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
                    node.type = 'conformed-data-object'
                    var isNewNode = true;
                    self.clearCdoCanvas()

                    var cdo = self.props.conformedDataObjects.conformedDataObjectList.find(n=>n.id == node.id)
                    node.description = cdo.description
                    self.addNode(node, self.state.cdoPlumb, null, isNewNode);

                    // Update the current conformed data element
                    self.setCurrentCdo(node.dataId)
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
            });
        }, 1000);

    }

    render() {
        const { error, isLoaded, dataSources, tabKey, currentNode, cdePlumb, cdoPlumb, actionStates } = this.state;
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
                        <Tabs defaultActiveKey={tabKey} onSelect={this.handleTabSelect} animation={false} id="noanim-tab-example">
                            <Tab className='tab-content' eventKey={1} title="Conformed Data">
                                <div className='col-lg-4  col-md-4 left-pane'>
                                    <ItemList
                                        icon='columns'
                                        droptarget={CDE_CANVAS}
                                        itemType='data-element'
                                        title='Data Elements'
                                        items={dataElements.dataElementList} />

                                    <ItemList
                                        icon='check-square'
                                        droptarget={CDE_CANVAS}
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
                                        droptarget={CDO_CANVAS}
                                        itemType='conformed-data-element'
                                        title='Conformed Data Elements'
                                        items={conformedDataElements.conformedDataElementList} />

                                    <ItemList
                                        icon='check-square'
                                        droptarget={CDO_CANVAS}
                                        itemType='conformed-data-object'
                                        title='Conformed Data Objects'
                                        items={conformedDataObjects.conformedDataObjectList} />

                                </div>

                                <div className="col-lg-8">
                                    <Actions
                                        element={conformedDataObjects.currentConformedDataObject}
                                        elementType="Conformed Data Element"
                                        actionStates={actionStates}
                                        onCreate={this.createCdo}
                                        onClearCanvas={this.clearCdoCanvas}
                                        onClose={this.closeCdo}
                                        onSave={this.updateCurrentCdo}
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

        refreshCdoCanvas: () => dispatch({ type: 'REFRESH_CDO_CANVAS' }),
        clearCdoCanvas: () => dispatch({ type: 'CLEAR_CDO_CANVAS' }),
        closeCdo: () => dispatch({ type: 'CLEAR_CURRENT_CDO' }),
        updateCurrentCdo: cdo => dispatch({ type: 'UPDATE_CURRENT_CDO', cdo: cdo }),
        addCdo: cdo => dispatch({ type: 'ADD_CDO', cdo: cdo }),
        addCdoConnection: connection => dispatch({ type: 'ADD_CDE_TO_CDO_CONNECTION', connection: connection }),

        onUpdateNodeClassName: node => dispatch({ type: 'UPDATE_NODE_CLASSNAME', node: node })
    };
};


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GovernNew)