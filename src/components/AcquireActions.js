import React, { Component } from 'react'
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

        this.handleCloseActiveFlow = this.handleCloseActiveFlow.bind(this);

        this.state = {
            showNewTextInput: false,
            flowNameAccepted: false,
            newFlowName: '',
            activeFlow: {}
        };
    }

    handleNewButtonClicked() {
        this.setState({ showNewTextInput: true });
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
        );
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

    handleCloseActiveFlow(e) {
        this.setState(
            { 
                newFlowName: '',
                activeFlow:{}, 
            }
        );
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
                <h4>{this.state.activeFlow.name}</h4>
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
                                        <a href="#tooltip">Enter a name for the new flow</a>
                                    </OverlayTrigger>
                                </ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.value}
                                    placeholder="Enter text"
                                    onChange={this.handleNewFlowNameChanged}
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

export default AcquireActions;