// Description: Example integration server for broadcast webhooks
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

// list of example names
const names = [
  'James',
  'John',
  'Robert',
  'Michael',
  'William',
  'David',
  'Richard',
];

// Get a random name
const getRandomName = function getRandom() {
  return names[Math.floor(Math.random() * names.length)];
};

const broadcastBegin = async (req, res) => {
  console.log('integration broadcastBegin', {
	privateKey: req.params.privateKey,
  });
  const resp = {
	broadcasterProfile: null, // optional profile name that customizes transcoder settings
	needsAuth: false, // set true if the broadcast needs authentication for viewer playback
	publicKey: uuidv4(), // public key for the broadcast viewer playback
	userSlug: `user${getRandomName()}${Math.floor(Math.random() * 10)}`, // optional unique username for the broadcast
  };
  res.status(200).send(resp);
};

const broadcastEnd = async (req, res) => {
  console.log('integration broadcastEnd', {
	privateKey: req.params.privateKey,
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
	encoding: req.params.encoding,
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
	encoding: req.params.encoding,
  });
  const resp = {
	status: 'OK',
	message: 'Encoding removed',
  };
  res.status(200).send(resp);
};

const bulkPing = async (req, res) => {
  console.log('integration bulkPing', {
	privateKeys: req.body.privateKeys,
  });
  const resp = {};
  // this simulates a "good" response for each key
  (req.body.privateKeys || []).forEach((privateKey) => {
	resp[privateKey] = {
	  statusCode: 200,
	  status: 'OK',
	  message: 'Broadcast can continue',
	  needsAuth: false, // set true if the broadcast needs authentication for viewer playback
	  broadcasterProfile: null, // optional profile name that customizes transcoder settings
	};
  });
  return res.status(200).send(resp);
};

const tokenBulkValidate = async (req, res) => {
  console.log('integration tokenBulkValidate', {
	body: req.body,
  });
  const resp = {};
  const ttlSeconds = 2 * 60; // token is valid for 2 minutes
  const privateKeys = req.body ? Object.keys(req.body) : [];
  privateKeys.forEach((privateKey) => {
	// create a response entry for each privateKey
	resp[privateKey] = {};
	// ensure there is an array of tokens to validate
	const tokens = Array.isArray(req.body[privateKey]) ? req.body[privateKey] : [];
	tokens.forEach((token) => {
	  // insert an entry in the privateKey object for each token
	  resp[privateKey][token] = {
		statusCode: 200, // 200 the token is valid, 403 the token is invalid
		status: true,
		message: 'OK',
		ttl: ttlSeconds,
	  };
	});
  });
  return res.status(200).send(resp);
};

// Create express instance
const app = express();

// allow parsing JSON bodies
app.use(express.json());

// Define express port
const PORT = process.env.PORT || 3000;

// Called on broadcast start; Ensures a privateKey is allowed to begin a broadcast
app.put('/integration/v1/broadcast/:privateKey', broadcastBegin);

// Called on broadcast end; Mark broadcast as completed
app.delete('/integration/v1/broadcast/:privateKey', broadcastEnd);

// Called when a transcoding variant becomes available; Identifies that a player manifest is ready
app.put('/integration/v1/broadcast/:privateKey/encoding/:encoding', formatBegin);

// Called when a transcoding variant becomes unavailable
app.delete('/integration/v1/broadcast/:privateKey/encoding/:encoding', formatEnd);

// Called periodically to check if broadcasts have changed state
app.put('/integration/v1/broadcast/ping/bulk', bulkPing);

// Called when authentication is required for viewer playback
app.post('/integration/v1/broadcast/token/bulkvalidate', tokenBulkValidate);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

