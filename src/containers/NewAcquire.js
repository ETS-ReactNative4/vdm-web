import React, { Component } from 'react'
import { connect } from 'react-redux'
import ConnectionsList from '../components/ConnectionsList'
import DatasetList from '../components/DatasetList'
import NewCanvas from '../components/NewCanvas'
import PropertyPage from '../components/PropertyPage'
import AcquireActions from '../components/AcquireActions'
import "./Acquire.css";
// eslint-disable-next-line
import { Button, Tabs, Tab } from 'react-bootstrap';
import $ from 'jquery';
import { Modal } from 'react-bootstrap';
import * as config from '../config';

require('jsplumb');
const jsPlumb = window.jsPlumb;

class NewAcquire extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            dataSources: [],
            acquiredDatasets: [],
            zTreeObj: null,
            currentNode: null
        };

        this.plumb = null
        this.setPlumb = this.setPlumb.bind(this)
        this.addNode = this.addNode.bind(this)
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

    }

    setPlumb(plumb) {
        this.plumb = plumb;
    }

    addNode(node) {
        var d = document.createElement("div");
        var nodeName = node.name;
        if (nodeName.length > 25) { nodeName = nodeName.substring(0, 25) + '...'; }
        d.className = "w";
        d.idloadin = node.id;
        d.innerHTML = `<div class='headerdiv'><b>` + node.itemType + `</b></div><div class='detaildiv'><table class="detailtable">` +
            `<tr><td>Name:</td><td><input value='${nodeName}'/></td></tr>` +
            `<tr><td>Description:</td><td><input value='${node.description}'/></td></tr>` +
            `<tr><td>Source ID:</td><td><input value='${node.id}'/></td></tr>` +
            `</table></div><div class=\"ep\"></div>`;
        d.style.left = node.left + "px";
        d.style.top = node.top + "px";
        this.plumb.getContainer().appendChild(d);
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

        var result = JSON.parse($('#triurl').val());
        console.log(result)
        window.open(result.url, '_blank');

    }


    componentDidMount() {

        let self = this

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

        xmlhttp.open("GET", config.VDM_SERVICE_HOST + '/vdm/getConnections');
        xmlhttp.send();


    }

    render() {
        const { error, isLoaded, dataSources, zTreeObj, currentNode, acquiredDatasets } = this.state;
        const addNode = this.addNode;
        const setPlumb = this.setPlumb;
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
                                <div className='col-lg-2  col-md-3 left-pane'>
                                    <ConnectionsList dataSources={dataSources} zTreeObj={zTreeObj}
                                        currentNode={currentNode} addNode={addNode}
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
                                    <NewCanvas currentNode={currentNode} setPlumb={setPlumb} addNode={addNode} />
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewAcquire)