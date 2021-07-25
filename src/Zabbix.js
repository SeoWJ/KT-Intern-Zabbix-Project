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
    fetchGetHost(url) {
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
    async getData() {
        let userLoginResponse = await this.fetchUserLogin(this.url);
        this.key = Object.values(userLoginResponse)[1];
        let getHostResponse = await this.fetchGetHost(this.url);
        console.log(getHostResponse);
    }
}