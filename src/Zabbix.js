export class Zabbix {
    constructor(url) {
        this.url = url;
    }

    fetchUserLogin(url) {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "user.login",
                params: {
                    "user": "Admin",
                    "password": "zabbix",
                },
                id: 1,
                auth: null,
            }),
        })
            .then((response) => {
                return response.json();
            })
    }

    fetchHostGet(url) {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "host.get",
                params: {
                    "output": [
                        "hostid",
                        "host"
                    ],
                    "selectInterfaces": [
                        "interfaceid",
                        "ip"
                    ]
                },
                "id": 2,
                "auth": this.key,
            })
        })
            .then((response) => {
                return response.json();
            })
    }

    fetchItemGet(url, itemid) {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "method": "item.get",
                "params": {
                    "filter": {"name": ["Is This Apache Server", "Is This HAProxy LoadBalancer", "httpd log", "HAProxy Load Balancer config"]},
                    "output": ["itemid", "hostid", "name", "lastvalue"],
                    "sortfield": "name"
                },
                "auth": this.key,
                "id": 1
            })
        })
            .then((response) => {
                return response.json();
            })
    }

    async getHostData() {
        let userLoginResponse = await this.fetchUserLogin(this.url);
        this.key = userLoginResponse['result'];
        console.log(this.key);
        let hostGetResponse = await this.fetchHostGet(this.url);

        return hostGetResponse['result'];
    }

    async getItemData() {
        let itemGetResponse = await this.fetchItemGet(this.url);

        return itemGetResponse['result'];
    }
}