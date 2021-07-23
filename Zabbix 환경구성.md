### Zabbix Server 환경 구성

0. VM 생성 후 10051(Listenport), 22, 80 port portfowarding 필요
   - /etc/zabbix/zabbix_server.conf 파일에서 Listenport 변경 가능

##### a. Install Zabbix repository

```
# rpm -Uvh https://repo.zabbix.com/zabbix/5.0/rhel/7/x86_64/zabbix-release-5.0-1.el7.noarch.rpm
# yum clean all
```

##### b. Install Zabbix server and agent

```
# yum install zabbix-server-mysql zabbix-agent
```

##### c. Install Zabbix frontend

Enable Red Hat Software Collections

```
# yum install centos-release-scl
```

Edit file /etc/yum.repos.d/zabbix.repo and enable zabbix-frontend repository.

```
[zabbix-frontend]...enabled=1...
```

Install Zabbix frontend packages.

```
# yum install zabbix-web-mysql-scl zabbix-apache-conf-scl
```

##### d. Create initial database

[documentation](https://www.zabbix.com/documentation/5.0/manual/appendix/install/db_scripts)

Run the following on your database host.

```
# yum install -y mariadb mariadb-server
# systemctl start mariadb.service
# systemctl enable mariadb.service

# mysql -uroot -p
  Enter password: ENTER(엔터)

mysql> create database zabbix character set utf8 collate utf8_bin;
mysql> create user zabbix@localhost identified by 'zabbix'(내패스워드);
mysql> grant all privileges on zabbix.* to zabbix@localhost;
mysql> quit;
```

On Zabbix server host import initial schema and data. You will be prompted to enter your newly created password.

```
# zcat /usr/share/doc/zabbix-server-mysql*/create.sql.gz | mysql -uzabbix -p zabbix
  Enter password: 'zabbix'(내패스워드)
```

##### e. Configure the database for Zabbix server

Edit file /etc/zabbix/zabbix_server.conf

```
DBPassword=zabbix(내패스워드)
```

##### f. Configure PHP for Zabbix frontend

Edit file /etc/opt/rh/rh-php72/php-fpm.d/zabbix.conf, uncomment and set the right timezone for you.

```
; php_value[date.timezone] = Europe/Riga
```

Change to ...

```
php_value[date.timezone] = Asia/Seoul
```

##### g. Start Zabbix server and agent processes

Start Zabbix server and agent processes and make it start at system boot.

```
# yum -y install httpd php

# systemctl restart zabbix-server zabbix-agent httpd rh-php72-php-fpm
# systemctl enable zabbix-server zabbix-agent httpd rh-php72-php-fpm
```

##### h. Configure Zabbix frontend

Connect to your newly installed Zabbix frontend: http://server_ip_or_name/zabbix
Follow steps described in Zabbix documentation: [Installing frontend](https://www.zabbix.com/documentation/5.0/manual/installation/install#installing_frontend)



### Zabbix Agent 환경 구성

0. VM 생성 후 10050(Listenport), 22 port portfowarding 필요

##### a. Install Zabbix repository

```
# rpm -Uvh https://repo.zabbix.com/zabbix/5.0/rhel/7/x86_64/zabbix-release-5.0-1.el7.noarch.rpm
# yum clean all
```

##### b. Install Zabbix agent

```
# yum install -y zabbix-agent
```

##### c. Edit file /etc/zabbix/zabbix_agentd.conf -> 파일 update 시에는 항상 systemctl restart ~ 해야함

```
# vim /etc/zabbix/zabbix_agentd.conf
```

```
#Passive checks related
Server = '서버 IP'(Incomming connection 허용할 IP 들)
# Server=0.0.0.0/0 (Any IP에 대해 허용)

#Active checks related

ServerActive='서버IP' or 'Proxy의 CIP'	// kt cloud 공인IP?

Hostname='host 이름' (서버에 host 등록하는 이름과 동일해야 함)	// Zabbix-Agent-01
```

##### d. Start Zabbix agent processes

Start Zabbix agent processes and make it start at system boot.

```
# systemctl start zabbix-agent
# systemctl enable zabbix-agent
```

##### 

##### e. Add host

```
Configuration -> Hosts
Create Host
 - Host name: /etc/zabbix/zabbix_server.conf에 작성한 이름과 동일해야 함
 - 적절한 Templates 적용
 
-> 서버에 zabbix agent 노출되어 template에 설정된 값들 정상 수집
```

##### 

### Zabbix Proxy 환경 구성

0. VM 생성 후 10051(Listenport), 22 port portfowarding 필요 -> /etc/zabbix/zabbix_proxy.conf에서 listenport 변경 가능

##### a. Install Zabbix repository

```
# rpm -Uvh https://repo.zabbix.com/zabbix/5.0/rhel/7/x86_64/zabbix-release-5.0-1.el7.noarch.rpm
# yum clean all
```

##### b. Install Zabbix server and agent

```
# yum install -y zabbix-proxy-mysql
```

##### c. Create initial database

```
# yum install -y mariadb mariadb-server
# systemctl start mariadb.service
# systemctl enable mariadb.service

# mysql -u root -p
  Enter password: ENTER(엔터)

mysql> create database zabbix character set utf8 collate utf8_bin;
mysql> create user zabbix@localhost identified by 'zabbix'; 
mysql> grant all privileges on zabbix.* to zabbix@localhost;
mysql> quit;
```

##### d. Importing data

```
# zcat /usr/share/doc/zabbix-proxy-mysql*/schema.sql.gz | mysql -uzabbix -p zabbix
Enter password :zabbix 	// 여긴 zabbix로 했음
```

##### e. Configure database for Zabbix proxy

Edit zabbix_proxy.conf:

```
# vim /etc/zabbix/zabbix_proxy.conf
DBHost=localhost	// 없음
DBName=zabbix
DBUser=zabbix
DBPassword=zabbix	// 없음
```

##### f. Configure Zabbix proxy

Edit zabbix_proxy.conf:

```
# vim /etc/zabbix/zabbix_proxy.conf
//ProxyMode Active
ProxyMode=0	// 주석처리 해제하는거 맞음?
Server='서버 IP'	// 자빅스 서버 공인ip?

//ProxyMode Passive
ProxyMode=1
Server='서버 IP'

Hostname=kgh-proxy (실제 웹에 등록하는 이름과 동일해야 함)	// 이건 뭐지
```

##### g. Starting Zabbix proxy process

To start a Zabbix proxy process and make it start at system boot:

```
# systemctl start zabbix-proxy
# systemctl enable zabbix-proxy
```



### Discovery

Configuration > Discovery

IP 대역을 설정해서 디스커버리 필요





#### Agentless

Zabbix SNMP를 통해 통신관계를 맺어놓고 Trapper를 사용해라

`SNMP 설정 완료 선행` > SNMP Trapper > 

네트워크 장비 정보 가져오고싶을떄 부하없이 가져올떄.  161 포트 오픈 필요

자빅스의 `SNMP용 템플릿`을 보면 아이템 항목 비교하면 알 수 있을 듯.

리포지토리 yum install 이 아닌, git 에서 소스코드를 가져와서 

snmp 관련된 디렉토리에 소스코드 copy & paste

zabbix server 2 에서 vm 4 snmp로 Agentless로 가져온다.



```
소스코드 디렉토리에 복붙 후 자빅스서버 컨피그 파일에서 주석해제 또는 디렉토리 지정 등의 설정 작업이 필요하다. 
```

https://www.zabbix.com/documentation/current/manual/config/items/itemtypes/snmp

```
To be able to retrieve data provided by SNMP agents on these devices, Zabbix server must be [initially configured](https://www.zabbix.com/documentation/current/manual/installation/install#configure_the_sources) with SNMP support.
```

##### 4 Configure the sources

When configuring the sources for a Zabbix server or proxy, you must specify the database type to be used. Only one database type can be compiled with a server or proxy process at a time.

To see all of the supported configuration options, inside the extracted Zabbix source directory run:

```
./configure --help
```

To configure the sources for a Zabbix server and agent, you may run something like:

```
./configure --enable-server --enable-agent --with-mysql --enable-ipv6 --with-net-snmp --with-libcurl --with-libxml2
```

To configure the sources for a Zabbix server (with PostgreSQL etc.), you may run:

```
./configure --enable-server --with-postgresql --with-net-snmp
```

To configure the sources for a Zabbix proxy (with SQLite etc.), you may run:

```
./configure --prefix=/usr --enable-proxy --with-net-snmp --with-sqlite3 --with-ssh2
```

To configure the sources for a Zabbix agent, you may run:

```
./configure --enable-agent
```

or, Zabbix agent 2:

```
./configure --enable-agent2
```

수집 서버는 161

대상 서버는 162 (반대일 수 있음)

- 왜 포트가 달라야함??



SNMP 트랩 방식이 자빅스 센더와 사상이 같다.

- 비 주기적인 이벤트를 로그 떨어진 것을 계속 감시해서 서버로 보냄.
- 밉으로 특정 정보를 가져온다.
- 트랩은 문제가 있을 때 받아올 때 사용 목적임.



밉(MIP)

- 모든 장비에서 규칙이 있는거다.
- 표준 밉
  - ex) 1.3.6 1.1.2.5  --> CPU (실제론 다름)
- 제조사 밉
  - 제조사에서 제공하는 장비 특화 밉
- 