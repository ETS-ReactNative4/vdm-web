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

class ConformedList extends Component {

	componentDidMount() {
		let dataSources = this.props.dataSources;
		let zTreeObj = this.props.zTreeObj;
		let currentNode = this.props.currentNode;
		let addNode = this.props.addNode;
		let nodeClicked = this.props.nodeClicked;
		let plumb = this.props.plumb;
		$(document).ready(function () {
			zTreeObj = $.fn.zTree.init($("#treeDemo1"), setting, dataSources);
			zTreeObj.expandAll(false);

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
					zTreeObj.selectNode(currentNode);
				}
			});

			$('#canvas').droppable({
				drop: function (event, ui) {

					if (ui.draggable[0].className.indexOf('node_name') === -1)
						return false;

					var node = $.extend(true, {}, currentNode);

					var wrapper = $(this).parent();
					var parentOffset = wrapper.offset();
					var relX = event.pageX - parentOffset.left + wrapper.scrollLeft();
					var relY = event.pageY - parentOffset.top + wrapper.scrollTop();

					var nodeKey = ((node.parent) ? node.parent.replace(/\\/g, "/") : "") + node.name + "|" + node.data.config.host + "|" + node.data.config.type;

					console.log(node);
					console.log(nodeKey);
					
					var isNewNode = true;
					addNode(node, nodeKey, relX, relY, plumb, nodeClicked, isNewNode);
				}
			});
		});
		
		
		$( "#addconformed" ).click(function() {
			  var treeObj = $.fn.zTree.getZTreeObj("treeDemo1");
			  var newNode = { id:222, pId:22, name:"leaf node 222"};
			  newNode = treeObj.addNodes(null, newNode);
			  
			 var nodes = treeObj.getSelectedNodes();
					var	treeNode = nodes[0];
					treeObj.editName(newNode[0]);
			  
			  
			});
	}

	render() {
		return (
			<div className='connections-panel'>
			<div className='component-title'>Data Sources<input type="button" id="addconformed" value="+"/></div>
				<ul id="treeDemo1"
				className="ztree"></ul>
			</div>
		);
	}
}

export default ConformedList;

