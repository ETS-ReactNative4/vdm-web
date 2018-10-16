import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { ButtonGroup, Button, Popover, Tooltip, OverlayTrigger, FormGroup, FormControl, ControlLabel, Label } from 'react-bootstrap';
import $ from 'jquery';
import { Modal } from 'react-bootstrap';

import './Actions.css'

class Actions extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleNewButtonClicked = this.handleNewButtonClicked.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.handleNewElementNameChanged = this.handleNewElementNameChanged.bind(this);
        this.handleDescriptionChanged = this.handleDescriptionChanged.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSave = this.handleSave.bind(this)

        this.state = {
            showNewTextInput: false,
            nameAccepted: false,
            elementName: '',
            description: '',
            activeElement: {},
            isSaving: false
        };

        window.actions = this
    }

    handleSave() {
        this.setState({ isSaving: true });
        this.props.onSave()
    }

    handleNewButtonClicked() {
        this.setState({ showNewTextInput: true, description: '' });
    }

    handleCancel() {
        this.setState({ showNewTextInput: false, nameAccepted: false });
    }

    handleCreate() {
        const { elementName, description } = this.state;

        if(elementName.length == 0){
            return
        }

        this.setState(
            {
                nameAccepted: true,
                activeElement: { name: elementName, description: description },
                showNewTextInput: false
            }
        )

        const element= {name: elementName, description:description}
        
        this.props.onClearCanvas()
        this.props.onCreate(element)
    }

    getValidationState() {
        const length = this.state.elementName.length;
        if (length > 10) return 'success';
        else if (length > 5) return 'warning';
        else if (length == 0) return 'error';
        return null;
    }

    handleNewElementNameChanged(e) {
        this.setState({ elementName: e.target.value });
    }

    handleDescriptionChanged(e) {
        this.setState({ description: e.target.value });
    }

    handleClose(e) {
        this.setState(
            {
                elementName: '',
                description: '',
                activeElement: {},
            }
        );
        this.props.onClose()
    }

    componentDidMount() {
        let newConformedDataElementCreated = this.props.newConformedDataElementCreated;
    }

    render() {
        const elementType = this.props.elementType
        const name = this.props.element.name
        const actionStates = this.props.actionStates
        // const tooltip = <Tooltip id="modal-tooltip">The flow name must not contain special characters</Tooltip>;
        return (
            <div className="actions">
                <ButtonGroup>
                    <Button onClick={this.handleNewButtonClicked}
                        disabled={!actionStates.canNew}
                    >New</Button>
                    <Button
                        disabled={!actionStates.canOpen}
                    >Open</Button>
                    <Button onClick={this.handleClose}
                        disabled={!actionStates.canClose}
                    >Close</Button>
                    <Button onClick={this.handleSave}
                        disabled={!actionStates.canSave}
                    >Save</Button>
                    <Button
                        disabled={!actionStates.canShowProps}
                    >Properties</Button>
                </ButtonGroup>

                <Label className='name-label' bsStyle="primary">{name}</Label>
                <Modal show={this.state.showNewTextInput} onHide={this.handleClose}>
                    <Modal.Header>
                        <Modal.Title>Create New {elementType}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <form>
                            <FormGroup
                                controlId="formBasicText"
                                validationState={this.getValidationState()}
                            >
                                <ControlLabel>
                                    {elementType} Name
                                </ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.value}
                                    placeholder='Enter Name'
                                    onChange={this.handleNewElementNameChanged}
                                />
                                <ControlLabel>Description
                                </ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.description}
                                    placeholder="Enter Description"
                                    onChange={this.handleDescriptionChanged}
                                />
                                <FormControl.Feedback />

                            </FormGroup>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCancel}>Cancel</Button>
                        <Button bsStyle="primary" onClick={this.handleCreate}>OK</Button>
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
)(Actions)