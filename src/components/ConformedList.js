import React, { Component } from 'react';
import $ from 'jquery';
// import 'ztree/css/zTreeStyle/zTreeStyle.css'
import 'ztree/css/metroStyle/metroStyle.css'
import 'jqueryui/jquery-ui.css'
import './ConnectionsList.css'

window.jQuery = $;

require('ztree');
require('jqueryui');

const setting = {}

class ConnectionsList extends Component {
	
	

	componentDidMount() {
		let dataSources = this.props.dataSources.datasources;
		let conformeddataSources = this.props.dataSources.conformed;
		let conformeddataObjects = this.props.dataSources.conformed;
		let zTreeObj = this.props.zTreeObj;
		let zTreeObj1 = this.props.zTreeObj1;
		let zTreeObj2 = this.props.zTreeObj2;
		let currentNode = this.props.currentNode;
		let addNode = this.props.addNode;
		let nodeClicked = this.props.nodeClicked;
		let plumb = this.props.plumb;
		$(document).ready(function () {
			zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, dataSources);
			zTreeObj.expandAll(false);
			
			zTreeObj1 = $.fn.zTree.init($("#treeDemo1"), setting, conformeddataSources);
			zTreeObj1.expandAll(false);

			zTreeObj2 = $.fn.zTree.init($("#treeDemo2"), setting, conformeddataSources);
			zTreeObj2.expandAll(false);
			
			$(".node_name").draggable({
				helper: 'clone',
				drag: function (event, ui) {
				},
				stop: function (event, ui) {
				},
				start: function (event, ui) {
					var nodeId = $(event)[0].currentTarget.id;
					nodeId = nodeId.substring(0, nodeId.length - 5);
					currentNode = zTreeObj.getNodeByParam('tId', nodeId);
					
					if(currentNode == null){
						console.log("no curent node in ztree")
						currentNode = zTreeObj1.getNodeByParam('tId', nodeId);						
						zTreeObj1.selectNode(currentNode);
					}
					
					if(currentNode == null){
						console.log("no curent node in ztree")
						currentNode = zTreeObj2.getNodeByParam('tId', nodeId);						
						zTreeObj2.selectNode(currentNode);
					}
					
					
//					}else{
//						console.log("found node in ztree")
//						zTreeObj.selectNode(currentNode);
//					}
				}
			});

			$('#canvas').droppable({
				drop: function (event, ui) {

					if (ui.draggable[0].className.indexOf('node_name') === -1)
						return false;
					

					var node = $.extend(true, {}, currentNode);
					
					console.log(node.itemType)
										
					var wrapper = $(this).parent();
					var parentOffset = wrapper.offset();
					var relX = event.pageX - parentOffset.left + wrapper.scrollLeft();
					var relY = event.pageY - parentOffset.top + wrapper.scrollTop();

					
					
					console.log(node);
					if(!node){
						console.log(currentNode)
						alert("No node found")
						return false;
					}
					
					var nodeKey = ((node.parent) ? node.parent.replace(/\\/g, "/") : "") + node.name + "|" + node.data.config.host + "|" + node.data.config.type;

					console.log(node);
					console.log(nodeKey);
					
					var isNewNode = true;
					addNode(node, nodeKey, relX, relY, plumb, nodeClicked, isNewNode);
				}
			});
		});
		
		var uuid = function() {
			  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				    return v.toString(16);
				  });
				}
		
		
		
		$( "#addconformed" ).click(function() {
			  var treeObj = $.fn.zTree.getZTreeObj("treeDemo1");
			  var id = uuid()

			  var newNode = { id:id, pId:id, pId:id, itemType: "Conformed Data Element", "type" : "data", name:"object name", "data" : {"config" : {"host" : "host"}}};
			  
			 var nodes = treeObj.getSelectedNodes();
					var	treeNode = nodes[0];
					
					 newNode = treeObj.addNodes(treeNode, newNode);
					 
					treeObj.editName(newNode[0]);
					
			  
				$(".node_name").draggable({
					helper: 'clone',
					drag: function (event, ui) {
					},
					stop: function (event, ui) {
					},
					start: function (event, ui) {
						var nodeId = $(event)[0].currentTarget.id;
						nodeId = nodeId.substring(0, nodeId.length - 5);
						currentNode = zTreeObj1.getNodeByParam('tId', nodeId);
						//zTreeObj1.selectNode(currentNode);
						
						
						if(currentNode == null){
							console.log("no curent node in ztree")
							currentNode = zTreeObj.getNodeByParam('tId', nodeId);						
							zTreeObj.selectNode(currentNode);
						}else{
							console.log("found node in ztree")
							zTreeObj1.selectNode(currentNode);
						}
					}
				});
			  
			});
		
		$( "#addconformed1" ).click(function() {
			  var treeObj = $.fn.zTree.getZTreeObj("treeDemo2");
			  var id = uuid()

		    var newNode = { id:id, pId:id, pId:id, itemType: "Conformed Data Object", "type" : "data", name:"object name", "data" : {"config" : {"host" : "host"}}};
					  
			 var nodes = treeObj.getSelectedNodes();
					var	treeNode = nodes[0];
					
					 newNode = treeObj.addNodes(treeNode, newNode);
					 
					treeObj.editName(newNode[0]);
			
				$(".node_name").draggable({
					helper: 'clone',
					drag: function (event, ui) {
					},
					stop: function (event, ui) {
					},
					start: function (event, ui) {
						var nodeId = $(event)[0].currentTarget.id;
						nodeId = nodeId.substring(0, nodeId.length - 5);
						currentNode = zTreeObj2.getNodeByParam('tId', nodeId);
						//zTreeObj1.selectNode(currentNode);
						
						
						if(currentNode == null){
							console.log("no curent node in ztree")
							currentNode = zTreeObj.getNodeByParam('tId', nodeId);						
							zTreeObj.selectNode(currentNode);
						}else{
							console.log("found node in ztree")
							zTreeObj2.selectNode(currentNode);
						}
					}
				});
			  
			});
		
		  $("#accordion").accordion({
		         collapsible: true,
		         animate: false
		     });
	
	}

	render() {
		return (
			<div>
			
			
			
			<div id="accordion">
			  <h3>Avaiable Data Elements</h3>
			  <div>
			  <ul id="treeDemo" className="ztree"></ul>	
			  </div>
			  <h3>Conformed Data Elements</h3>
			  <div>
			  <div style={{"padding-top" : "10px", "padding-right" : "5px"}}><input type="button" id="addconformed" value="+" style={{"float" : "right"}}/></div>
			  <ul id="treeDemo1" className="ztree"></ul>			  
			  </div>
			  <h3>Conformed Data Objects</h3>
			  <div>
			  <div style={{"padding-top" : "10px", "padding-right" : "5px"}}><input type="button" id="addconformed1" value="+" style={{"float" : "right"}}/></div>
			  <ul id="treeDemo2" className="ztree"></ul>	
			  </div>
			  
			</div>
		
			</div>
			
		);
	}
}

export default ConnectionsList;

