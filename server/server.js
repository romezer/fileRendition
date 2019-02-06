const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

var conver = require('./models/convert');
const port = process.env.PORT || 3000;
var app = express();


app.use(bodyParser.json());


app.post('/convert',(req,res) =>{
	conver.run(req.body.filename, req.body.fileextension, req.body.documentState, req.body.contentversionid, req.body.url, req.body.token, req.body.objId, req.body.recordType, req.body.appSid, req.body.appKey).then((message) =>{
		res.status(200).send(message);
	}, (error) =>{
		res.status(400).send('bad request ' + JSON.stringify(error));
	});
});

app.get('/',(req,res) =>{
	res.status(200).send('Hi');
});







app.listen(port, ()=> {
	console.log(`Started on port ${port}`);
});