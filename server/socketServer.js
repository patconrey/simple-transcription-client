const { Server } = require("socket.io");
const ss = require('socket.io-stream');
const fs = require('fs');
const path = require('path')
const AWS = require('aws-sdk')
const { default: axios } = require('axios');

class Stack {
    constructor()
    {
        this.items = [];
    }
 
    push(element) {
		this.items.push(element);

		if (this.items.length > 5) {
			this.items.shift();

			// Needs to be a nested array of shape [1, length]
			const flattenedSignal = Array(this.items.flat());

			return flattenedSignal;
		}

		return null;
	}

    pop() {
		if (this.items.length == 0) {
			return null;
		}

		return this.items.pop();
	}

    peek() {
		return this.items[this.items.length - 1];
	}

    isEmpty() {
		return this.items.length === 0;
	}
}

let signalStack = new Stack()

// TODO!:
// 1) VAD on client side
// 2) Prefix input on model
// 3) W/ hop vs. w/ abutting
// 4) timestamps

// This actually looks like it prints out the correct values for
// each sample. The weird thing is that there's a 22-length preface
// on the output of this function that is the same for all buffers
// decoded by this. The samples from this function from index 22 onward
// match the samples obtained by reading in the audio file via torchaudio
const decodeBuffer = buffer => {
	return Array.from(
		{ length: buffer.length / 2 },
		(v, i) => buffer.readInt16LE(i * 2) / (2 ** 15)
	)
}

AWS.config.update({ region: 'us-west-2' });
if (process.env.NODE_ENV === 'development') {
	const credentials = new AWS.SharedIniFileCredentials({
		profile: 'default'
	});
	AWS.config.credentials = credentials
}
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})
  

const setupSocketServer = httpServer => {
	const io = new Server(httpServer, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"]
		  }
	});

	io.on('connect', (client) => {
		console.log(`Client connected [id=${client.id}]`);
		client.emit('server_setup', `Server connected [id=${client.id}]`);
	
		ss(client).on('stream-transcribe', function(stream, data) {
			const filename = path.basename(data.name.split('.')[0]);
			transcribeAudioStream(stream, filename, function(outputTranscript){
				// client.emit('transcript', outputTranscript)
				return
			});
		});
	});

	async function transcribeAudioStream(audio, filename, cb) {
		parts = [];
		audio.on('data', function(chunk) {
			parts.push(chunk);
		})
	
		const end = new Promise(function(resolve, reject) {
			audio.on('end', function() {
				const newBuffer = Buffer.concat(parts);
				resolve(newBuffer)
			})
		})
		const audioBufferObject = await end;

		// THIS WORKS!
		const floatData = decodeBuffer(audioBufferObject);
		const flattenedSignal = signalStack.push(floatData);

		if (flattenedSignal) {
			// console.log(flattenedSignal, flattenedSignal.length)
			// Post segment to ASR engine
			const startTime = performance.now();
			axios.post('http://ec2-18-236-207-185.us-west-2.compute.amazonaws.com:8000/v2/models/whisper_openai/versions/1/infer', {
			inputs: [
				{
					name: 'wave',
					shape: [1, flattenedSignal[0].length],
					datatype: 'FP32',
					data: flattenedSignal
				}
			]
		})
		.then(function (response) {
			// console.log(response);
			const endTime = performance.now();
			console.log(endTime - startTime, response.data.outputs[0].data[0]);
		})
		.catch(function (error) {
			console.error(error);
		});
		}
	
		const date_ob = new Date();

		// current date
		const date = ("0" + date_ob.getDate()).slice(-2);
		const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
		const year = date_ob.getFullYear();
		const hours = date_ob.getHours();
		const minutes = date_ob.getMinutes();
		const seconds = date_ob.getSeconds();
		const filenameToSave = `${filename}_${year}-${month}-${date}_${hours}-${minutes}-${seconds}.wav`
		fs.writeFile(filenameToSave, audioBufferObject, "binary", () => null);
	};
}

exports.setupSocketServer = setupSocketServer;
