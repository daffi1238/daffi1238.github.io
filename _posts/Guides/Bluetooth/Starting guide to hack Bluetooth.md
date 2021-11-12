---
layout: post
title: "Guide to hack bluetooth"
categories: Guides
tags: 
---

# Blue tooth hacking
What is bluetooth?
https://infocenter.nordicsemi.com/index.jsp?topic=%2Fsds_s132%2FSDS%2Fs1xx%2Fble_protocol_stack%2Fble_protocol_stack.html

How it works?
Whe you connect two devices using bluetooth they are paired and the bluetooth devices transmit the next information:
- Name
- Class
- List of services
- Technical Information

What can we get hacking a phone through Bluetooth?


When the two devices pair, they exchange a pre-shared secret or link key. Each stores this link key to identify the other in future pairing.



## Linux bluetooth tools
Bluetooth protocol stack in Linux is BlueZ that implement several simple tools to manage and hack Bluetooth
- hciconfig: Equivalent to ifconfig but for Bluetooth devices.
- hcitool: This provide us with a device name, ID, class and even clock.
- hcidump: This allows us sniffing bluetoth connections.

**Bluetooth protocol stack**
https://infocenter.nordicsemi.com/index.jsp?topic=%2Fsds_s132%2FSDS%2Fs1xx%2Fble_protocol_stack%2Fble_protocol_stack.html

It's not neccesary that a bluetooth connection uses the all the protocols in the stack and in general is just used one vertical set of them.
-   Bluetooth Core Protocols Baseband: LMP, L2CAP, SDP
-   Cable Replacement Protocol: RFCOMM
-   Telephony Control Protocol: TCS Binary, AT-commands
-   Adopted Protocols: PPP, UDP/TCP/IP, OBEX, WAP, vCard, vCal, IrMC, WAE

**Bluetooth security**
In the first point we have to mention the frequency hopping that are known by the master and slave but not for the outsiders. In the scond point the communications is encrypted (128 bits).

Bluetooth have 3 security modes:
1. No active security
2. Service level security. Centralized security manager handles authentication, configuration, and authorization. May not be activated by user. No device level security.
3. Authentication and encryption based on secret key. Always on. Enforces security for low-level connection.

**Tools**
-   Bluelog: A bluetooth site survey tool. It scans the area to find as many discoverable devices in the area and then logs them to a file.
-   Bluemaho: A GUI-based suite of tools for testing the security of Bluetooth devices.
-   Blueranger: A simple Python script that uses i2cap pings to locate Bluetooth devices and determine their approximate distances.
-   Btscanner: This GUI-based tool scans for discoverable devices within range.
-   Redfang: This tool enables us to find hidden Bluetooth device.
-   Spooftooph: This is a Bluetooth spoofing tool


**Attacks**
-   Blueprinting: The process of footprinting.
-   Bluesnarfing: This attack takes data from the Bluetooth-enabled device. This can include SMS messages, calendar info, images, the phone book, and chats.
-   Bluebugging: The attacker is able to take control of the target's phone. Bloover was developed as a POC tool for this purpose.
-   Bluejacking: The attacker sends a "business card" (text message) that, if the user allows to be added to their contact list, enables the attacker to continue to send additional messages.
-   Bluesmack: A DoS attack against Bluetooth devices.


## Recognizing Bluetooth

#### Using Bluez for Reconnaissance
Use `hciconfig` to enable your Bluetooth adapter
![[Pasted image 20211024224530.png]]

And with the samme command just "up" the interface
`sudo haciconfig hci0 up`

Now Scann for Bluetooth devices with Hcitool is as easy as
```
➜  ~ hcitool scan
Scanning ...
	8C:D9:D6:35:75:A7	POCO X3 Pro
```
And now to get more information about the device:
```
➜  ~ hcitool inq
Inquiring ...
	8C:D9:D6:35:75:A7	clock offset: 0x641f	class: 0x5a020c
```

Most of bluetooth hacking tools use hcitool to attack and bring into a security problem the targets devices.
```
➜  ~ hcitool
hcitool - HCI Tool ver 5.55
Usage:
	hcitool [options] <command> [command parameters]
Options:
	--help	Display help
	-i dev	HCI device
Commands:
	dev 	Display local devices
	inq 	Inquire remote devices
	scan	Scan for remote devices
	name	Get name from remote device
	info	Get information from remote device
	spinq	Start periodic inquiry
	epinq	Exit periodic inquiry
	**cmd 	Submit arbitrary HCI commands**
	con 	Display active connections
	**cc  	Create connection to remote device**
	dc  	Disconnect from remote device
	sr  	Switch master/slave role
	cpt 	Change connection packet type
	rssi	Display connection RSSI
	lq  	Display link quality
	tpl 	Display transmit power level
	afh 	Display AFH channel map
	lp  	Set/display link policy settings
	lst 	Set/display link supervision timeout
	**auth	Request authentication**
	enc 	Set connection encryption
	**key 	Change connection link key**
	clkoff	Read clock offset
	clock	Read local or remote clock
	lescan	Start LE scan
	leinfo	Get LE remote information
	lewladd	Add device to LE White List
	lewlrm	Remove device from LE White List
	lewlsz	Read size of LE White List
	lewlclr	Clear LE White List
	lerladd	Add device to LE Resolving List
	lerlrm	Remove device from LE Resolving List
	lerlclr	Clear LE Resolving List
	lerlsz	Read size of LE Resolving List
	lerlon	Enable LE Address Resolution
	lerloff	Disable LE Address Resolution
	lecc	Create a LE Connection
	ledc	Disconnect a LE Connection
	lecup	LE Connection Update
```

#### Scanning for Services with Sdptool
SDP -> Service Discovery Protocol. This tool belong to Bluez tool kit.
```
➜  ~ sdptool browse 8C:D9:D6:35:75:A7
Browsing 8C:D9:D6:35:75:A7 ...
Service RecHandle: 0x10000
Service Class ID List:
  "Generic Attribute" (0x1801)
Protocol Descriptor List:
  "L2CAP" (0x0100)
    PSM: 31
  "ATT" (0x0007)
    uint16: 0x0001
    uint16: 0x0003

Service RecHandle: 0x10001
Service Class ID List:
  "Generic Access" (0x1800)
Protocol Descriptor List:
  "L2CAP" (0x0100)
    PSM: 31
  "ATT" (0x0007)
    uint16: 0x0014
    uint16: 0x001a

Service Name: Headset Gateway
Service RecHandle: 0x10003
Service Class ID List:
  "Headset Audio Gateway" (0x1112)
  "Generic Audio" (0x1203)
Protocol Descriptor List:
  "L2CAP" (0x0100)
  "RFCOMM" (0x0003)
    Channel: 2
Profile Descriptor List:
  "Headset" (0x1108)
    Version: 0x0102

Service Name: Handsfree Gateway
Service RecHandle: 0x10004
Service Class ID List:
  "Handsfree Audio Gateway" (0x111f)
  "Generic Audio" (0x1203)
Protocol Descriptor List:
  "L2CAP" (0x0100)
  "RFCOMM" (0x0003)
    Channel: 3
Profile Descriptor List:
  "Handsfree" (0x111e)
    Version: 0x0106

Service Name: AV Remote Control Target
Service RecHandle: 0x10005
Service Class ID List:
  "AV Remote Target" (0x110c)
Protocol Descriptor List:
  "L2CAP" (0x0100)
    PSM: 23
  "AVCTP" (0x0017)
    uint16: 0x0104
Profile Descriptor List:
  "AV Remote" (0x110e)
    Version: 0x0103

Service Name: Advanced Audio
Service RecHandle: 0x10006
Service Class ID List:
  "Audio Source" (0x110a)
Protocol Descriptor List:
  "L2CAP" (0x0100)
    PSM: 25
  "AVDTP" (0x0019)
    uint16: 0x0103
Profile Descriptor List:
  "Advanced Audio" (0x110d)
    Version: 0x0103

Service Name: Android Network Access Point
Service Description: NAP
Service RecHandle: 0x10007
Service Class ID List:
  "Network Access Point" (0x1116)
Protocol Descriptor List:
  "L2CAP" (0x0100)
    PSM: 15
  "BNEP" (0x000f)
    Version: 0x0100
    SEQ8: 0 6
Language Base Attr List:
  code_ISO639: 0x656e
  encoding:    0x6a
  base_offset: 0x100
Profile Descriptor List:
  "Network Access Point" (0x1116)
    Version: 0x0100

Service Name: Android Network User
Service Description: PANU
Service RecHandle: 0x10008
Service Class ID List:
  "PAN User" (0x1115)
Protocol Descriptor List:
  "L2CAP" (0x0100)
    PSM: 15
  "BNEP" (0x000f)
    Version: 0x0100
    SEQ8: 0 6
Language Base Attr List:
  code_ISO639: 0x656e
  encoding:    0x6a
  base_offset: 0x100
Profile Descriptor List:
  "PAN User" (0x1115)
    Version: 0x0100

Service Name: SMS/MMS
Service RecHandle: 0x10009
Service Class ID List:
  "Message Access - MAS" (0x1132)
Protocol Descriptor List:
  "L2CAP" (0x0100)
  "RFCOMM" (0x0003)
    Channel: 26
  "OBEX" (0x0008)
Profile Descriptor List:
  "Message Access" (0x1134)
    Version: 0x0102

Browsing 8C:D9:D6:35:75:A7 ...
Service Search failed: Invalid argument
Service Name: OBEX Phonebook Access Server
Service RecHandle: 0x1000a
Service Class ID List:
  "Phonebook Access - PSE" (0x112f)
Protocol Descriptor List:
  "L2CAP" (0x0100)
  "RFCOMM" (0x0003)
    Channel: 19
  "OBEX" (0x0008)
Profile Descriptor List:
  "Phonebook Access" (0x1130)
    Version: 0x0101

Service Name: BluetoothRfcommServerInsecure
Service RecHandle: 0x1000b
Service Class ID List:
  UUID 128: 98b97136-36a2-11ea-8467-484d7e99a198
Protocol Descriptor List:
  "L2CAP" (0x0100)
  "RFCOMM" (0x0003)
    Channel: 4

Service Name: OBEX Object Push
Service RecHandle: 0x1000c
Service Class ID List:
  "OBEX Object Push" (0x1105)
Protocol Descriptor List:
  "L2CAP" (0x0100)
  "RFCOMM" (0x0003)
    Channel: 12
  "OBEX" (0x0008)
Profile Descriptor List:
  "OBEX Object Push" (0x1105)
    Version: 0x0102

```

#### Determine wheter bluetooth device are reachable doing a "ping"
```
➜  ~ sudo l2ping 8C:D9:D6:35:75:A7
	Ping: 8C:D9:D6:35:75:A7 from 0E:12:34:4E:90:A1 (data size 44) ...
	44 bytes from 8C:D9:D6:35:75:A7 id 0 time 4.73ms
	44 bytes from 8C:D9:D6:35:75:A7 id 1 time 31.23ms
```

#### Scanning for bluetooth devices with BTScanner
`btscanner`
Its a rudimentary GUI to discover host with inquiry scans and not for so much.

#### Bluetooth Sniffing with BlueMaho
https://github.com/zenware/bluemaho

`sudo apt-get install python-wxtools`

```

```