import cytoscape from 'cytoscape';
import './style.css';
import { Zabbix } from './Zabbix.js';
// webpack으로 묶어줘야 하니 css파일을 진입점인 index.js 에 import 합니다

var cy = cytoscape({
    container: document.getElementById('cy'), // container to render in
    elements: [],
    style: [
        {
            selector: 'node',
            style: {
                'background-color': '#666',
                'label': 'data(label)'
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
    ]
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
                var ipExp = /((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})/g;
                var exclusiveIp = /^127/;
                var ipList = items[i]['lastvalue'];
                
                // for(var j in ipList){
                //     if(!exclusiveIp.test(ipList[j])){
                //         cy.add({
                //             "data": {
                //                 "id": 20000 + (i * 100) + j,
                //                 "source": items[i]['hostid'],
                //                 "target": cy.nodes("[tag = '" + ipList[j] + "']")
                //             }
                //         })
                //     }
                // }
            }
        }

        var layout = cy.layout({
            name: 'breadthfirst',
            directed: true,
            padding: 10
        });
        layout.run();
    })

    console.log(cy.elements());
})