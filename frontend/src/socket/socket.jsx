import { io } from "socket.io-client";

//create socket instance using the proxy (no need for null URL)
const socket = io();

export const initSocket = () => {
    console.log("Inicializando socket...");

    //check of socket is connected
    if (socket.connected) {
        console.log("estou conectado");
    } else {
        console.log("tentando conectar");
    }

    //listen for connection events
    socket.on('connect', () => {
        console.log("Conectado ao servidor de sockets com ID:", socket.id);
    });

    socket.on('disconnect', () => {
        console.log('desconectado do servidor de sockets');
    });

    return socket;
};

export const socketAddListener = (listener = "", callback = () => {}) => {
    socket.on(listener, callback);
};

export const socketRemoveListener = (listener = "", callback = () => {}) => {
    socket.off(listener, callback);
};