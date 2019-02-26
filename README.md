<img clear="both" align="left" width="200px" src="https://resources.whatwg.org/logo-console.png" /><br>

# Live Demo

https://pages.github.ibm.com/chris-mcgowan/webtail/

<br><br>

### Running Locally

Start the WebSocket server specifying the file to tail for changes (e.g. `~/logs/monitoring.log`):

```
$ bin/start-tail-server FILE_TO_WATCH
```

Run the client in a separate terminal window:

```
$ bin/start-client
```



### Deploy to client demo to GitHub

Deploys a demo version using mock data (does not use WebSocket tail server)

```
$ bin/deploy-demo-to-github
```
