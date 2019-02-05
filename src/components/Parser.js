import React, { Component } from 'react'
import CliFile from '../components/CliFile'
import * as config from '../config';
import './Parser.css'
import { Button } from 'react-bootstrap'

class Parser extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            files: [],
            statusCode: '',
            statusMessage: '',
            resourceId: ''
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    parserStep1 = (cli) => {
        var self = this
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    var json = JSON.parse(xmlhttp.responseText)
                    console.log(json);

                    self.setState({
                        resourceId: json.resource_id,
                        statusCode: json.status_code,
                        statusMessage: json.status_message
                    });

                    self.parserStep1a(json.resource_id)

                } else {
                    console.log('failed');
                }
            }
        }

        var data = {
            scriptFilename: cli,
            scriptLocation: "/user/cloudera-service/vdm/scripts/",
            inputFiles: ["all_hotels.csv"],
            inputLocation: "/user/cloudera-service/vdm/input/",
            mode: "overwrite",
            hdfsUser: "hdfs",
            outputFile: "/user/cloudera-service/vdm/output/wrangled_hotels",
            templateVersion: "version4",
            csvName: "csv"
        }
        var payload = JSON.stringify(data)
        console.log(payload)

        xmlhttp.open("POST", config.VDM_META_SERVICE_HOST + '/parser/scripts');
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(payload);
    }

    parserStep1a = (resourceId) => {
        var self = this
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    var json = JSON.parse(xmlhttp.responseText)
                    console.log(json);

                    self.setState({
                        resourceId: json.resource_id,
                        statusCode: json.status_code,
                        statusMessage: json.status_message
                    });

                    self.parserStep2(json.resource_id)

                } else {
                    console.log('failed');
                }
            }
        }

        var data = { scalaBinaryLocation: "/user/local/vdm" }

        var payload = JSON.stringify(data)
        console.log(payload)

        xmlhttp.open("PUT", config.VDM_META_SERVICE_HOST + '/parser/scripts/' + resourceId + '/scala/locations');
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(payload);
    }

    parserStep2 = (resourceId) => {
        var self = this
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    var json = JSON.parse(xmlhttp.responseText)
                    console.log(json);

                    self.setState({
                        resourceId: json.resource_id,
                        statusCode: json.status_code,
                        statusMessage: json.status_message
                    });

                    self.parserStep3(json.resource_id)

                } else {
                    console.log('failed');
                }
            }
        }

        xmlhttp.open("POST", config.VDM_META_SERVICE_HOST + '/parser/scripts/' + resourceId + '/scala/executableBinaries');
        xmlhttp.send();
    }

    parserStep3 = (resourceId) => {
        var self = this
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    var json = JSON.parse(xmlhttp.responseText)
                    console.log(json);

                    self.setState({
                        resourceId: json.resource_id,
                        statusCode: json.status_code,
                        statusMessage: json.status_message
                    });

                } else {
                    console.log('failed');
                }
            }
        }

        xmlhttp.open("POST", config.VDM_META_SERVICE_HOST + '/parser/scripts/' + resourceId + '/jobs');
        xmlhttp.send();
    }


    fetchCliFiles = () => {
        var self = this
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200 || xmlhttp.status === 201) {

                    var json = JSON.parse(xmlhttp.responseText)
                    console.log(json);

                    self.setState({
                        isLoaded: true,
                        files: json
                    });

                } else {
                    console.log('failed');
                }
            }
        }

        xmlhttp.open("GET", config.VDM_UPLOAD_HOST + '/clilist');
        xmlhttp.send();
    }

    handleSubmit(event) {
        event.preventDefault();
        const data = new FormData(event.target);
        const cli = data.get('cli');
        console.log(cli)

        this.parserStep1(cli)

    }

    componentDidMount() {
        let self = this
        self.fetchCliFiles(config)
    }

    render() {
        let { files } = this.state
        return (
            <div>
                <div className='cli-title'>CLI Scripts</div>
                <form onSubmit={this.handleSubmit}>
                    <ul>
                        {
                            files.map((el) => {
                                return <CliFile key={el}
                                    name={el} callback={this.runParse}
                                />
                            })
                        }
                    </ul>
                    <Button type='submit' className='submit-btn'>Parse</Button>
                </form>

            </div>

        )
    }
}

export default Parser