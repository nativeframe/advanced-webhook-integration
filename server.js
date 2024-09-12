// Import the express module
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const names = [
	'James',
	'John',
	'Robert',
	'Michael',
	'William',
	'David',
	'Richard',
];

const getRandomName = function getRandom() {
	return names[Math.floor(Math.random() * names.length)];
};

// Create an instance of express
const app = express();

// Define a port
const PORT = process.env.PORT || 3000;

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const broadcastBegin = async (req, res) => {
	console.log('integration broadcastBegin', {
    privateKey: req.params.privateKey
  });
	const resp = {
		broadcasterProfile: null, // optional profile name that customizes transcoder settings
		needsAuth: false, // set true if the broadcast needs authenticate for viewer playback
		publicKey: uuidv4(), // public key for the broadcast viewer playback
		userSlug: `user${getRandomName()}${Math.floor(Math.random() * 10)}`, // optional unique username for the broadcast
	};
	res.status(200).send(resp);
};

const broadcastEnd = async (req, res) => {
  console.log('integration broadcastEnd', {
    privateKey: req.params.privateKey
  });
	const resp = {
		status: 'OK',
		message: 'Broadcast removed',
	};
	res.status(200).send(resp);
};

const formatBegin = async (req, res) => {
  console.log('integration formatBegin', {
    privateKey: req.params.privateKey,
    encoding: req.params.encoding
  });
	const resp = {
		status: 'OK',
		message: 'Broadcast can continue',
	};
	res.status(200).send(resp);
};

const formatEnd = async (req, res) => {
  console.log('integration formatEnd', {
    privateKey: req.params.privateKey,
    encoding: req.params.encoding
  });
	const resp = {
		status: 'OK',
		message: 'Encoding removed',
	};
	res.status(200).send(resp);
};

const bulkPing = async (req, res) => {
  console.log('integration bulkPing', {
    privateKeys: req.body.privateKeys
  });
	const resp = {};
	// this simulates a "good" response for each key
	req.body.privateKeys.forEach((privateKey) => {
		resp[privateKey] = {
			statusCode: 200,
			status: 'OK',
			message: 'Broadcast can continue',
			needsAuth: false, // set true if the broadcast needs authenticate for viewer playback
			broadcasterProfile: null, // optional profile name that customizes transcoder settings
		};
	});
	return res.status(200).send(resp);
};

// called on broadcast start; ensure the privateKey is allowed to begin
app.put('/integration/v1/broadcast/:privateKey', broadcastBegin);

// called on broadcast end; mark stream as completed
app.delete('/integration/v1/broadcast/:privateKey', broadcastEnd);

// called when a transcoding variant becomes available
app.put('/integration/v1/broadcast/:privateKey/encoding/:encoding', formatBegin);

// called when a transcoding variant becomes unavailable
app.delete('/integration/api/v1/broadcast/:privateKey/encoding/:encoding', formatEnd);

// called periodically to check if broadcasts have changed state
app.put('/integration/v1/broadcast/ping/bulk', bulkPing);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

