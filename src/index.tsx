import * as React from "react";
import * as ReactDOM from "react-dom";
import { Hello } from "./components/Hello";
import { connect } from 'socket.io-client';

const socket = connect(`${location.protocol}//${location.host}/?token=123`);

socket.on('connect', function(){
    console.log("connect!");
});

socket.on('event', function(a, b, c) {
    console.log("event", a, b, c);
    socket.emit('message', {y:1});
});

ReactDOM.render(
    <Hello compiler="TypeScript" framework="React" />,
    document.getElementById("example")
);