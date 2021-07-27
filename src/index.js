import cytoscape from 'cytoscape';
import './style.css';
import { Zabbix } from './Zabbix.js';
import dagre from "cytoscape-dagre";
import { setDimStyle, setFocus, setOpacityElement, setResetFocus } from "./OnMouseEvents.js"
// webpack으로 묶어줘야 하니 css파일을 진입점인 index.js 에 import.

cytoscape.use(dagre);

const ipExp = /((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})/g;
const exclusiveIp = /^127/;

// node & font 크기 값
const nodeMaxSize = 50;
const nodeMinSize = 5;
const nodeActiveSize = 28;
const fontMaxSize = 8;
const fontMinSize = 5;
const fontActiveSize = 7;

// edge & arrow 크기값
const edgeWidth = '2px';
var edgeActiveWidth = '4px';
const arrowScale = 0.8;
const arrowActiveScale = 1.2;

const dimColor = '#dfe4ea';
const edgeColor = '#ced6e0';
const nodeColor = '#57606f';
const nodeActiveColor = '#ffa502';

// 상위 node & edge color
const successorColor = '#ff6348';
// 하위 node & edge color
const predecessorsColor = '#1e90ff';

var cy = cytoscape({
    container: document.getElementById('cy'), // container to render in
    elements: [],
    style: [
        {
            selector: 'node',
            style: {
                'background-color': nodeColor,
                'label': 'data(label)',
                'color': nodeColor
            }
        },

        {
            selector: 'edge',
            style: {
                'width': edgeWidth,
                'line-color': edgeColor,
                'target-arrow-color': edgeColor,
                'target-arrow-shape': 'triangle',
                'arrow-scale': arrowScale
            }
        }
    ]
});

cy.on('tap', function (e) {});
cy.on('tapstart mouseover', 'node', function(e){
    setDimStyle(cy, {
        'background-color': dimColor,
        'line-color': dimColor,
        'target-arrow-color': dimColor,
        'color': dimColor
    });
    setFocus(e.target, successorColor, predecessorsColor, edgeActiveWidth, arrowActiveScale);
});
cy.on('tapend mouseout', 'node', function(e){
    setResetFocus(e.cy);
});

var zabbix = new Zabbix("http://211.253.37.78:10002/zabbix/api_jsonrpc.php");
var hosts;
hosts = zabbix.getHostData();
console.log(hosts);
hosts.then((hosts) => {
    var items = zabbix.getItemData();
    items.then((items) => {
        for (var i in hosts) {
            cy.add({
                "data": {
                    "id": hosts[i]['hostid'],
                    "label": hosts[i]['host'],
                    "tag": hosts[i]['interfaces'][0]['ip']
                }
            })
        }

        for (var i in items) {
            if (items[i]['name'] == "Is This HAProxy LoadBalancer" && items[i]['lastvalue'] == 1) {
                cy.add({
                    "data": {
                        "id": 20000 + (i * 100),
                        "source": "10084",
                        "target": items[i]['hostid']
                    }
                })
            }
            if (items[i]['name'] == "HAProxy Load Balancer config" && items[i]['lastvalue'] != "") {
                var ipList = items[i]['lastvalue'].match(ipExp);
                
                for(var j in ipList){
                    if(!exclusiveIp.test(ipList[j])){
                         for (var k = 0; k < cy.nodes().length; k++){
                            if(cy.nodes()[k].data()['tag'] == ipList[j]){
                                cy.add({
                                    "data": {
                                        "id": 20000 + (i * 100) + j,
                                        "source": items[i]['hostid'],
                                        "target": cy.nodes()[k].data()['id']
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }

        var layout = cy.layout({
            name: 'dagre',
            directed: true,
            padding: 10
        });
        layout.run();
    })
})