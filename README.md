# Welcome to the Siteglide interview task!

The purpose of this task is to give you an opportunity to talk about your approach to problem solving and writing code. 

We're sharing with you an app which has a number of deliberate bugs (and possibly some we've not spotted). Your task is to solve as many bugs as you can in what you consider to be a reasonable time. 

The app uses Liquid and GraphQL on the server side, with JavaScript on the client side for hydration. JS is bundled with Vite. Some of these languages may be more familiar to you than others, that's fine - the bugs we've chosen can happen across languages and we're interested in how you respond to seeing something new. 

## Setup 

1) Make sure you have node.js installed and version is >18
2) Install siteglide-cli globally on your machine in terminal `npm i @siteglide/siteglide-cli -g`
3) Clone your Github repo (this one!)
4) Sign up to Siteglide https://www.siteglide.com/
5) Then contact us via live chat in Siteglide and we'll add you to your site
6) Go to sites tab, you'll have just one
7) In details tab, scroll down to CLI command, copy
8) In terminal, cd to your cloned project folder and run the copied command
9) View your site in the Siteglide Admin with the blue "view" button in bottom right, then go to `/todos` relative URL

## Tips

You're ready to start, the main siteglide-cli commands you can use are:
- `siteglide-cli sync staging` (a watch command - every saved file in marketplace_builder dir is pushed to the site)
- `siteglide-cli deploy staging -w` - (one-off push all files in marketplace_builder dir to the site) -w flag includes assets, which you will want if you change JS or CSS.
- `siteglide-cli gui staging` - utilities for GraphQL and Liquid sandbox, or logs. You may not need these, but available if helpful.

We'd really appreciate it if you could commit to git each time you fix a bug. Also we suggest you make notes about your approach to the bugs and what you found, as we're interested not just in the outcome but the process; your notes may just be as simple as comments in the code.

There are 8 deliberate bugs in the app, you do not need to fix them all. You may also find some non-deliberate bugs! Please spend no more than 2 hours. 

Tooltips in the code are a clue to help you find the bugs, but they will only tell you the expected behaviour; it will be down to you to identify what the bug is. 

AI assistance is allowed, as it's now a normal part of the development process, as is use of search engines. But remember we're checking for understanding as well as output! 