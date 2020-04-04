const express = require('express');
const app = express();
const server = require('http').createServer(app);

app.use(express.static(__dirname + '/static'));

app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/static/bubbles.html');
});

app.listen(5000);