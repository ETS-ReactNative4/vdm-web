import React, { Component } from 'react'
import * as config from '../config';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import axios from 'axios'

class Explore extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            loading: true,
            dataSources: "[]",
            selectedFile: null,
            loaded: 0
        };

        this.handleselectedFile = this.handleselectedFile.bind(this)
        this.handleUpload = this.handleUpload.bind(this)
    }

    handleselectedFile = event => {
        this.setState({
            selectedFile: event.target.files[0],
            loaded: 0,
        })
    }

    handleUpload = () => {
        let self = this
        const data = new FormData()
        data.append('file', self.state.selectedFile, self.state.selectedFile.name)

        axios
            .post(config.VDM_SERVICE_HOST_LOCAL + '/upload', data, {
                onUploadProgress: ProgressEvent => {
                    self.setState({
                        loaded: (ProgressEvent.loaded / ProgressEvent.total * 100),
                    })
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

    render() {
        console.log(this.props.match)

        const columns = [{
            Header: 'ID',
            accessor: 'id'
        }, {
            Header: 'Name',
            accessor: 'name'
        }, {
            Header: 'Recipe',
            accessor: 'recipe'
        }, {
            Header: 'Flow',
            accessor: 'flow'
        }, {
            Header: 'Created At',
            accessor: 'createdAt'
        }, {
            Header: 'Updated At',
            accessor: 'updatedAt'
        },
        {
            Header: 'Recipe',
            accessor: 'url',
            Cell: props => <a href={props.value} target='_blank'>{props.value}</a>
        }
        ]


        return (
            <div>
                <div>
                    <input type="file" name="file" id="" onChange={this.handleselectedFile} />
                    <button onClick={this.handleUpload}>Upload</button>
                    <div> {Math.round(this.state.loaded, 2)} %</div>
                </div>
                <div style={{ padding: '20px' }}>Wrangled Datasets<hr />

                    <ReactTable
                        data={JSON.parse(this.state.dataSources)}
                        columns={columns}
                        manual
                        loading={this.state.loading}
                        onFetchData={(state, instance) => {
                            // show the loading overlay
                            this.setState({ loading: true })
                            // fetch your data
                            fetch(config.VDM_SERVICE_HOST + '/getWrangledSets')
                                .then(res => res.json())
                                .then(
                                    (result) => {

                                        var data = []
                                        result.data.map((elem, i) => {
                                            var url = `http://52.201.45.52:3005/data/${elem.flow.id}/${elem.id}`;
                                            data.push({ "name": elem.name, "id": elem.id, "recipe": elem.recipe.id, "flow": elem.flow.id, "createdAt": elem.createdAt, "updatedAt": elem.updatedAt, "url": url })

                                            console.log(this.state.dataSources)
                                        });
                                        //
                                        //              
                                        //                
                                        //                	
                                        //                	
                                        //                	
                                        //                
                                        this.setState({
                                            loading: false,
                                            dataSources: JSON.stringify(data)
                                        });


                                    },

                                    (error) => {
                                        console.log(error)
                                    }
                                )
                        }}
                    />

                </div>
            </div>


        );

    }
}



export default Explore