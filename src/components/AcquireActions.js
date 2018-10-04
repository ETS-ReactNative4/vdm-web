import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Popover, Tooltip, OverlayTrigger, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import $ from 'jquery';
import { Modal } from 'react-bootstrap';

import './AcquireActions.css'

class AcquireActions extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleNewButtonClicked = this.handleNewButtonClicked.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleAcceptNewFlowName = this.handleAcceptNewFlowName.bind(this);
        this.handleNewFlowNameChanged = this.handleNewFlowNameChanged.bind(this);
        this.handleDescriptionChanged = this.handleDescriptionChanged.bind(this);
        this.handleCloseActiveFlow = this.handleCloseActiveFlow.bind(this);
        this.state = {
            showNewTextInput: false,
            flowNameAccepted: false,
            newFlowName: '',
            description:'',
            activeFlow: {}
        };
    }

    handleNewButtonClicked() {
        this.setState({ showNewTextInput: true, description:'' });
    }

    handleClose() {
        this.setState({ showNewTextInput: false, flowNameAccepted: false });
    }

    handleAcceptNewFlowName() {
        var flowName = this.state.newFlowName;
        this.setState(
            {
                flowNameAccepted: true,
                activeFlow: { name: flowName },
                showNewTextInput: false
            }
        )

        var nextJobId = window.uuid();
        this.props.onNewJobCreated({jobId:nextJobId, name:flowName, description: this.state.description})
        this.props.onClearCanvas();
    }

    getValidationState() {
        const length = this.state.newFlowName.length;
        if (length > 10) return 'success';
        else if (length > 5) return 'warning';
        else if (length > 0) return 'error';
        return null;
    }

    handleNewFlowNameChanged(e) {
        this.setState({ newFlowName: e.target.value });
    }

    handleDescriptionChanged(e){
        this.setState({ description: e.target.value });
    }

    handleCloseActiveFlow(e) {
        this.setState(
            { 
                newFlowName: '',
                description: '',
                activeFlow:{}, 
            }
        );
        this.props.onClearCurrentJob()
    }

    componentDidMount(){
        let newJobCreated = this.props.newJobCreated;
    }

    render() {
        const popover = (
            <Popover id="modal-popover" title="popover">
                very popover. such engagement
            </Popover>
        );
        const tooltip = <Tooltip id="modal-tooltip">The flow name must not contain special characters</Tooltip>;
        return (
            <div className="acquire-actions">
                <Button onClick={this.handleNewButtonClicked}>New</Button>
                <Button>Open</Button>
                <Button onClick={this.handleCloseActiveFlow}>Close</Button>
                <Button>Properties</Button>
                <Modal show={this.state.showNewTextInput} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create a New Flow</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <form>
                            <FormGroup
                                controlId="formBasicText"
                                validationState={this.getValidationState()}
                            >
                                <ControlLabel>
                                    <OverlayTrigger overlay={tooltip}>
                                        <a href="#tooltip">Job Name</a>
                                    </OverlayTrigger>
                                </ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.value}
                                    placeholder="Enter job name"
                                    onChange={this.handleNewFlowNameChanged}
                                />
                                <ControlLabel>Description
                                </ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.description}
                                    placeholder="Enter Description for this job" 
                                    onChange={this.handleDescriptionChanged}
                                />
                                <FormControl.Feedback />

                            </FormGroup>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleClose}>Cancel</Button>
                        <Button bsStyle="primary" onClick={this.handleAcceptNewFlowName}>OK</Button>
                    </Modal.Footer>
                </Modal>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        jobs: state.jobs
    }
}

const mapDispatchToProps = dispatch => {
    return {
        
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AcquireActions)