		const fs = require('fs');
		const request = require('request');
		const assert = require('assert');
		var parseString = require('xml2js').parseString;
		var jsforce = require('jsforce');
		const { WordsApi, PostDocumentSaveAsRequest, SaveOptionsData } = require("asposewordscloud");
		const StorageApi = require('asposestoragecloud');
		const PdfApi  = require("asposepdfcloud");
		var config;
		var storageApi;
		var pdfApi;
		// const config = {'appSid':'34613236-43e7-433a-b6d4-c8180930be7b','apiKey':'b233bab04dd42804b609510ad3f067aa' , 'debug' : true};
		// var storageApi = new StorageApi(config);
		// var pdfApi = new PdfApi(config);

		var pagesObj = [];
		var templateArr= [];
		var pageIdToTeplateMap = [];
		var Set = require('Set');
		var sizeSet = new Set();
		var totalPages;

		module.exports = {

		run: function(filename, fileextension, documentState, contentversionid, url, token, objId, recordType, appSid, appKey){

				return new Promise((resolve,reject) =>{
					 config = {};
					 config = {'appSid':appSid,'apiKey':appKey , 'debug' : true};
					 storageApi = new StorageApi(config);
					 pdfApi = new PdfApi(config);
					 totalPages = 0;
					 pagesObj = [];
					 templateArr= [];
					 pageIdToTeplateMap = [];
					 sizeSet = new Set();
					this.getFileFromSF(token, contentversionid, url, filename, fileextension).then((message) =>{
						this.getSignaturePage(token, objId, recordType, documentState, '595;841', filename, url).then((message) =>{
							this.uploadFile(filename, fileextension).then((message) =>{
								this.uploadSignaturePage(filename).then((message) => {
									this.convertFileToPdf(filename, fileextension).then((message)=>{
										this.addSignaturePageToFile(filename +'.pdf', filename + '.pdf', filename + '_sign.pdf').then((message)=>{
											this.uploadTemplate(filename + '.pdf', totalPages, filename, sizeSet, token, objId, recordType, documentState, url, appSid, appKey, templateArr).then((message) => {
													this.addTepmlatesStamp(filename, totalPages , pageIdToTeplateMap).then((message) =>{
														this.addPageNumberingStamp(filename + '.pdf', totalPages).then((message) => {
															this.downloadFinalPdf(filename).then((message) =>{
																this.deleteFilesFromAspose(filename, fileextension, templateArr).then((message) =>{
																	this.insertContentVersion(token, url, filename, 'pdf').then((message) =>{
																		this.updateDocRevision(token, objId, message, url).then((message) => {
																			this.deleteFilesFreomServer(filename, fileextension, templateArr).then((message) =>{
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

										},(error) =>{
											console.log(error);
											return reject(error);
										})
											},(error) =>{

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
						  return reject('uploadSignaturePage ' + e);
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
										return reject('uploadFile ' + err);
								}
									resolve('File uploaded to aspose');
								
								
							});  

						}catch (e) {
						  return reject('uploadFile ' + e);
						}
			});
		},

		uploadTemplate: function (name, totalPages, filename, sizeSet, token, objid, recordType, documentState, uri, appSid, appKey, templateArr){
			return new Promise((resolve,reject) =>{

				this.getTotalPages(name).then((message) =>{
					this.getPageInfo(name, message, filename).then((message) =>{
						this.getAllTemplates(sizeSet, token, objid, recordType, documentState, uri, filename).then((message) =>{
							this.uploadTemplates(appSid, appKey, templateArr).then((message) =>{
								this.addWaterMarkToTemplates(templateArr, documentState).then((message) =>{
									resolve('templates uploaded successfully');
								},(error) =>{
									console.log(error);
									return reject('uploadTemplate ' + error);
								})
							},(error) =>{
								console.log(error);
								return reject('uploadTemplate ' + error);
							})
						}, (error) =>{
							console.log(error);
							return reject('uploadTemplate ' + error);
						})
					},(error) =>{
						console.log(error);
						return reject('uploadTemplate ' + error);
					})
				},(error) =>{
					console.log(error);
					return reject('uploadTemplate ' + error);
				})


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
					return reject('addWatermarkToTemplate ' + e);
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
				  return reject('addSignaturePageToFile ' + e);
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
					resolve('File converted to pdf'); 
					}).catch(function(err) {
						return reject('convertFileToPdf ' + err);
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
					return reject('addtemplateStemp ' + e);
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
					return reject('addPageNumberingStamp ' + e);
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
					return reject('downloadFinalPdf ' + e);
				}
			});
		},

		deleteFilesFromAspose: function(fileName, extention, templateArr){
			return new Promise((resolve,reject)=>{
				try{
					console.log('fileName: ' + fileName);
					console.log('extention: ' + extention);
					console.log('delete templateArr: ' + JSON.stringify(templateArr));
					storageApi.DeleteFile(fileName + '.pdf' , null, null, function(responseMessage) {
						console.log('delete pdf: ' + responseMessage.body.Status);
						if(responseMessage.body.Status != 'OK'){
							 reject('delete pdf failed: ' + responseMessage.body.Status);
						}
					});
					storageApi.DeleteFile(fileName + '_sign.pdf' , null, null, function(responseMessage) {
						console.log('delete sign: ' + responseMessage.body.Status);
						if(responseMessage.body.Status != 'OK'){
							 reject('delete sign failed: ' + responseMessage.body.Status);
						}
					});
					storageApi.DeleteFile(fileName + '.' +  extention, null, null, function(responseMessage) {
						console.log('delete file: ' + responseMessage.body.Status);
						if(responseMessage.body.Status != 'OK'){
							 reject('delete file failed: ' + responseMessage.body.Status);
						}
					});
					for(var i = 0 ; i < templateArr.length ; i ++){
						let ii = i;
						setTimeout(function(){
							storageApi.DeleteFile(templateArr[ii], null, null, function(responseMessage) {
							console.log('delete template: ' + templateArr[ii] + ' | ' + responseMessage.body.Status);
							if(responseMessage.body.Status != 'OK'){
								 reject('delete template failed: ' + responseMessage.body.Status);
							}
							if(ii === templateArr.length - 1){
											resolve('All aspose files deleted');
										}
							})
						},ii*1000)

						
					}
					resolve('All aspose files deleted');
				}catch(e){
					return reject('deleteFilesFromAspose ' + e);
				}
			})
		},

		deleteFilesFreomServer: function(fileName, fileExtention, templateArr){
			return new Promise((resolve,reject)=>{
				fs.unlink('uploads/' + fileName + '.' + fileExtention, (err) => {
				  if (err){
				  	return reject('deleteFilesFreomServer ' + err);
				  }
				});
				// fs.unlinkSync('uploads/' + fileName + '.pdf');
				

				fs.unlink('uploads/' + fileName + '_sign.pdf' , (err) => {
				  if (err){
				  	return reject('deleteFilesFreomServer ' + err);
				  }
				});

				fs.unlink('uploads/' + fileName + '.pdf' , (err) => {
				  if (err){
				  	 reject('deleteFilesFreomServer ' + err);
				  }
				});


				for(var i = 0 ; i < templateArr.length ; i ++){
					fs.unlink('uploads/' + templateArr[i] , (err) => {
					  if (err){
					  	return reject('deleteFilesFreomServer ' + err);
					  }
					});
				}
				resolve('All server files deleted');


			})
		},

		getFileFromSF: function(token, contentversionid, url, filename, fileextension){
			return new Promise((resolve, reject) => {
				 var conn = new jsforce.Connection({
				  instanceUrl : url,
				  accessToken : token
				});

				conn.query(`SELECT Id,Title,FileExtension, VersionData FROM ContentVersion WHERE Id = '${contentversionid}' LIMIT 1`  , function(err, res){
			 	if(err){console.log(err);return reject('getFileFromSF ' + err)}
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
				 	return reject('getSignaturePage ' + error);
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
		        return reject('insertContentVersion ' + err);
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
		                 	return reject('insertContentVersion' + err);
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

				 	return reject('updateDocRevision ' + error);
				 }
			}
			request(options, callback);
			});
		},

		getTotalPages: function(name){
			return new Promise((resolve, reject) => {
				try{
					pdfApi.GetPages(name, null, null, function(responseMessage) {
						console.log(JSON.stringify(responseMessage));
						var pages = responseMessage.body.Pages.List.length;
						console.log('pages: ' + pages);
						totalPages = pages;
						resolve(pages);
					});
				}catch(e){
					return reject('getTotalPages ' + e);
				}
				
			});
		},

		getPageInfo: function(name, totalPages, filename){
				return new Promise((resolve, reject) => {
	

				console.log('getPageInfo totalPages: ' + totalPages);
				console.log('Name: ' + name);
				console.log('filename: ' + filename);
				try{
					for(var j = 1 ; j <= totalPages ; j ++){
						let jj = j;
						console.log('index: ' + jj);
						pdfApi.GetPage(name, jj, null, null, function(responseMessage) {

						parseString(responseMessage.body, function (err, result) {
						var temp = { page: jj,
									 size: result.SaaSposeResponse.Page[0].Rectangle[0].Width[0] + ';' + result.SaaSposeResponse.Page[0].Rectangle[0].Height[0]
						 			 };
						pagesObj.push(temp);
						var temp2 = {page: jj,
									teplate: filename + '_' + result.SaaSposeResponse.Page[0].Rectangle[0].Width[0] + ';' + result.SaaSposeResponse.Page[0].Rectangle[0].Height[0]}
						pageIdToTeplateMap.push(temp2);
						var sizes = result.SaaSposeResponse.Page[0].Rectangle[0].Width[0] +';' + result.SaaSposeResponse.Page[0].Rectangle[0].Height[0];
						sizeSet.add(sizes);
						 console.log('pagesObj: ' + JSON.stringify(pagesObj));
						 console.log('sizeSet: ' + JSON.stringify(sizeSet));
						if(pagesObj.length === totalPages){
							resolve('Page Info done');
						}
						})


						});	
					}

				}catch(e){
					return reject('getPageInfo ' + e);
				}
			});
		},

		getAllTemplates: function(sizeSet, token, objid, recordType, documentState, uri, filename){
			return new Promise((resolve, reject) => {
				console.log('getAllTemplates filename: ' ,filename);
				console.log('getAllTemplates sizeSet: ' + JSON.stringify(sizeSet));
				var counter = 0;
				var setString = sizeSet.toString();
				var setPureSize = setString.substring(1,setString.length - 1);
				var setArr = setPureSize.split(',');
				console.log('getAllTemplates setArr: ' + setArr);
				for(var k = 0 ; k < setArr.length ; k ++){
					let ii = k;
					console.log('getAllTemplates iterate page size: ' + setArr[k]);

					this.foo(token, objid, recordType, documentState, setArr[k], uri, filename).then((message) => {
					console.log(message + ': ' + ii);
					counter = counter + message;
					console.log('counter: ' + counter);
					if(counter === setArr.length){
						resolve('All templates saved');
					}
					}, (error) => {
						return reject('getAllTemplates ' + error);
					});
				}

			});
		},

		foo: function(token, objid, recordType, documentState, pageSize, uri, filename){
			return new Promise((resolve, reject) => {
				var options = {
				  method: 'GET',
			  	  url: `${uri}/services/apexrest/CompSuite/getTemplate?recordType=${recordType}&objid=${objid}
			  	  &pageSize=${pageSize}&documentState=${documentState}`,
				  headers: {
				    'Content-Type': 'application/json',
				    'Authorization': 'Bearer ' + token,
				    'Access-Control-Allow-Origin': '*'
				  }
				};

				function callback(error, response, body) {
					 if (!error && response.statusCode == 200) {
					 	fs.writeFileSync('uploads/' + filename + '_' + pageSize + '.pdf', body,'base64');
					 	templateArr.push(filename + '_' + pageSize + '.pdf');
		    			resolve(1);
					 }else{
					 	return reject('foo ' + error);
					 }
				}
				request(options, callback);
			});
		},

		uploadTemplates: function(appSid, appKey, templateArr){
			return new Promise((resolve, reject) => {
				var AppSID = appSid;
				var AppKey = appKey;
				var count = 0;
				for(var j = 0 ; j < templateArr.length ; j++){
					try{
						storageApi.PutCreate(templateArr[j], versionId=null, storage=null, file= 'uploads/' + templateArr[j] , function(responseMessage) {
							if(responseMessage.code === 401){
							var err = 'Upload error';
								return reject('uploadTemplates ' + err);
						}
						 count ++;
						 console.log('count: ' + count);
						if(count === templateArr.length - 1){
							resolve('All templates uploaded');
						}
						});
					}catch(e){
						return reject('uploadTemplates ' + e);
					}
				}
			});
		},

		addWaterMarkToTemplates: function(templateArr, documentState){
			return new Promise((resolve,reject) => {
				console.log('templateArr: ' + templateArr);
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
					for(var i = 0 ; i < templateArr.length ; i ++){
						let ii = i;
						setTimeout(function(){
							pdfApi.PutPageAddStamp(templateArr[ii], 1, null, null, stampBody, function(responseMessage) {
								if(ii === templateArr.length - 1){
									resolve('Water mark text added');
								}
							});
						}, 1000*ii)
					}
				}catch(e){
					return reject('addWaterMarkToTemplates ' + e);
				}

			});
		},

		addTepmlatesStamp: function(fileName, totalPages , pageIdToTeplateMap){
			return new Promise((resolve, reject) => {
				console.log('pageIdToTeplateMap: ' + JSON.stringify(pageIdToTeplateMap));
				console.log('fileName: ' + fileName);
				console.log('totalPages: ' + totalPages);
				try{
					var pageStampCounter = 0;
					for(var i = 1 ; i <= totalPages ; i ++){
						let ii = i;
						for(var j = 0 ; j < pageIdToTeplateMap.length ; j ++){
							let jj = j;
							console.log('compare: ' + ' ii = ' + ii + ' pageIdToTeplateMap[jj].page = ' + pageIdToTeplateMap[jj].page);
							if(ii === pageIdToTeplateMap[jj].page){
								console.log('pageIdToTeplateMap[j]',pageIdToTeplateMap[jj]);
								
								setTimeout(function(){
									var template = pageIdToTeplateMap[jj].teplate;
									console.log('template',template);
									var stampBody = {
													'Background' : false,
													'Type' : 'Page',
													'PageIndex': 1,
													'YIndent': 10,
													'FileName' : template + '.pdf'
												}
								console.log('stampBody: ' + JSON.stringify(stampBody));
									console.log('page num: ' + ii);
									pdfApi.PutPageAddStamp(fileName + '.pdf', ii, null, null, stampBody, function(responseMessage) {
										console.log('$$$responseMessage.status: ' + responseMessage.status);
										assert.equal(responseMessage.status, 'OK');
										pageStampCounter ++;
										console.log('pageStampCounter: ' + pageStampCounter);
										if(pageStampCounter === totalPages){
											resolve('All template stamp added');
										}
									});
								},1000*ii);

							}
						}
					}
				}catch(e){
					return reject('addTepmlatesStamp ' + e);
				}
			});
		},


	};

