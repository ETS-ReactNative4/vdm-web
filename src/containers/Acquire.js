import React, { Component } from 'react'
import { connect } from 'react-redux'
import ConnectionsList from '../components/ConnectionsList'
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

const jsPlumb = window.jsPlumb;
const ACQUIRE_CANVAS = "canvas"

class Acquire extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            dataSources: [],
            zTreeObj: null,
            currentNode: null,
            draggedNode: null,
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
        this.createNewJob = this.createNewJob.bind(this)
        this.fetchJobs = this.fetchJobs.bind(this)

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        window.onUpdateNodeClassName = this.props.onUpdateNodeClassName;
        window.onAddConnection = this.onAddConnection.bind(this);
        window.onDeleteConnection = this.onDeleteConnection.bind(this);

        this.onJobCreated = this.onJobCreated.bind(this)
        this.onJobUpdated = this.onJobUpdated.bind(this)

        this.setCurrentJob = this.setCurrentJob.bind(this)
        this.clearAcquireCanvas = this.clearAcquireCanvas.bind(this)
        this.setDraggedNode = this.setDraggedNode.bind(this)
        this.saveJob = this.saveJob.bind(this)
        this.findInTree = this.findInTree.bind(this)
        this.initCanvas = this.initCanvas.bind(this)
    }


    ///////////////////
    // Events
    /////////////////
    onJobCreated(job) {
        this.props.addJob(job)
    }

    onJobUpdated(job) {
        this.props.updateCurrentJob(job)
        // this.svcRunJob()
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


    /////////////////
    // State management
    ///////////////
    setCurrentJob(node) {
        let self = this
        let job = this.props.jobs.jobList.find(j => j.id === node.id)
        this.clearAcquireCanvas()
        this.props.updateCurrentJob(job)


        // Recreate the job graph if possible
        // add the target first
        if (job.targets.length > 0) {
            let t = { left: 350, top: node.top, type: 'data-source', name: job.targets[0].name, id: job.targets[0].id, droptarget: ACQUIRE_CANVAS };
            self.addNode(t, self.state.plumb, null, true);
        }


        var top = 50
        for (let s of job.sources) {
            // Find the source in the data tree
            let dataSources = self.state.dataSources
            // let ds = dataSources.find(d => d.name === s.name)
            for(let item of dataSources){
                var ds = this.findInTree(item, s.id);
                if (ds) {
                    console.log(ds)
                    let n = { left: 50, top: top, type: 'data-source', name: ds.name, id: ds.id, droptarget: ACQUIRE_CANVAS };
                    top = top + 150
                    self.addNode(n, self.state.plumb, null, true);
    
                    if (job.targets.length > 0) {
                        // Add a connection
                        var c = {
                            source: n.id,
                            target: job.targets[0].id,
                            type: 'basic'
                        }
    
                        window.onAddConnection(c, ACQUIRE_CANVAS)
                        self.state.plumb.connect(c);
                    }
    
                }
            }
            
        }

        for (let t of job.targets) {
            console.log(t);

        }

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

    clearAcquireCanvas() {
        this.props.clearCanvas();
        this.state.plumb.empty(ACQUIRE_CANVAS)
    }

    // From connections list
    setDraggedNode(node) {
        console.log(node)
        this.setState({ draggedNode: node })
    }


    createNewJob(job) {
        this.setState({
            actionStates: {
                ...this.state.actionStates,
                canClose: true,
                canShowProps: true,
                canSave: false,
                canNew: false
            }
        })

        if (job.name !== "") {
            this.svcCreateJob(job, this.onJobCreated)
        }

    }

    saveJob() {
        let self = this
        let job = this.props.jobs.currentJob
        let targetId = job.targets[0].id
        let connections = this.props.acquireCanvas.connections.filter(c => c.target === targetId.toString())
        job.sources = []

        let dataSources = self.state.dataSources

        for (let c of connections) {
            for(let item of dataSources){
                var ds = this.findInTree(item, c.source);
                if (ds) {
                    job.sources.push({ id: parseInt(ds.id,10), name: ds.name })
                }
            }
        }

        // this.svcRunJob()
        this.svcUpdateJob(job, this.onJobUpdated)
    }

    


    ///////////////////////////
    // API Calls
    //////////

    fetchSources = (callback) => {
        var self = this
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    var json = JSON.parse(xmlhttp.responseText)
                    json = JSON.parse(json)

                    // fake file
                    json[0].children[0].children[0].name = "all_hotels.csv"
                    json[4].children[0].children[0].children[0].name = "all_hotels.csv"

                    self.setState({
                        isLoaded: true,
                        dataSources: json
                    });
                } else {
                    console.log('failed');
                }
            }

            callback()
        }

        // Using local since the id of the server version changes randomly
        xmlhttp.open("GET", config.VDM_SERVICE_HOST + '/getConnections');
        xmlhttp.send();
    }

    fetchJobs = (callback) => {
        var self = this
        fetch(config.VDM_META_SERVICE_HOST + '/jobs', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            method: 'get'
        }).then(function (response) {
            return response.json()
        }).then(function (data) {
            console.log(data)
            if (data.error) {
                return false
            } else {
                self.props.onInitJobList(data.jobList)
            }
            callback()
        });

    }

    svcCreateJob(job, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {
                    // Workaround for wrong case and type
                    // var resp = xmlhttp.responseText.replace('ID', '"ID"')
                    // var json = JSON.parse('{' + resp + '}')
                    // job.id = json.ID
                    var json = JSON.parse(xmlhttp.responseText)
                    job.id = json.id
                    callback(job)
                } else {
                    console.log('failed');
                }
            }
        }

        let newJob = {
            job: {
                name: job.name,
                description: job.description,
                type: "Batch",
                layer: "Source-To-Raw",
                sources: [],
                targets: [],
                activeIndicator: "Y",
            }
        }

        newJob.job.schedule = {
            frequency: "Weekly",
            dayOfWeek: "Fri",
            time: "23:00"
            }

        var payload = JSON.stringify(newJob)
        console.log(payload)

        xmlhttp.open("POST", config.VDM_META_SERVICE_HOST + '/jobs');
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(payload);
    }

    svcRunJob() {
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

        let source = this.props.jobs.currentJob.sources[0]
        let target = this.props.jobs.currentJob.targets[0]
        var data;
        if (source) {
            // Fluff up this source since it is not saved as metadata
            let dataSources = this.state.dataSources
            for(let item of dataSources){
                var ds = this.findInTree(item, source.id);
                if (ds) {
                    data = ds
                }
            }
        } else {
            console.log('No source specified');
            return
        }

        // let rawFile = {
        //     rawFile: {
        //         name: target.name,
        //         description: "Customer file from Acme Company",
        //         location: data.data.config.path,
        //         fileFormat: "Data Source",
        //         delimiter: ":",
        //         status: "Active",
        //         sourceId: parseInt(data.id, 10)
        //     }
        // }

        let rawFile = {
            RawFile: {
                Name: data.name,
                Description: data.description,
                Location: data.data.config.path,
                FileFormat: "Delimited",
                Delimiter: ",",
                Status: "Active",
                SourceId: parseInt(data.id, 10)
            }
        }

        var rawFilePayload = JSON.stringify(rawFile)
        console.log(rawFilePayload)

        // TODO: update the war so that this allows origin *. Using LOCAL for now
        xmlhttp.open("POST", config.VDM_SERVICE_HOST + '/rawfile');
        xmlhttp.send(rawFilePayload);
    }

    svcUpdateJob(job, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {
                    var json = JSON.parse(xmlhttp.responseText)
                    console.log(json);
                    job.id = json.id
                    callback(job)
                } else {
                    console.log('failed');
                }
            }
        }

        let jobTemp = { job: {} }
        jobTemp.job = job

        // Add new require attribute
        jobTemp.job.schedule = {
            frequency: "Weekly",
            dayOfWeek: "Fri",
            time: "23:00"
            }

        var payload = JSON.stringify(jobTemp)
        console.log(payload)

        xmlhttp.open("PUT", config.VDM_META_SERVICE_HOST + '/jobs/' + job.id);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(payload);
    }


    /////////////////
    // Utility
    //////
    findInTree(item, id){
        var self = this
        if(item.id == id){
             return item;
        }else if (item.children != null){
             var i;
             var result = null;
             for(i=0; result == null && i < item.children.length; i++){
                  result = self.findInTree(item.children[i], id);
             }
             return result;
        }
        return null;
   }

    //////////////////////////////

    ////////////////////////////
    // Actions
    ///////////
    removeNode(node) {
        this.props.removeNode(node.id)
        this.props.removeConnection({ source: node.id })

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

    onAddConnection(connection) {
        // Make sure connections are not duplicated
        for (let c of this.props.acquireCanvas.connections) {
            if (c.source === connection.source) {
                return
            }
        }

        connection.source = connection.source.toString()
        connection.target = connection.target.toString()
        this.props.addConnection(connection)

        // fluff up the job with the connection info
        var job = Object.assign({}, this.props.jobs.currentJob)
        // job.jobId = job.id

        var source = this.props.acquireCanvas.nodes.find(node => node.id === connection.source)
        if (source == null) return
        // Limit to one source for now
        job.sources = []
        job.sources.push({
            id: source.id,
            location: source.path,
            name: source.name
        })
        // job.sources.push({
        //     id: source.id,
        //     name: source.name
        // })

        // Hardcoding some of the parameters for now
        var target = this.props.acquireCanvas.nodes.find(node => node.id === connection.target)
        if (target == null) return

        // Limit to one target for now
        job.targets = []
        // job.targets.push({
        //     id: parseInt(target.id, 10),
        //     description: target.description,
        //     location: target.path,
        //     name: source.name,
        //     delimiter: ':',
        //     fileFormat: 'Data Source',
        //     sourceID: source.id,
        //     status: 'Active'
        // })
        job.targets.push({
            id: parseInt(target.id, 10),
            name: source.name
        })

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

        this.props.updateCurrentJob(job)

        console.log(this.props.jobs)
    }

    onDeleteConnection(connection, canvas) {
        if (connection.canvas === ACQUIRE_CANVAS) {
            this.props.removeConnection(connection)
        }

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
        this.setState({ show: true });
        $('#modal1').hide();

        //document.getElementById('explorebtn').click();

        var result = JSON.parse($('#triurl').val());
        console.log(result)
        window.open(result.url, '_blank');

    }
    // Add the node to the node list and to the canvas
    addNode(node, plumb, nodeClicked, isNewNode) {

        var self = this

        if (this.props.jobs.currentJob === undefined || this.props.jobs.currentJob.name === '') {
            window.acquireActions.handleNewButtonClicked()
            return
        }

        if (node.type === "data") {
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
                    var node = window.acquireCanvas.nodes.find(node => node.id.toString() === ui.helper[0].id)
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
            d.dataId = node.dataId;

            if (node.type === 'data-source') {
                node.itemType = 'Data Source'
            }

            var removeBtn = `<button class='remove-btn'>x</button>`
            var ep = '<div class="ep"></div>'
            var header = `<div class='headerdiv ${node.type}'><b>` + node.itemType + '</b>' + removeBtn + '</div>'
            var detail = `<div class='detaildiv'><table class="detailtable">` +
                `<tr><td>Name:</td><td><input value='${nodeName}'/></td></tr>` +
                `<tr><td>Path:</td><td><input value='${node.path}'/></td></tr>` +
                `<tr><td>Source ID:</td><td><input value='${node.id}'/></td></tr>` +
                `</table></div>`

            d.innerHTML = header + detail + ep

            d.style.left = node.left + "px";
            d.style.top = node.top + "px";
            plumb.getContainer().appendChild(d);
            return initNode(d);
        };

        newNode();

        if (isNewNode === true) {
            this.props.onAddNode(node)
        }

        window.acquireCanvas = this.props.acquireCanvas

        $(".w").on('click', function (e) {
            let target = {
                id: e.currentTarget.id,
                canvas: e.currentTarget.droptarget
            }

            if (e.originalEvent.target.className === 'remove-btn') {
                console.log("Removed: " + target)
                self.removeNode(target)
                plumb.remove(e.currentTarget)
            }
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

            let c = {
                canvas: plumb.getContainer().id,
                source: connection.sourceId
            }

            window.onDeleteConnection(c)
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

        this.fetchSources(this.initCanvas)

        this.fetchJobs(this.initCanvas)

        this.setState({
            actionStates: {
                ...this.state.actionStates,
                canClose: self.props.jobs.currentJob.id > 0,
                canShowProps: true,
                canSave: self.props.jobs.currentJob.id > 0,
                canNew: true
            }
        })
    }

    initCanvas(){
        var self = this
        var plumb = self.state.plumb
        $('#canvas').droppable({
            drop: function (event, ui) {
                var wrapper = $(this).parent();
                var parentOffset = wrapper.offset();
                var left = event.pageX - parentOffset.left + wrapper.scrollLeft() - this.offsetLeft;
                var top = event.pageY - parentOffset.top + wrapper.scrollTop() - this.offsetTop;
                var el = ui.draggable[0];
                var id = el.id
                var node = { left: left, top: top, type: '', name: el.innerText, id: id };
                var isNewNode = true;

                if (el.className.indexOf('node_name') >= 0) {
                    let n = self.state.draggedNode
                    node.id = n.id
                    node.itemType = n.itemType
                    node.path = n.data.config.path
                    self.addNode(node, plumb, null, isNewNode);
                    return
                }

                if (el.className.indexOf('list-item') >= 0) {
                    node.id = parseInt(node.id, 10)
                    self.setCurrentJob(node)
                    return
                }
            }
        });

        
    }

    render() {
        const { error, isLoaded, dataSources, zTreeObj, currentNode, plumb, actionStates } = this.state;
        const addNode = this.addNode;
        const nodeClicked = this.nodeClicked;
        const jobs = this.props.jobs

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div className="loader"><br /><img src='images/wait.gif' alt='wait' /><br />Loading...</div>;
        } else {
            return (
                <div>
                    <div className='sub-menu'>
                        <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
                            <Tab className='tab-content' eventKey={1} title="RCG Enable">
                                <div className='col-lg-4  col-md-4 left-pane'>
                                    <ConnectionsList
                                        dataSources={dataSources}
                                        zTreeObj={zTreeObj}
                                        setDraggedNode={this.setDraggedNode}
                                        addNode={addNode}
                                        plumb={plumb}
                                        nodeClicked={nodeClicked}
                                    />
                                    <ItemList
                                        icon='play-circle'
                                        droptarget='canvas'
                                        itemType='job'
                                        title='Data Acquisition Flows'
                                        items={jobs.jobList} />
                                </div>

                                <div className="col-lg-8">
                                    <AcquireActions
                                        actionStates={actionStates}
                                        onCreateNewJob={this.createNewJob}
                                        onClearCanvas={this.clearCanvas}
                                        onCloseJob={this.closeJob}
                                        onRunJob={this.saveJob}
                                    ></AcquireActions>
                                    <Canvas
                                        id='canvas'
                                        addNode={addNode}
                                        plumb={plumb}
                                        nodeClicked={nodeClicked}
                                        nodes={this.props.acquireCanvas}
                                        currentNode={currentNode} />
                                </div>

                            </Tab>

                        </Tabs>
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

                </div>
            );
        }

    }

}

const mapStateToProps = state => {
    console.log(state);
    return {
        acquireCanvas: state.acquireCanvas,
        jobs: state.jobs
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onAddNode: node => dispatch({ type: 'ADD_NODE', node: node }),
        addConnection: connection => dispatch({ type: 'ADD_CONNECTION', connection: connection }),
        removeConnection: connection => dispatch({ type: 'REMOVE_CONNECTION', connection: connection }),
        onInitJobList: jobList => dispatch({ type: 'INIT_JOB_LIST', jobList: jobList }),
        addJob: job => dispatch({ type: 'ADD_JOB', job: job }),
        updateCurrentJob: (job) => dispatch({ type: 'UPDATE_CURRENT_JOB', job: job }),
        closeCurrentJob: () => dispatch({ type: 'CLEAR_CURRENT_JOB' }),
        clearCanvas: () => dispatch({ type: 'CLEAR_CANVAS' }),

        // Remove Node
        // Remove nodes
        removeNode: id => dispatch({ type: 'REMOVE_NODE', id: id }),

        onUpdateNodeClassName: node => dispatch({ type: 'UPDATE_NODE_CLASSNAME', node: node })
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Acquire)