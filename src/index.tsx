import * as React from "react";
import * as ReactDOM from "react-dom";
// import * as pack from "bin-pack";
import SocketClient from './socketClient';
import { Root } from "./components/root";
import * as toTree from '../astQuery/tree';

const socket = new SocketClient(`${location.protocol}//${location.host}/?token=abc`);

socket.on('data', data => {
    const tree = toTree(data);

    ReactDOM.render(
        <Root tree={tree} />,
        document.getElementById("root")
    );

    setTimeout(() => {
        const hash = location.hash.replace('#', '');
        const el = document.querySelector(`a[id = "${hash}"]`);
        console.log(hash);
        el && el.scrollIntoView();
    }, 0);
});