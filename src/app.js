import express from 'express';
import __dirname from './utils.js';
import expressHandlebars from "express-handlebars";
import Handlebars from "handlebars";
import ProductRouter from './router/product.routes.js';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access'
import CartRouter from './router/cart.routes.js';
import viewsRouter from './router/views.routes.js';
import { Server } from 'socket.io';
import ChatManager from './dao/ChatManager.js';
import mongoose from 'mongoose';

const app = express();
const PORT = 8080;
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor express puerto: ${PORT}`);
});
const socketServer = new Server(httpServer);
const CM = new ChatManager();

app.set('socketServer', socketServer)

//Handlebars
app.engine("handlebars", expressHandlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname))
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/product/", ProductRouter);
app.use("/api/cart/", CartRouter);
app.use("/", viewsRouter);

mongoose.connect("mongodb+srv://octavioreca1:octavio123@cluster0.e63otbo.mongodb.net/ecommerce?retryWrites=true&w=majority")

mongoose.connection.on("connected", () => {
    console.log("Conectado a MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error("Error conectando a MongoDB:", err);
});

socketServer.on("connection", (socket) => {
    console.log("Nueva Conexión!");
    socket.on("newMessage", async (data) => {
        await CM.createMessage(data);
        const messages = await CM.getMessages();
        socket.emit("messages", messages);
    });

    socket.on("message", (data) => {
        console.log(data);
        socket.emit("socket_individual", "Hola desde el cliente #1")
    });
});
