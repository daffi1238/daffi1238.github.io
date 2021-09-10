----
Template
1. Passwords
2. Usernames
3. Protect  login
	1. Rename wp_login.php
	2. Move it
	3. Add a catchap
	4. Or even block certain IP or using a reverse proxy you could add just an IP to access here.
4. Disable php error reporting
	![[Pasted image 20210905220338.png]]
5. Disable File Editor
	![[Pasted image 20210905220659.png]]
6. Widgets
7. Plugins
	1. Trusted sources
	2. Update
8. themes
	1. update
9. Limit logins attempts
10. 2º Factor authentication (Google Authenticator Wordpress Two Factor Authentication)
11. Protect DB
	1. change the default prefix for names for each table (users->wp_users)
12. Wordpress security keys (To encrypt to encrypt passwords or cookies) and salts (is the hash of the key)
13. XML-RPC
	1. If you don't need it you should disable it or use the plugin "Disable XML-RPC-API"
	2. Used for DDoS
14. Web Hosting, use you own machine (in vulture) encrypted aand with updated DB
15. wp.config.php
![[Pasted image 20210905231457.png]]
Just deny access through the web enginee and if you need access it just use ssh.
16. File permissions
![[Pasted image 20210905232042.png]]

//checklist
https://ezseonews.com/wp-content/uploads/2020/03/Security-Checklist.pdf


----

Scripts
-> Create lure pass.bck and monitor with an alert mode when it is opened
1º How should we get the notification?
```

```
-> Create a script to check the used verion of each plugin and the current version existing
-> Create a script to check the curren version of the theme and the used version.