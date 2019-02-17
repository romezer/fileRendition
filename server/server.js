const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

var conver = require('./models/convert');
var awsconver = require('./models/awsConvert');
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

app.post('/convert2',(req,res) =>{
	conver.run(req.body.filename, req.body.fileextension, req.body.documentState, req.body.contentversionid, req.body.url, req.body.token, req.body.objId, req.body.recordType, req.body.appSid, req.body.appKey).then((message) =>{
		res.status(200).send(message);
	}, (error) =>{
		res.status(400).send('bad request ' + error);
	});
});

app.get('/',(req,res) =>{
	res.status(200).send({status: 'OK'});
});

// app.post('/start',(req,res) =>{
// 	awsconver.uploadSignaturePageToS3(req.body.token, req.body.objId, req.body.recordType, req.body.documentState, '595;841', 'Test.docx', req.body.url).then((message) =>{
// 		console.log('sucsses: ' + message);
// 		res.status(200).send(message);
// 	},(error) =>{
// 		console.log('Error: ' + error);
// 		res.status(400).send('bad request ' + JSON.stringify(error));
// 	})
// });

// app.post('/getFile',(req,res) =>{
// 	awsconver.uploadFileAws(req.body.token, req.body.url, req.body.contentversionid).then((message) =>{
// 		console.log('sucsses: ' + message);
// 		res.status(200).send(message);
// 	}, (error) =>{
// 		console.log('Error: ' + error);
// 		res.status(400).send('bad request ' + JSON.stringify(error));
// 	})
// });

// app.post('/uploadFile',(req,res) =>{
// 	awsconver.uploadFromS3ToLocalDisk((req.body.filename, req.body.fileextension).then((message) =>{
// 		console.log('sucsses: ' + message);
// 		res.status(200).send(message);
// 	}, (error) =>{
// 		console.log('Error: ' + error);
// 		res.status(400).send('bad request ' + JSON.stringify(error));
// 	})
// })







app.listen(port, ()=> {
	console.log(`Started on port ${port}`);
});