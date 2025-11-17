
# Webhook API Documentation

## Broadcast Begin

Called on broadcast start; Ensures a broadcast is allowed to begin by `privateKey`

```js
PUT - {host}/integration/v1/broadcast/{privateKey}

// Request payload:
{
  clientIP: '0.0.0.0',           // IP of the broadcaster
  clientAgent: 'clientAgent',    // Client agent
  clientReferrer: 'staging',     // Client referrer (aka: project name)
  clientEncoder: 'FMLE',         // Description of the broadcast encoder being used
  originURL: 'rtmp://',          // URL for playback from the origin
  manifest: 'http://',           // URL for viewer playback
}

// Response: 200
{
  userSlug: 'userHenry82',       // slugified unique user name
  broadcasterProfile: 'high',    // Profile name to use for transcoding (optional)
  needsAuth: true,               // Authorization state (indicates if authorization is required for playback)
  publicKey: 'foo',              // The key to use when calling for the manifest for viewer playback
}

```

## Broadcast End

Called on broadcast end; Mark stream as completed by `privateKey`

```js
DELETE - {host}/integration/v1/broadcast/{privateKey}

// Response: 200
{
  status: 'OK',
  message: 'Broadcast removed',
}

```

## Format Begin

Called when a `format` encoding (aka: variants) becomes available

```js
PUT - {host}integration/v1/broadcast/{streamKey}/encoding/{format}
// Note: streamKey is sometimes referred to as privateKey

// Request payload:
{
  publicKey: 'foo',              // The key to use when calling for the manifest for viewer playback
  videoCodec: 'mp4',             // Video codec for the format
  audioCodec: 'aac',             // Audio codec for the format
  manifest: 'http://',           // URL for viewer playback
  location: 'http://',           // URL to directly playback or pull this format for internal use
  clientEncoder: 'FMLE',         // Description of the broadcast encoder being used
  encodings: [
    {
      isOriginal: true,          // Indication if this is the origin stream (not an encoded variant)
      videoWidth: 640,           // Video resolution width
      videoHeight: 360,          // Video resolution height
      videoKbps: 1200,           // Video streaming rate in kbps
      audioKbps: 96,             // Audio streaming rate in kbps
      videoPts: 12478,           // Current video presentation timestamp
      audioPts: 12478,           // Current audio presentation timestamp
      collected: 12478,          // Timestamp stats were collected
      location: 'http://',       // URL to directly playback or pull this format for internal use
    }
  ]
}

// Response: 200
{
  status: 'OK',
  message: 'Broadcast can continue',
}

```

## Format End

Called when a `format` encoding (aka: variants) becomes unavailable

```js
DELETE - {host}/integration/v1/broadcast/{streamKey}/encoding/{format}
// Note: streamKey is sometimes referred to as privateKey

// Response: 200
{
  status: 'OK',
  message: 'Encoding removed',
}

```

## Bulk Ping

Called periodically to check if broadcasts have changed state by `privateKey`

```js
PUT - {host}/integration/v1/broadcast/ping/bulk

// Note: This route can be used to check for multiple streams at the same time
// by passing an array of privateKeys.

// Request payload:
{
  privateKeys: ['foo', 'bar']
}

// Response: 200
{
  foo: {
    statusCode: 200,             // Status code for individual stream (privateKey 'foo')
    status: 'OK',
    message: 'Broadcast can continue',
    needsAuth: true,             // Authorization state (indicates if authorization is required for playback)
    broadcasterProfile: 'high'   // Profile name to use for transcoding (optional)
  },
  bar: {
	statusCode: 403,             // Status code for individual stream (privateKey 'bar')
    status: 'STOP',
    message: 'Amin called stop',
    needsAuth: true,             // Authorization state (indicates if authorization is required for playback)
  }
}

```

## Bulk Validate (Viewer Authorization)

Called by the auth service to check access for multiple `privateKeys` and `accessTokens` by sending a hash of privateKeys mapping to an array of tokens to check

```js
POST - {host}/integration/v1/broadcast/token/bulkvalidate

// Request payload:
{
  privateKeyFoo: ['tokenBar', 'tokenBaz'],
  privateKeyQux: ['tokenFred'],
  privateKeyThud: ['tokenFizz', 'tokenBuzz'],
}

// Response: 200
{
  privateKeyFoo: {
    tokenBar: {
      statusCode: 200,
      message: 'OK',
      status: true,
      ttl: 3600,                 // TTL may or may not be returned
    },
    tokenBaz: {
      statusCode: 403,
      message: 'Room inaccessible',
      status: false,
    },
  },
  privateKeyQux: {
    tokenFred: {
      statusCode: 200,
      message: 'OK',
      status: true,
      ttl: 3600,                 // TTL may or may not be returned
    },
  },
  privateKeyThud: {
    tokenFizz: {
      statusCode: 200,
      message: 'OK',
      status: true,
      ttl: 3600,                 // TTL may or may not be returned
    },
    tokenBuzz: {
      statusCode: 403,
      message: 'Room inaccessible',
      status: false,
    }
  },
}

```