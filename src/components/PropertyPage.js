import React, { Component } from "react";
import Form from "react-jsonschema-form";
import { Button} from 'react-bootstrap';
import './propertyPage.css'

import jquery from 'jquery'

import * as config from '../config';

window.jQuery = jquery

const log = (type) => console.log.bind(console, type);

const onSubmit = ({ formData }) => {
    // Reformat to the spec
    var rawFilePayload = {
        RawFile: formData
    }

    console.log(rawFilePayload)
    // Temporarily put the request here
    //fetch('http://localhost:4000/api/rawfile',
    /**fetch('http://localhost:9988/vdm/rawfile',
        {
            method: 'post',
            body: JSON.stringify(rawFilePayload)
        })
        .then(res => res.json())
        .then(
            (result) => {
                console.log(result)
            },
            (error) => {
                alert(error)
            }
        )**/


var xmlhttp = new XMLHttpRequest();


xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState === 4) {
  
     //var response = JSON.parse(xmlhttp.responseText);
      if (xmlhttp.status === 200 || xmlhttp.status === 201) {
      
         console.log(xmlhttp.responseText);
         
         jquery('#triurl').val(xmlhttp.responseText);
 
 		 //window.triurl='http://www.google.com';
         
         jquery('#modal1').show()
	
      } else {
         console.log('failed');
      }
  }
}

xmlhttp.open("POST", config.VDM_SERVICE_HOST + '/vdm/rawfile');
xmlhttp.send(JSON.stringify(rawFilePayload));

}

class PropertyPage extends Component {

    render() {
        const node = this.props.node;

        if (node == null) {
        	
        	  const schema = {
        	            title: "no selected node",
        	            type: "object",
        	            required: ["Id", "Name", "Location", "FileFormat", "Delimiter", "Status", "SourceID"],
        	            properties: {
        	                Id: { type: "string" },
        	                Name: { type: "string" },
        	                Description: { type: "string" },
        	                Location: { type: "string" },
        	                FileFormat: { type: "string" },
        	                Delimiter: { type: "string" },
        	                Status: { type: "string" },
        	                SourceID: { type: "string" },
        	            }
        	        };
        	  
            return (
            		 <div>
                     <Form schema={schema}
                         formData={[]}
                         onChange={log("changed")}
                         onSubmit={onSubmit}
                         onError={log("errors")} >
                        
                     </Form>
                 </div>
            )
        }

        // Build the schema
        const schema = {
            title: node.text,
            type: "object",
            required: ["Id", "Name", "Location", "FileFormat", "Delimiter", "Status", "SourceID"],
            properties: {
                Id: { type: "string" },
                Name: { type: "string" },
                Description: { type: "string" },
                Location: { type: "string" },
                FileFormat: { type: "string" },
                Delimiter: { type: "string" },
                Status: { type: "string" },
                SourceID: { type: "string" },
            }
        };

        const formData = {
            Id: node.id,
            Name: node.name,
            Description: node.description,
            Location: node.data.config.path,
            FileFormat: node.itemType,
            Delimiter: ":",
            Status: "Active",
            SourceID: node.sourceID
        };

        return (
            <div>
                <Form schema={schema}
                    formData={formData}
                    onChange={log("changed")}
                    onSubmit={onSubmit}
                    onError={log("errors")} >
                    <Button bsStyle="primary" className={node.className} type="submit">Submit</Button>
                </Form>
            </div>
        )
    }

}

export default PropertyPage