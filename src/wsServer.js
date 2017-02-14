/**
 * Created by zhubg on 2017/1/26.
 */
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { subscriptionManager } from './subScription';
const WS_PORT = 3001;
const httpServer = createServer((request, response) => {
    response.writeHead(404);
    response.end();
});

const server = new SubscriptionServer({subscriptionManager}, httpServer);

httpServer.listen(WS_PORT, () => console.log(
    `Websocket Server is now running on http://localhost:${WS_PORT}`
));
