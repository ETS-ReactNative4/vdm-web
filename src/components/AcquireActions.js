import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ButtonGroup, Button, Tooltip, OverlayTrigger, FormGroup, FormControl, ControlLabel, Label } from 'react-bootstrap';
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
        this.handleSave = this.handleSave.bind(this)

        this.state = {
            showNewTextInput: false,
            flowNameAccepted: false,
            newFlowName: '',
            description: '',
            activeFlow: {},
            isSaving: false
        };

        window.acquireActions = this
    }

    handleSave() {
        this.setState({ isSaving: true });
        this.props.onRunJob()
    }

    handleNewButtonClicked() {
        this.setState({ showNewTextInput: true, description: '' });
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

        // TODO: The job id should be coming from the service
        var nextJobId = window.uuid();
        this.props.onCreateNewJob({ id: nextJobId, jobId: nextJobId, name: flowName, description: this.state.description })
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

    handleDescriptionChanged(e) {
        this.setState({ description: e.target.value });
    }

    handleCloseActiveFlow(e) {
        this.setState(
            {
                newFlowName: '',
                description: '',
                activeFlow: {},
            }
        );
        this.props.onCloseJob()
    }

    componentDidMount() {
        // let newJobCreated = this.props.newJobCreated;
    }

    render() {
        const jobName = this.props.jobs.currentJob.name
        const actionStates = this.props.actionStates
        const tooltip = <Tooltip id="modal-tooltip">The flow name must not contain special characters</Tooltip>;
        return (
            <div className="acquire-actions">
                <ButtonGroup>
                    <Button onClick={this.handleNewButtonClicked}
                        disabled={!actionStates.canNew}
                    >New</Button>
                    <Button
                        disabled={!actionStates.canOpen}
                    >Open</Button>
                    <Button onClick={this.handleCloseActiveFlow}
                        disabled={!actionStates.canClose}
                    >Close</Button>
                    <Button onClick={this.handleSave}
                        disabled={!actionStates.canSave}
                    >Save</Button>
                    <Button
                        disabled={!actionStates.canShowProps}
                    >Properties</Button>
                </ButtonGroup>

                <Label className='name-label' bsStyle="primary">{jobName}</Label>
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