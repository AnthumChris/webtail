<img clear="both" align="left" width="200px" src="https://resources.whatwg.org/logo-console.png" /><br>

# WebTail

"`tail -f`" for the web.  Demos remote file updates with live visualizations

<br><br><br>

## Live Demo (mock data)

https://pages.github.ibm.com/chris-mcgowan/webtail/?mock

Press `T` to toggle light/dark theme.

## Running Locally

#### WebSocket Tail Server

Specify the local file to tail for changes (e.g. `~/logs/monitoring.log`):

```
$ bin/start-tail-server FILE_TO_WATCH
```

#### Client Web App

Client app must run in a separate terminal window:

```
$ bin/start-client
```



## Deploy to GitHub

Deploys a demo version using mock data (does not use WebSocket tail server)

```
$ bin/deploy-demo-to-github
```
