---
layout: post
title: "HTB - Blackfield"
categories: htb
tags: windows DC smb
---

## Enumeration and penetration
**nmap**
`sudo nmap -sS --min-rate 5000 -Pn -p- --open -vvv -n 10.10.10.192 -oG allports`
```
PORT      STATE SERVICE        REASON
53/tcp    open  domain         syn-ack ttl 127
88/tcp    open  kerberos-sec   syn-ack ttl 127
135/tcp   open  msrpc          syn-ack ttl 127
139/tcp   open  netbios-ssn    syn-ack ttl 127
389/tcp   open  ldap           syn-ack ttl 127
445/tcp   open  microsoft-ds   syn-ack ttl 127
593/tcp   open  http-rpc-epmap syn-ack ttl 127
3268/tcp  open  globalcatLDAP  syn-ack ttl 127
49677/tcp open  unknown        syn-ack ttl 127
```

Escaneando servicios:
`nmap -sC -sV -p53,88,135,139,389,445,593,3268,49677 -n -Pn $ipv -oN targeted`
```text
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2021-11-06 00:52:24Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: BLACKFIELD.local0., Site: Defaul
t-First-Site-Name)
445/tcp   open  microsoft-ds?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: BLACKFIELD.local0., Site: Defaul
t-First-Site-Name)
49677/tcp open  msrpc         Microsoft Windows RPC
```

#### Port 53/DNS

#### Port 88/kerberos


#### 389/ldap

#### 445/samba && 139/rpc
https://book.hacktricks.xyz/pentesting/135-pentesting-msrpc
**rpc**
For listing users (mainly)
```
smbclient -L 10.10.10.192
	Enter WORKGROUP\kali's password: 

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        forensic        Disk      Forensic / Audit share.
        IPC$            IPC       Remote IPC
        NETLOGON        Disk      Logon server share 
        profiles$       Disk      
        SYSVOL          Disk      Logon server share 

smbmap -H 10.10.10.192 -u ""
	[return nothing]
rpcclient -U "" 10.10.10.192 -N 
	rpcclient $> enumdomusers
	result was NT_STATUS_ACCESS_DENIED
```
Then we need some credential to exploit this.

**crackmapexec**
Discover the name of the machine in the domain
```
crackmapexec 10.10.10.192
	SMB         10.10.10.192    445    DC01             [*] Windows 10.0 Build 17763 (name:DC01) (domain:BLACKFIELD.local) (signing:True) (SMBv1:False)

```
We can see that the samba is signed, good practice this way will be harder and funnier.
use the name to access modifying the /etc/hosts
`10.10.10.192    blackfield.local dc01.blackfield.local`

Okei, let's retake the shared directories discovered with  smbclient
```
smbclient -L 10.10.10.192
	Enter WORKGROUP\kali's password: 

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        forensic        Disk      Forensic / Audit share.
        IPC$            IPC       Remote IPC
        NETLOGON        Disk      Logon server share 
        profiles$       Disk      
        SYSVOL          Disk      Logon server share 
```
Can we go in into the shared resources?
To discover this just use smbmap with null user
```text
smbmap -H $ipv -u 'null'  
[+] Guest session       IP: 10.10.10.192:445    Name: blackfield.local                                  
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        ADMIN$                                                  NO ACCESS       Remote Admin
        C$                                                      NO ACCESS       Default share
        forensic                                                NO ACCESS       Forensic / Audit share.
        IPC$                                                    READ ONLY       Remote IPC
        NETLOGON                                                NO ACCESS       Logon server share 
        profiles$                                               READ ONLY
        SYSVOL                                                  NO ACCESS       Logon server share 

```
READ in profile and READ in IPC$, this last one what is?

Now just connect to the resources using smbclient
`smbclient //10.10.10.192/profiles$ -N`
And whe you are in jus set a 'ls' or 'dir' to list the content.
What do we have there? a list of potentials users. uiuiui This smell as funny.

Having a list of potentials users ARPRespRoasting
