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
    }


    ///////////////////
    // Events
    /////////////////
    onJobCreated(job) {
        this.props.addJob(job)
    }

    onJobUpdated(job) {
        this.props.updateCurrentJob(job)
    }


    /////////////////
    // State management
    ///////////////
    setCurrentJob(node) {

        let job = this.props.jobs.jobList.find(j=>j.id === node.id)
        this.clearAcquireCanvas()
        this.props.updateCurrentJob(job)

        // Recreate the job graph if possible
        for (let s of job.sources) {
            console.log(s);
            
        }

        for (let t of job.targets) {
            console.log(t);
            
        }
    }

    clearAcquireCanvas() {
        this.props.clearCanvas();
        this.state.plumb.empty(ACQUIRE_CANVAS)
    }

    // From connections list
    setDraggedNode(node){
        console.log(node)
        this.setState({draggedNode: node})
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

    saveJob(){
        let job = this.props.jobs.currentJob
        this.svcUpdateJob(job, this.onJobUpdated)
    }


    ///////////////////////////
    // API Calls
    //////////
    fetchJobs = () => {
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
            console.log(data.jobList)
            self.props.onInitJobList(data.jobList)
        });

    }

    svcCreateJob(job, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {
                    var resp = xmlhttp.responseText.replace('ID', '"ID"')
                    var json = JSON.parse('{' + resp + '}')
                    console.log(json);
                    job.id = json.ID
                    callback(job)
                } else {
                    console.log('failed');
                }
            }
        }

        let newJob = {
            Job: {
                name: job.name,
                description: job.description,
                type: "Batch",
                layer: "Source-To-Raw",
                sources: [],
                targets: [],
                activeIndicator: "Y"
            }
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

        var rawFilePayload = JSON.stringify({ rawFile: this.props.jobs.currentJob.Target })
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
                    var resp = xmlhttp.responseText.replace('ID', '"ID"')
                    var json = JSON.parse('{' + resp + '}')
                    console.log(json);
                    job.id = json.ID
                    callback(job)
                } else {
                    console.log('failed');
                }
            }
        }

        let jobTemp = {Job:{}}
        jobTemp.Job = job

        var payload = JSON.stringify(jobTemp)
        console.log(payload)

        xmlhttp.open("PUT", config.VDM_META_SERVICE_HOST + '/jobs/' + job.id);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(payload);
    }

    //////////////////////////////

    onAddConnection(connection) {
        // Make sure connections are not duplicated
        for (let c of this.props.acquireCanvas.connections) {
            if (c.source === connection.source) {
                return
            }
        }

        this.props.addConnection(connection)

        // fluff up the job with the connection info
        var job = Object.assign({}, this.props.jobs.currentJob)
        // job.jobId = job.id

        var source = this.props.acquireCanvas.nodes.find(node => node.id.toString() === connection.source)
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
        var target = this.props.acquireCanvas.nodes.find(node => node.id.toString() === connection.target)
        job.targets.push({
            id: target.id,
            description: target.description,
            location: target.path,
            name: source.name,
            delimiter: ':',
            fileFormat: 'Data Source',
            sourceID: source.id,
            status: 'Active'
        })
        // job.targets.push({
        //     id: target.id,
        //     name: source.name
        // })

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

    // handleShow() {
    //     console.log('redirect to explore');
    //     $("#waitdiv").show();
    //     this.setState({ show: true });
    //     $('#modal1').hide();


    //     var result = JSON.parse($('#triurl').val());
    //     console.log(result)



    //     var win = window.open(result.url, '_blank');
    //     var timer = setInterval(function () {
    //         if (win.closed) {
    //             clearInterval(timer);
    //             document.getElementById('explorebtn').click();
    //             console.log('closed');
    //             $("#waitdiv").hide();
    //         }
    //     }, 1000);
    // }

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
                `<tr><td>Path:</td><td><input value='${node.path}'/></td></tr>` +
                `<tr><td>Source ID:</td><td><input value='${node.id}'/></td></tr>` +
                `</table></div><div class="ep"></div>`;
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

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
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

        xmlhttp.open("GET", config.VDM_SERVICE_HOST + '/getConnections');
        xmlhttp.send();

        this.fetchJobs()

        setTimeout(function () {
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
                        let num = n.id.replace(/\D/g,'').substring(0,5);
                        node.id = parseInt(num)
                        node.itemType = n.itemType
                        node.path = n.data.config.path
                        self.addNode(node, plumb, null, isNewNode);
                        return
                    }

                    if (el.className.indexOf('list-item') >= 0) {
                        node.id = parseInt(node.id)
                        self.setCurrentJob(node)
                        return
                    }
                }
            });
        }, 1000)

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

        onUpdateNodeClassName: node => dispatch({ type: 'UPDATE_NODE_CLASSNAME', node: node })
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Acquire)