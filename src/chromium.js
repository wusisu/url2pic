const CDP = require('chrome-remote-interface');

const log = require('./log');

class Chromium {
    constructor() {
        this.defaultParams = {
            userAgent: null,
            viewportWidth: 1440,
            viewportHeight: 900,
            url: "https://coding.net",
            delay: 1,
            format: 'png',
            fullPage: false,
            output: 'screenshot.png',
        }
    }
    screenshot(params={}) {
        try {
            return this._screenshot({
                ...this.defaultParams,
                ...params,
            });
        } catch(err) {
            let paramsJson = null;
            try {
                paramsJson = JSON.stringify(params)
            } catch (ignored) {
            }
            log.error('error while screenshoting with options: ' + paramJson + ' with err: ' + err);
        }
    }
    _screenshot(params) {
        
        // Start the Chrome Debugging Protocol
        this.client = await CDP();
        // Extract used DevTools domains.
        const {DOM, Emulation, Network, Page, Runtime} = this.client;

        // Enable events on domains we are interested in.
        await Page.enable();
        await DOM.enable();
        await Network.enable();
        
        const {
            userAgent,
            viewportWidth,
            viewportHeight,
            url,
            delay,
            format,
            fullPage,
            output,
        } = params;

        // If user agent override was specified, pass to Network domain
        if (userAgent) {
            await Network.setUserAgentOverride({userAgent});
        }

        // Set up viewport resolution, etc.
        const deviceMetrics = {
            width: viewportWidth,
            height: viewportHeight,
            deviceScaleFactor: 0,
            mobile: false,
            fitWindow: false,
        };
        await Emulation.setDeviceMetricsOverride(deviceMetrics);
        await Emulation.setVisibleSize({
            width: viewportWidth,
            height: viewportHeight,
        });

        // Navigate to target page
        await Page.navigate({url});

        // Wait for page load event to take screenshot
        await Page.loadEventFired();

        await timeout(delay);

        // If the `full` CLI option was passed, we need to measure the height of
        // the rendered page and use Emulation.setVisibleSize
        if (fullPage) {
            const {root: {nodeId: documentNodeId}} = await DOM.getDocument();
            const {nodeId: bodyNodeId} = await DOM.querySelector({
                selector: 'body',
                nodeId: documentNodeId,
            });
            const {model: {height}} = await DOM.getBoxModel({nodeId: bodyNodeId});

            await Emulation.setVisibleSize({width: viewportWidth, height: height});
            // This forceViewport call ensures that content outside the viewport is
            // rendered, otherwise it shows up as grey. Possibly a bug?
            await Emulation.forceViewport({x: 0, y: 0, scale: 1});
        }

        const screenshot = await Page.captureScreenshot({format});
        const buffer = new Buffer(screenshot.data, 'base64');
        await file.writeFile(output, buffer, 'base64');
        console.log('Screenshot saved');
        client.close();
        return buffer;
    }
}

export default Chromium;