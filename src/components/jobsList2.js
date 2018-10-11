import React, { Component } from 'react';
import $ from 'jquery';
import 'jqueryui/jquery-ui.css'
import './jobsList.css'

window.jQuery = $;

require('jqueryui');

const setting = {}

class JobsList extends Component {

	componentDidMount() {
		
		let plumb = this.props.plumb;
		$(document).ready(function () {


			$(".job-name").draggable({
				helper: 'clone',
				drag: function (event, ui) {
				},
				stop: function (event, ui) {
				},
				start: function (event, ui) {
					var nodeId = $(event)[0].currentTarget.id;
					nodeId = nodeId.substring(0, nodeId.length - 5);
				}
			});

			$('#canvas').droppable({
				drop: function (event, ui) {

					if (ui.draggable[0].className.indexOf('node_name') === -1)
						return false;

					var node = $.extend(true, {}, currentNode);

					node.left = event.pageX - this.offsetLeft
					node.top = event.pageY - this.offsetTop

					var nodeKey = ((node.parent) ? node.parent.replace(/\\/g, "/") : "") + node.name + "|" + node.data.config.host + "|" + node.data.config.type;

					console.log(node);
					console.log(nodeKey);

					var isNewNode = true;
					loadJob(node, plumb, nodeClicked, isNewNode);
				}
			});
		});

		$("#jobsAccordion").accordion({
			collapsible: true,
			animate: false
		});
	}

	render() {
		return (
			<div id="jobsAccordion">
				<h3>Jobs</h3>
				<div id='jobsList'>
					
				</div>

			</div>
		);
	}
}

export default JobsList;

