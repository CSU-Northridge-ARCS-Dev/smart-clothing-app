export function oauthSignIn() {
  console.log("button presseddd");

  var CLIENT_ID = 'uZH2l4oFztSgno63SNuypkkmb2t2MuOPoAF6jUSI';
  var REDIRECT_URI = 'exp://u.expo.dev/f6c4ce5b-576b-4240-8cfa-1c658b0faf4a?channel-name=main&runtime-version=exposdk:45.0.0';
  var SCOPE = '';
  var UNIQUE_STATE_STRING = '';
  let AUTH_CODE;
  //Endpoint for requesting an access token
  const authUrl = `https://api.hexoskin.com/api/connect/oauth2/auth/?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${UNIQUE_STATE_STRING}`;

  fetch(authUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      AUTH_CODE = data;
    })
    .catch(error => {
      console.log('Error', error);
    });

  console.log("button pressed2");
  const tokenUrl = 'https://api.hexoskin.com/api/connect/oauth2/token/';

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: AUTH_CODE,
      redirect_uri: REDIRECT_URI,
    }),
  };

  fetch(tokenUrl, requestOptions)
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.log('error2', error);
    });
}

