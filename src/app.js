const Koa = require('koa');
const log = require('./log');
const KoaLogger = require('koa-logger');
const Chromium = require('./chromium');

const app = new Koa();

app.use(KoaLogger());

app.use(async (ctx) => {
    // ctx.body = 'hello world';
    const chromium = Chromium();
    const buffer = chromium.screenshot({
        url: 'https://coding.net/u/wusisu/score/share'
    })
    console.log(typeof buffer)
});

app.on('error', err =>
    log.error(err)
);

module.exports = app;