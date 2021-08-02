import { Zabbix } from "./Zabbix";

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
const nodeColor = '#000000';
const nodeActiveColor = '#ffa502';

// 상위 node & edge color
const successorColor = '#ff6348';
// 하위 node & edge color
const predecessorsColor = '#1e90ff';

export function setDimStyle(target_cy, style) {
    target_cy.nodes().forEach(function (target) {
        target.style(style);
    });
    target_cy.edges().forEach(function (target) {
        target.style(style);
    });
}

export function setFocus(target_element, successorColor, predecessorsColor, edgeWidth, arrowScale) {
    target_element.style('background-color', nodeActiveColor);
    target_element.style('color', nodeColor);
    target_element.successors().each(function (e) {
        // 상위  엣지와 노드
        if (e.isEdge()) {
            e.style('width', edgeWidth);
            e.style('arrow-scale', arrowScale);
        }
        e.style('color', nodeColor);
        e.style('background-color', successorColor);
        e.style('line-color', successorColor);
        e.style('target-arrow-color', successorColor);
        setOpacityElement(e, 0.5);
    }
    );
    target_element.predecessors().each(function (e) {
        // 하위 엣지와 노드
        if (e.isEdge()) {
            e.style('width', edgeWidth);
            e.style('arrow-scale', arrowScale);
        }
        e.style('color', nodeColor);
        e.style('background-color', predecessorsColor);
        e.style('line-color', predecessorsColor);
        e.style('target-arrow-color', predecessorsColor);
        setOpacityElement(e, 0.5);
    });
    target_element.neighborhood().each(function (e) {
        // 이웃한 엣지와 노드
        setOpacityElement(e, 1);
    }
    );
}

export function setOpacityElement(target_element, degree) {
    target_element.style('opacity', degree);
}

export function setResetFocus(target_cy) {
    target_cy.nodes().forEach(function (target) {
        target.style('background-color', nodeColor);
        target.style('color', nodeColor);
        target.style('opacity', 1);
    });
    target_cy.edges().forEach(function (target) {
        target.style('line-color', edgeColor);
        target.style('target-arrow-color', edgeColor);
        target.style('width', edgeWidth);
        target.style('arrow-scale', arrowScale);
        target.style('opacity', 1);
    });
}

export function showNodeInfo(hostid, type, zabbix) {
    document.getElementById('info').style.opacity = 0.4;

    var nodeInfo = zabbix.getNodeInfo(hostid);

    nodeInfo.then((nodeInfo) => {
        if (type == "lb") {
            for (var key in Object.keys(nodeInfo)) {
                if (nodeInfo[key]['name'].includes("Traffic") || nodeInfo[key]['name'].includes("Health Check")) {
                    document.getElementById('info').innerHTML += nodeInfo[key]['name'] + " : " + nodeInfo[key]['lastvalue'] + "<br>";
                }
            }
        }
        else if (type == "apacheServer") {
            for (var key in Object.keys(nodeInfo)) {
                if (nodeInfo[key]['name'].includes("Traffic") || nodeInfo[key]['name'].includes("Health Check")) {
                    document.getElementById('info').innerHTML += nodeInfo[key]['name'] + " : " + nodeInfo[key]['lastvalue'] + "<br>";
                }
            }
        }
        else if (type == "switch") {
            for (var key in Object.keys(nodeInfo)) {
                document.getElementById('info').innerHTML += nodeInfo[key]['name'] + " : " + nodeInfo[key]['lastvalue'] + "<br>";
            }
        }
    });
}

export function closeNodeInfo() {
    document.getElementById('info').style.opacity = 0;
    document.getElementById('info').innerHTML = "";
    document.removeEventListener("mousemove", showNodeInfo);
}