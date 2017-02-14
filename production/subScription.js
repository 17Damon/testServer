'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pubsub = exports.subscriptionManager = undefined;

var _graphqlSubscriptions = require('graphql-subscriptions');

var _schema = require('./schema');

// the default PubSub is based on EventEmitters. It can easily
// be replaced with one different one, e.g. Redis

var pubsub = new _graphqlSubscriptions.PubSub();
var subscriptionManager = new _graphqlSubscriptions.SubscriptionManager({ schema: _schema.schema, pubsub: pubsub });

exports.subscriptionManager = subscriptionManager;
exports.pubsub = pubsub;