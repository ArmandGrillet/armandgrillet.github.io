---
layout: post
title:  "A new app: back-end"
date:   2015-06-19 21:15:00
categories: ios-ads
---

Today I worked on the back-end of my ad blocker for iOS, here is my journey.

My first thought has been to work with Node.js, this is because Apple released a JS library for CloudKit. My idea (not proven yet) is to have a Node.js app on Heroku pushing the filters in the CloudKit database.

I started this morning by trying to understand the syntax of the [AdBlock Plus (ABP) filters](https://adblockplus.org/en/filter-cheatsheet). Spoiler alert: it's not that easy.

The lists are well optimized and use a syntax that is not RegExp, the syntax used in [WebKit Content Blockers (WCB) rules](https://www.webkit.org/blog/3476/content-blockers-first-look/). I spent my day working on a JS parser to transform the lists and it's already working!

Someone already did a parser for ABP lists but in [Python](https://pypi.python.org/pypi/adblockparser), I transformed this code in a JS algorithm this morning. The main issue has been to solve the use of raw strings in Python, something useful to manipulate expressions that looks like this: `r"^(?:[^:/?#]+:)?(?://(?:[^/?#]*\.)?)?"`. This  feature is not available in Node.js yet but, after asking on [Stack Overflow](http://stackoverflow.com/questions/30952208/using-string-raw-with-node-js), I discovered that it was available using [io.js](https://iojs.org)!

I worked this afternoon on adding the optional options in the WebKit rules, quite easy except that the syntax is not the same between ABP rules and WCB rules. Here is the types list:

* ABP uses: script, image, stylesheet, object, object-subrequest and subdocument
* WCB uses: document, image, style-sheet, script, font, raw, svg-document, media and popup

It is really different except for the basic types. I asked [Benjamin Poulain](Benjamin Poulain) (who works on WebKit and wrote the intro about WCB) more details and he was kind enough to answer shortly. After adding some code to have complete rules, I now just have to accept exceptions to finish my parser.

See you soon for more details about this project.
