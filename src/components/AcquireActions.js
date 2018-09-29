import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap';
import $ from 'jquery';
import { Modal } from 'react-bootstrap';
import TextInputModal from '../components/TextInputModal'

import './AcquireActions.css'

const AcquireActions = () => (
    <div className="acquire-actions">
        <Button>New</Button>
        <Button>Open</Button>
        <Button>Close</Button>
        <Button>Properties</Button>
        <TextInputModal></TextInputModal>
    </div>
    
)

export default AcquireActions;