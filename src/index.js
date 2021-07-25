import cytoscape from 'cytoscape';
import './style.css';
import { Zabbix } from './Zabbix.js';
// webpack으로 묶어줘야 하니 css파일을 진입점인 index.js 에 import 합니다

var zabbix = new Zabbix("http://211.253.37.78:10002/zabbix/api_jsonrpc.php");
zabbix.getData();

var cy = cytoscape({

    container: document.getElementById('cy'), // container to render in

    elements: [ // list of graph elements to start with
        { // node a
            "data": { "id": 'a' }
        },
        { // node b
            "data": { "id": 'b' }
        },
        { // node a
            "data": { "id": 'c' }
        },
        { // node a
            "data": { "id": 'd' }
        },
        { // node a
            "data": { "id": 'e' }
        },
        { // edge ab
            "data": { "id": 'ab', "source": 'a', "target": 'b' }
        },
        { // edge ab
            "data": { "id": 'ac', "source": 'a', "target": 'c' }
        },
        { // edge ab
            "data": { "id": 'cd', "source": 'c', "target": 'd' }
        },
        { // edge ab
            "data": { "id": 'ce', "source": 'c', "target": 'e' }
        },
        { // edge ab
            "data": { "id": 'ec', "source": 'e', "target": 'c' }
        }
    ],

    style: [ // the stylesheet for the graph
        {
            selector: 'node',
            style: {
                'background-color': '#666',
                'label': 'data(id)'
            }
        },

        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle'
            }
        }
    ],

    layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 10
    }

});