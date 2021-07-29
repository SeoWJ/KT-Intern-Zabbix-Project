import cytoscape from 'cytoscape';
import './style.css'; // webpack으로 묶어줘야 하니 css파일을 진입점인 index.js 에 import.
import { Zabbix } from './Zabbix.js';
import dagre from "cytoscape-dagre";
import { setDimStyle, setFocus, setOpacityElement, setResetFocus, showNodeInfo, closeNodeInfo } from "./OnMouseEvents.js"

const ipExp = /((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})/g;
const exclusiveIp = /^127/;

const loadBalancerIconUrl = 'https://image.flaticon.com/icons/png/512/750/750618.png';
const switchIconUrl = 'https://image.flaticon.com/icons/png/512/1089/1089006.png';
const instanceIconUrl = 'https://image.flaticon.com/icons/png/512/2004/2004580.png';
const serverIconUrl = 'https://image.flaticon.com/icons/png/512/622/622397.png';


// edge & arrow 크기값
const edgeWidth = '2px';
var edgeActiveWidth = '2px';
const arrowScale = 0.8;
const arrowActiveScale = 1.2;

const dimColor = '#dfe4ea';
const edgeColor = '#ced6e0';
const nodeColor = '#BBBBBB';
const nodeActiveColor = '#ffa502';

// 상위 node & edge color
const successorColor = '#ff6348';
// 하위 node & edge color
const predecessorsColor = '#1e90ff';

cytoscape.use(dagre);

// cytoscape 객체 초기 설정
var cy = cytoscape({
    container: document.getElementById('cy'), // container to render in
    elements: [],
    style: [
        {
            selector: 'node',
            style: {
                'shape': 'roundrectangle',
                'background-color': nodeColor,
                'background-image': serverIconUrl,
                'background-fit': 'contain',
                'border-style': 'solid',
                'border-color': '#000',
                'border-width': 0.5,
                'label': 'data(label)',
                'width': 16,
                'height': 12,
                'font-size': 5,
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

// OnClick 이벤트
cy.on('tap', function (e) {
    var connectUrl = e.target.data('url');

    if(connectUrl && connectUrl != ' '){
        window.open(connectUrl);
    }
});

// OnMouse 이벤트
cy.on('tapstart mouseover', 'node', function(e){
    document.addEventListener("mousemove", showNodeInfo); 
    
    setDimStyle(cy, {
        'background-color': dimColor,
        'line-color': dimColor,
        'target-arrow-color': dimColor,
        'color': dimColor
    });
    setFocus(e.target, successorColor, predecessorsColor, edgeActiveWidth, arrowActiveScale);
});
cy.on('tapend mouseout', 'node', function(e){
    closeNodeInfo();
    setResetFocus(e.cy);
});

// 브라우저 크기 조정시 화면 크기 조정
let resizeTimer;

window.addEventListener('resize', function (){
    this.clearTimeout(resizeTimer);
    resizeTimer = this.setTimeout(function(){
        cy.fit();
    }, 200);
});

// 자동 새로고침
setTimeout(function(){
    location.reload();
    },60000
);

// 자빅스 객체 생성 및 api 호출
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
                    "tag": hosts[i]['interfaces'][0]['ip'],
                    "url": "http://211.253.37.78:10002/zabbix/zabbix.php?action=latest.view&filter_hostids%5B%5D=" + hosts[i]['hostid'] + "&filter_set=1"
                }
            })
        }

        for (var i in items) {
            if (items[i]['name'] == "Is This Apache Server" && items[i]['lastvalue'] == 1){
                cy.$('node[id = "' + items[i]["hostid"] + '"]')[0].data('type', 'apacheServer');
                cy.$('node[id = "' + items[i]["hostid"] + '"]')[0].style('background-image', instanceIconUrl);
            }
            else if (items[i]['name'] == "Is This HAProxy LoadBalancer" && items[i]['lastvalue'] == 1) {
                cy.$('node[id = "' + items[i]["hostid"] + '"]')[0].data('type', 'lb');
                cy.$('node[id = "' + items[i]["hostid"] + '"]')[0].style('background-image', loadBalancerIconUrl);
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

        cy.layout({
            name: 'dagre',
            directed: true,
            padding: 10
        }).run();
    })
})