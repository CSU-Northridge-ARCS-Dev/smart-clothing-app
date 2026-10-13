// react-native-webview needs native code; in tests the WebView renders as a
// plain View that keeps its props (so tests can read source.html).
const React = require("react");
const { View } = require("react-native");

const WebView = (props) => React.createElement(View, props);

module.exports = { WebView, default: WebView, __esModule: true };
