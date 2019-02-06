		const fs = require('fs');
		const request = require('request');
		const assert = require('assert');
		var jsforce = require('jsforce');
		const { WordsApi, PostDocumentSaveAsRequest, SaveOptionsData } = require("asposewordscloud");
		const StorageApi = require('asposestoragecloud');
		const PdfApi  = require("asposepdfcloud");
		const config = {'appSid':'34613236-43e7-433a-b6d4-c8180930be7b','apiKey':'b233bab04dd42804b609510ad3f067aa' , 'debug' : true};
		var storageApi = new StorageApi(config);
		var pdfApi = new PdfApi(config);
		var totalPages;

		module.exports = {

		run: function(filename, fileextension, documentState, contentversionid, url, token, objId, recordType){
				return new Promise((resolve,reject) =>{
					this.getFileFromSF(token, contentversionid, url, filename, fileextension).then((message) =>{
						this.getSignaturePage(token, objId, recordType, documentState, '595;841', filename, url).then((message) =>{
							this.uploadFile(filename, fileextension).then((message) =>{
								this.uploadSignaturePage(filename).then((message) => {
									this.uploadTemplate().then((message) => {
										this.convertFileToPdf(filename, fileextension).then((message)=>{
											this.addSignaturePageToFile(filename + '.pdf', filename + '.pdf', filename + '_sign.pdf').then((message) =>{
												this.addWatermarkToTemplate(documentState).then((message) => {
													this.addtemplateStemp(filename).then((message) =>{
														this.addPageNumberingStamp(filename + '.pdf', totalPages).then((message) => {
															this.downloadFinalPdf(filename).then((message) =>{
																this.deleteFilesFromAspose(filename, fileextension).then((message) =>{
																	this.insertContentVersion(token, url, filename, 'pdf').then((message) =>{
																		this.updateDocRevision(token, objId, message, url).then((message) => {
																			resolve('Success!!!');
																			},(error) =>{
																				console.log(error);
																				return reject(error);
																			})
																			
																		},(error) =>{
																			console.log(error);
																			return reject(error);
																		})
																		
																},(error) =>{
																	console.log(error);
																	return reject(error);
																})
																
															}, (error) =>{
																console.log(error);
																return reject(error);
															})
															
														}, (error) =>{
															console.log(error);
															return reject(error);
														})
														
													}, (error) =>{
														console.log(error);
														return reject(error);
													})
													
												}, (error) => {
														console.log(error);
														return reject(error);
												})
												
											}, (error) =>{
												console.log(error);
												return reject(error);
											})
											
										},(error) =>{
											console.log(error);
											return reject(error);
										})
									}, (error) =>{
										console.log(error);
										return reject(error);
									});
								}, (error) =>{
									console.log(error);
									return reject(error);
								});
							}, (error) =>{
								console.log(error);
								return reject(error);
							})
							
						}, (error) =>{
							console.log(error);
							return reject(error);
						});
					}, (error) =>{
						console.log(error);
						return reject(error);
					})

			});
				
		},

		uploadSignaturePage: function(filename){
			return new Promise((resolve, reject) => {
				try {	
							
							storageApi.PutCreate(filename + '_sign.pdf', versionId=null, storage=null, file= 'uploads/' + filename + '_sign.pdf' , function(responseMessage) {
								if(responseMessage.code === 401){
									var err = 'Upload error';
										return reject(err);
								}
								resolve('File uploaded to aspose');
							});  

						}catch (e) {
						  return reject(e);
						}
			});
		},

		uploadFile: function (filename, fileextension){
			return new Promise((resolve, reject) => {
				var name = filename + '.' + fileextension;
				try {	
							
							storageApi.PutCreate(name, versionId=null, storage=null, file= 'uploads/' + name , function(responseMessage) {
								if(responseMessage.code === 401){
									var err = 'Upload error';
										return reject(err);
								}
									resolve('File uploaded to aspose');
								
								
							});  

						}catch (e) {
						  return reject(e);
						}
			});
		},

		uploadTemplate: function (){
			return new Promise((resolve,reject) =>{
				try {	
							
							storageApi.PutCreate('template.pdf', versionId=null, storage=null, file= 'uploads/template.pdf' , function(responseMessage) {
								if(responseMessage.code === 401){
									var err = 'Upload error';
										return reject(err);
								}
								resolve('File uploaded to aspose');
							});  

						}catch (e) {
						  return reject(e);
						}
			});
		},

		addWatermarkToTemplate: function (documentState){
			return new Promise((resolve,reject) =>{
				var stampBody = {
				'Value' : documentState,
				'Background' : false,
				'Type' : 'Text',
				"RotateAngle": 45,
				"TextAlignment": 2,
				"VerticalAlignment": 2,
				"HorizontalAlignment": 2,
				"Zoom": 1.5,
				"Opacity": 0.2,
			    "TextState": {
				    "FontSize": 50,
				    "ForegroundColor": {
				      "A": 0,
				      "R": 255,
				      "G": 0,
				      "B": 0
				    }
				  },
				};

				try{
					pdfApi.PutPageAddStamp('template.pdf', 1, null, null, stampBody, function(responseMessage) {		
					resolve('Water mark text added');			
					});
				}catch(e){
					return reject(e);
				}


			});
		},

		addSignaturePageToFile: function (name, mergefilename1, mergefilename2){
			return new Promise((resolve,reject) =>{
				var newName = name;
				var merge1 = mergefilename1;
				var merge2 = mergefilename2;
				var mergeDocumentsBody = {
						'List' : [merge1, merge2]
				};
				console.log('name: ' , newName);

				try {

								pdfApi.PutMergeDocuments(newName, null, null, mergeDocumentsBody, function(responseMessage){
									console.log('responseMessage: ' + JSON.stringify(responseMessage));
									resolve('Files merged');
								});

				}
				catch (e) 
				{
				  return reject(e);
				}
			});
		},

		convertFileToPdf: function (filename, fileextension){
			return new Promise((resolve,reject) =>{
				wordsApi = new WordsApi(config.appSid, config.apiKey);
				var request = new PostDocumentSaveAsRequest({
				name: filename + '.' + fileextension,
				saveOptionsData: new SaveOptionsData(
					{
					saveFormat: "pdf",
					fileName: filename + '.pdf'
					})
				});

				wordsApi.postDocumentSaveAs(request).then((result) => {    
					// console.log(result.body.code);   
					resolve('File converted to pdf'); 
					}).catch(function(err) {
						return reject(err);
				});
			});
		},

		addtemplateStemp: function (name){
			return new Promise((resolve,reject) =>{
				
				try{
					pdfApi.GetPages(name + '.pdf', null, null, function(responseMessage) {
						console.log('responseMessage: ' + JSON.stringify(responseMessage));
						totalPages = responseMessage.body.Pages.List.length;
						console.log('totalPages: ' + totalPages);

						var pageStampCounter = 0;
					var stampBody = {
													'Background' : false,
													'Type' : 'Page',
													'PageIndex': 1,
													'YIndent': 10,
													'FileName' : 'template.pdf'
												}
					for(var i = 1 ; i <= totalPages ; i++){
						let ii = i;
						setTimeout(function(){
							pdfApi.PutPageAddStamp(name + '.pdf', ii, null, null, stampBody, function(responseMessage) {
										assert.equal(responseMessage.status, 'OK');
										pageStampCounter ++;
										console.log('pageStampCounter: ' + pageStampCounter);
										if(pageStampCounter === totalPages){
											resolve('All template stamp added');
										}
									});
						},i*1000)
					}
					});
				}catch(e){
					return reject(e);
				}
			});
		},

		addPageNumberingStamp: function(fileName, totalPages){
			return new Promise((resolve, reject) => {
				try{
						for(var i = 1 ; i <= totalPages ; i ++){
							let ii = i;
							setTimeout(function(){
								var stampBody = {
								'Value': 'Page # of ' + totalPages,
								'Type': 'PageNumber',
								'Background' : false,
								'BottomMargin': 0.0,
								'topMargin': 0.0,
								'LeftMargin': 0,
								'Opacity': 1.0,
								'RightMargin': 0,
								'Rotate': '0',
								'RotateAngle': 0,
								'VerticalAlignment': '0',
								'HorizontalAlignment': '0',
								'XIndent': 0,
								'Zoom': 1.0,
								'TextAlignment': '0',
								'PageIndex': 0,
								'StartingNumber': 1
							}
							pdfApi.PutPageAddStamp(fileName, ii, null, null, stampBody, function(responseMessage) {
								assert.equal(responseMessage.status, 'OK');
								if(ii === totalPages){
											resolve('All page number stamp added');
										}
							});
							},1000*ii)
							
						}
				}catch(e){
					return reject(e);
				}
			});
		},

		downloadFinalPdf: function(fileName){
			return new Promise((resolve, reject) => {
				try{
						storageApi.GetDownload(fileName + '.pdf', null, null, function(responseMessage) {
						assert.equal(responseMessage.status, 'OK');
						var outfilename =  fileName + '.pdf';
						var writeStream = fs.createWriteStream('uploads/' + outfilename);
						writeStream.write(responseMessage.body);
						resolve('Final Document downloaded');
						});
				}catch(e){
					return reject(e);
				}
			});
		},

		deleteFilesFromAspose: function(fileName, extention){
			return new Promise((resolve,reject)=>{
				try{
					
					// storageApi.DeleteFile(fileName + '.pdf' , null, null, function(responseMessage) {
						
					// });
					// storageApi.DeleteFile(fileName + '_merge.pdf' , null, null, function(responseMessage) {
						
					// });
					// storageApi.DeleteFile(fileName + '.' +  extention, null, null, function(responseMessage) {
						
					// });
					// storageApi.DeleteFile('template.pdf' , null, null, function(responseMessage) {
						
					// });
					// storageApi.DeleteFile(fileName + '_sign.pdf' , null, null, function(responseMessage) {
						
					// });
					resolve('All aspose files deleted');
					// while(deleteFile && deleteTemplate && deleteSignature){
					// 	resolve('All aspose files deleted');
					// }

				}catch(e){
					return reject(e);
				}
			})
		},

		getFileFromSF: function(token, contentversionid, url, filename, fileextension){
			return new Promise((resolve, reject) => {
				 var conn = new jsforce.Connection({
				  instanceUrl : url,
				  accessToken : token
				});

				conn.query(`SELECT Id,Title,FileExtension, VersionData FROM ContentVersion WHERE Id = '${contentversionid}' LIMIT 1`  , function(err, res){
			 	if(err){console.log(err);return reject(err)}
				 	var fileOut  = fs.createWriteStream('uploads/' + res.records[0].Title + '.' + res.records[0].FileExtension);
				 	conn.sobject('ContentVersion').record(res.records[0].Id).blob('VersionData').pipe(fileOut);
				 	resolve(res.records[0].Title + '.' + res.records[0].FileExtension);
			 	});
			});
		},

		getSignaturePage: function(token, objid, recordType, documentState, pageSize, filename, uri){
			return new Promise((resolve, reject) => {
			  var options = {
			  method: 'GET',
		  	  url: uri + `/services/apexrest/CompSuite/getSignaturePage?recordType=${recordType}&objid=${objid}
		  	  &pageSize=${pageSize}&documentState=${documentState}`,
			  headers: {
			    'Content-Type': 'application/json',
			    'Authorization': 'Bearer ' + token,
			    'Access-Control-Allow-Origin': '*'
			  }
			};

			function callback(error, response, body) {
				 if (!error && response.statusCode == 200) {

		    		fs.writeFileSync('uploads/' + filename + '_sign' + '.pdf', body,'base64');
		    		resolve('Signature page saved');
				 }else{
				 	return reject(error);
				 }
			}
			request(options, callback);
			});
		},

		insertContentVersion: function(token, url, filename, fileextension){
						return new Promise((resolve, reject) => {
			  var conn = new jsforce.Connection({
			  instanceUrl : url,
			  accessToken : token
			});

			 var fileOnServer = 'uploads/' + filename +'.' + fileextension;

			  fs.readFile(fileOnServer, function (err, filedata) {
		    if (err){
		        console.error(err);
		        return reject(err);
		    }
		    else{
		    	var base64data = new Buffer(filedata).toString('base64');
		    	 conn.sobject('ContentVersion').create({ 
		                Title : filename,
		                VersionData: base64data,
		                PathOnClient : filename + fileextension,  
		            }, 
		            function(err, ret) {
		                 if (err || !ret.success) {
		                 	return reject(err);
		                 }
		                 console.log("Created record id : " + ret.id);
		                 resolve(ret.id);
		        });

		    }

			});
		});
		},

		updateDocRevision: function(token, objid, conid, uri){
			return new Promise((resolve, reject) => {
				var options = {
				  method: 'POST',
			  	  url: `${uri}/services/apexrest/CompSuite/updateDocumentRevisionWithPdfLink?objid=${objid}&conid=${conid}`,
				  headers: {
				    'Content-Type': 'application/json',
				    'Authorization': 'Bearer ' + token,
				    'Access-Control-Allow-Origin': '*'
				  }
				};
				function callback(error, response, body) {
				 if (!error && response.statusCode == 200) {

		    		resolve('updateDocRevision success');
				 }else{

				 	return reject(error);
				 }
			}
			request(options, callback);
			});
		}
	};

