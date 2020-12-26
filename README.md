# bunyan-cloud-function

A package that allows you to use [Bunyan](https://github.com/trentm/node-bunyan) on [Google Cloud Functions](https://cloud.google.com/functions), have your logs appear on [StackDriver](https://cloud.google.com/logging), and not have to deal with missing logs, async log saving, delayed logs due to function freeze after return, etc, etc, etc.

## Install

```shell
npm i --save @abbit/bunyan-cloud-function
```

## Usage

```javascript
import bunyan from 'bunyan';
import {LoggingBunyan} from '@abbit/bunyan-cloud-function';

const loggingBunyan = new LoggingBunyan();

const logger = bunyan.createLogger({
    name: 'test',
    streams: [
        loggingBunyan.stream('INFO') // Will log to stdout in a format that stackdriver understands
    ],
});
```

## Tech stuff

This package changes the json format written to stdout(yes, stdout) just enough so that StackDriver recognizes the messages and log levels.

We created this because we like Bunyan and all other solutions were a pain to use. The file is 100 lines long so if it's not quite right for you feel free to play around and submit a pull request.
