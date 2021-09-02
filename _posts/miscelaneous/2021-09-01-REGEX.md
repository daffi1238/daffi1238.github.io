---
layout: post
title: "REGEX"
categories: misc
tags: 
---

This post will speak about regular expressions and som tips to understand better what can be needed for you in the future.

## Resources
Generate a regular expression using machine learning
http://regex.inginf.units.it/

## Grep
How to delete all the lines with no content
```text
 > cat example.txt
this

is

a
```
`cat file | grep -v '^$'`

Find all the words incase-sensitively
`cat file | grep -oiP '[A-Z]\w++'`
## AWK

## sed

## tr