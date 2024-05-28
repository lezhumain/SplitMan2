import {BehaviorSubject} from "rxjs";

export class FileWriter {
	static INFO: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	// static setInfo(info: any) {
	// 	FileWriter.INFO = info;
	// }
	private static fileEntry: any | null;

	static moveFile(): Promise<string> {
		let storageLocation = "";

		// @ts-ignore
		const window_device = window.device, window_cordova = window.cordova;

		// switch (window_device.platform) {
		// 	case "Android":
		// 		storageLocation = 'file:///storage/emulated/0/'; // TODO use android way
		// 		break;
		// 	case "iOS":
		// 		storageLocation = window_cordova.file.documentsDirectory;
		// 		break;
		// }

		switch (window_device.platform) {
			case "Android":
				storageLocation = window_cordova.file.externalRootDirectory;
				break;

			case "iOS":
				storageLocation = window_cordova.file.documentsDirectory;
				break;
		}

		return Promise.resolve(storageLocation);
		// return new Promise((resolve, reject) => {
		// 	var fileUri = "file:///data/user/0/com.arsdigitalia.myapp/files/files/MyApp/test.pdf";
		//
		// 	// @ts-ignore
		// 	const window_resolveLocalFileSystemURL = window.resolveLocalFileSystemURL;
		//
		// 	window_resolveLocalFileSystemURL(
		// 		fileUri,
		// 		function(fileEntry: any) {
		// 			const parentEntry = storageLocation + "Download";
		//
		// 			// move the file to a new directory and rename it
		// 			fileEntry.moveTo(parentEntry, "newFile.json", () => {resolve(parentEntry);}, fail);
		//
		// 		},
		// 		(e: Error) => {reject(e);}
		// 	);
		// });
	}

	static writeFile(dataObj: any, fileEntry?: any): Promise<void> {
		if(!fileEntry) {
			fileEntry = this.fileEntry;
		}

		// return $q(function (resolve, reject) {
		// 	// @ts-ignore
		// 	fileEntry.createWriter(function (fileWriter) {
		// 		fileWriter.onwriteend = function () {
		// 			resolve();
		// 		};
		// 		fileWriter.onerror = function (e: any) {
		// 			reject(e);
		// 		};
		// 		fileWriter.write(dataObj);
		// 	});
		// });
		return new Promise((resolve, reject) => {
			// @ts-ignore
			fileEntry.createWriter(function (fileWriter) {
				fileWriter.onwriteend = function () {
					resolve();
				};
				fileWriter.onerror = function (e: any) {
					reject(e);
				};
				fileWriter.write(dataObj);
			});
		});
	}

	static readFile(fileEntry?: any): Promise<any> {
		// return $q(function (resolve, reject) {
		// 	// @ts-ignore
		// 	fileEntry.createWriter(function (fileWriter) {
		// 		fileWriter.onwriteend = function () {
		// 			resolve();
		// 		};
		// 		fileWriter.onerror = function (e: any) {
		// 			reject(e);
		// 		};
		// 		fileWriter.write(dataObj);
		// 	});
		// });
		if(!fileEntry) {
			fileEntry = this.fileEntry;
		}

		return new Promise((resolve, reject) => {
			// // @ts-ignore
			// fileEntry.createWriter(function (fileWriter) {
			// 	fileWriter.onload = function (ev: any) {
			// 		resolve(ev);
			// 	};
			// 	fileWriter.onerror = function (e: any) {
			// 		reject(e);
			// 	};
			// 	fileWriter.write(dataObj);
			// });

			const readAsText = (file: any) => {
				var reader: FileReader = new FileReader();
				reader.onloadend = function(evt: ProgressEvent<FileReader>) {
					console.log("Read as text");
					resolve(evt?.target?.result);
				};
				reader.readAsText(file);
			};
			fileEntry.file((file: any) => {
				readAsText(file);
			}, (e: any) => {
				reject(e);
			})
		});
	}

	static tryThings() {
		// @ts-ignore
		window.requestFileSystem(1, 0, function (fs) {
			//var absPath = "file:///storage/emulated/0/";
			// @ts-ignore
			let absPath = window.cordova.file.externalRootDirectory;
			// @ts-ignore
			const fileDir = window.cordova.file.externalDataDirectory.replace(absPath, '');
			const fileName = "somename.txt";
			const filePath = fileDir + fileName;

			fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry: any) {
				FileWriter.fileEntry = fileEntry;
				// FileWriter.writeFile("test", fileEntry).then(function(){
				// 	//do something here
				// 	// FileWriter.INFO.next("file written");
				// 	FileWriter.readFile().then((result) => {
				// 		FileWriter.INFO.next("file content: " + result);
				// 	});
				// }, function(err0: any) {
				// 	// FileWriter.INFO.next(err0);
				// 	throw err0;
				// });

				// FileWriter.readFile().then((result) => {
				// 	FileWriter.INFO.next("file content: " + result);
				// }, function(err0: any) {
				// 	// FileWriter.INFO.next(err0);
				// 	throw err0;
				// });
			}, function(err: any) {
				// FileWriter.INFO.next(err);
				throw err;
			});
		}, function(err: any) {
			// FileWriter.INFO.next(err);
			throw err;
		});

	}

	static downloadFile(storageLocation: string, data: string, filename: string, mimeType: string): Promise<string> {
		const blob = new Blob([data], {
			type: mimeType
		});

		return new Promise((resolve, reject) => {
			const displayMsg = (msg: string) => {
				resolve(msg.replace(/\//g, "\n"));
			};
			const displayError = (msg: string) => {
				reject(new Error(msg));
			};

			let errorCallback = (err: {code: number}) => {
				displayError("Error " + err.code);
			};

			const folderPath = 'Download';

			// @ts-ignore
			window.resolveLocalFileSystemURL(storageLocation,
				function (fileSystem: any) {

					fileSystem.getDirectory(folderPath, {
							create: true,
							exclusive: false
						},
						function (directory: any) {

							//You need to put the name you would like to use for the file here.
							directory.getFile(filename, {
									create: true,
									exclusive: false
								},
								function (fileEntry: any) {
									fileEntry.createWriter(function (writer: any) {
										writer.onwriteend = function () {
											console.log("File written to downloads")
										};

										writer.seek(0);
										writer.write(blob); // Put the file, blob or base64 representation here.

										displayMsg("File downloaded.");
									}, errorCallback);
								}, errorCallback);
						}, errorCallback);
				}, errorCallback);
		});
	}
}