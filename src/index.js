import HelloSign from 'hellosign-embedded';

const form = document.getElementById('configuration-form');
const apiKeyElement = document.getElementById('api-key-input');
const clientIdElement = document.getElementById('client-id-input');
const redirectUrlElement = document.getElementById('redirect-url-input');
const submitButton = document.getElementById('submit-button');

/**
 * A helper function which saves the user's current config
 * to local storage for ease of use.
 */
const saveConfig = () => {
  window.localStorage.setItem('config', (
    JSON.stringify({
      apiKey: apiKeyElement.value,
      clientId: clientIdElement.value,
      redirectUrl: redirectUrlElement.value,
    })
  ));
};

/**
 * A helper function which prepopulates configuration
 * fields from local storage.
 */
const loadConfig = () => {
  const config = window.localStorage.getItem('config');

  if (config) {
    const { apiKey, clientId, redirectUrl } = JSON.parse(config);

    apiKeyElement.value = apiKey;
    clientIdElement.value = clientId;
    redirectUrlElement.value = redirectUrl;
  }
};

/**
 * Initializes and opens the embedded signature request
 * with the signature URL provided by the backend.
 *
 * @param {string} signUrl
 */
const openRequest = (signUrl) => {
  HelloSign.init(clientIdElement.value);

  const options = {
    url: signUrl,
    allowCancel: true,
    debug: true,
    skipDomainVerification: false,
  };

  // Set the redirect URL, if is it specified.
  if (redirectUrlElement.value.length) {
    options.redirectUrl = redirectUrlElement.value;
  }

  HelloSign.open(options);
};

/**
 * Sends a request to the backend to create a new
 * signature request using the HelloSign NodeJS SDK with
 * the given API key and Client ID.
 */
const createRequest = () => {
  fetch('/create-signature-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId: clientIdElement.value,
      apiKey: apiKeyElement.value,
    }),
  }).then((res) => {
    return res.json();
  }).then((body) => {
    if (body.success) {
      openRequest(body.data.signUrl);
    } else {
      alert('Something went wrong. Did you enter your API Key and Client ID correctly?');
    }

    // Re-enable submit button.
    submitButton.removeAttribute('disabled');
  });
};

/**
 * Sets up the demo app.
 */
const init = () => {
  loadConfig();

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();

    // Disable the submit button temporarily.
    submitButton.setAttribute('disabled', true);

    // Save the config and create the signature request.
    saveConfig();
    createRequest();
  });
};

init();
