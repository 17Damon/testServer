'use strict';

var _http = require('http');

var _subscriptionsTransportWs = require('subscriptions-transport-ws');

var _subScription = require('./subScription');

var WS_PORT = 3001; /**
                     * Created by zhubg on 2017/1/26.
                     */

var httpServer = (0, _http.createServer)(function (request, response) {
    response.writeHead(404);
    response.end();
});

var server = new _subscriptionsTransportWs.SubscriptionServer({ subscriptionManager: _subScription.subscriptionManager }, httpServer);

httpServer.listen(WS_PORT, function () {
    return console.log('Websocket Server is now running on http://localhost:' + WS_PORT);
});