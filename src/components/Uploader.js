import React, { Component } from "react";
import * as config from '../config';
import axios from 'axios'
import {Button, ProgressBar} from 'react-bootstrap';
import './Uploader.css'

class Uploader extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loaded: 0,
            uploadStatus: 'inactive'
        }

        this.handleselectedFile = this.handleselectedFile.bind(this)
        this.handleUpload = this.handleUpload.bind(this)
    }

    handleChooseCli = event => {
        this.setState({
            selectedFile: null,
            loaded: 0,
            uploadStatus: 'active'
        })
    }

    handleDone = event => {
        this.setState({
            selectedFile: null,
            loaded: 0,
            uploadStatus: 'inactive'
        })
        document.getElementById("fileUpload").value = "";
    }

    handleselectedFile = event => {
        this.setState({
            selectedFile: event.target.files[0],
            loaded: 0,
            uploadStatus: 'ready'
        })
    }

    handleUpload = () => {
        let self = this
        if(self.state.selectedFile){
            
            const data = new FormData()
            data.append('file', self.state.selectedFile, self.state.selectedFile.name)
    
            self.setState({uploadStatus: 'started'})
            axios
                .post(config.VDM_UPLOAD_HOST + '/upload', data, {
                    onUploadProgress: ProgressEvent => {
                        let p = (ProgressEvent.loaded / ProgressEvent.total * 100)
                        self.setState({
                            loaded: p,
                        })
    
                        if(p === 100){
                            self.setState({uploadStatus: 'done'})
                        }
                    },
                })
                .then(res => {
                    if (res.statusText === 'OK') {
                        // Initiate parsing
                        console.log("Initiate parsing")
                    }else{
                        console.log(res.statusText)
                    }
                })
        }
        
    }

    render() {
        const {loaded, uploadStatus} = this.state
        return (
            <div className='uploader-container'>
                {uploadStatus==='inactive'?<Button onClick={this.handleChooseCli}>Upload CLI</Button>:
                <input type="file" name="file" id="fileUpload" onChange={this.handleselectedFile} />
                }
                
                {uploadStatus==='ready'?<Button onClick={this.handleUpload}>Upload</Button>:null}
                {uploadStatus==='started'?<ProgressBar active now={loaded} />:null}
                {uploadStatus==='done'?<div><Button onClick={this.handleDone}>Done!</Button></div>:null}
            </div>
        )
    }
}

export default Uploader;