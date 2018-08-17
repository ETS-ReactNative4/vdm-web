import React, { Component } from 'react'

class Monitor extends Component {
    render() {
        console.log(this.props.match)
        return (
            <div>
                <h1>Monitor</h1>
            </div>
        );
    }
}

export default Monitor