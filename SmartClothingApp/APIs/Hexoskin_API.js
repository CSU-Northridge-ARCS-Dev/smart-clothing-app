// import axios from 'axios';

// // Hexoskin API endpoint URL
// const API_URL = 'https://api.hexoskin.com/api/user/';

// // API key obtained from Hexoskin
// const API_KEY = 'uZH2l4oFztSgno63SNuypkkmb2t2MuOPoAF6jUSI';
// const API_KEY_Private = '.';

// // Function to fetch Hexoskin data
// async function fetchHexoskinData() {
//   try {
//     const response = await axios.get(API_URL, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${API_KEY}`,
//       },
//       // Additional request parameters if required
//       params: {
//         // Example: date range for data retrieval
//         start_date: '2022-01-01',
//         end_date: '2022-01-31',
//       },
//     });
//     // Handle the response data
//     console.log(response.data);
//   } catch (error) {
//     // Handle errors
//     console.error('Error fetching Hexoskin data:', error);
//   }
// }

// // Call the function to fetch Hexoskin data
// fetchHexoskinData();

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
import document from 'react';

export function oauthSignIn() {
  console.log("button presseddd");
  // Google's OAuth 2.0 endpoint for requesting an access token
  var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  var form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint);

  // Parameters to pass to OAuth 2.0 endpoint.
  var params = {'client_id': 'uZH2l4oFztSgno63SNuypkkmb2t2MuOPoAF6jUSI',
                'redirect_uri': 'https://api.hexoskin.com/api/user/',
                'response_type': 'token',
                'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly',
                'include_granted_scopes': 'true',
                'state': 'pass-through value'};

  // Add form parameters as hidden input values.
  for (var p in params) {
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', params[p]);
    form.appendChild(input);
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  form.submit();
}

