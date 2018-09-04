import HelloSign from 'hellosign-embedded';

const advancedOptionsEl = document.getElementById('advanced-options');
const demoContainerEl = document.getElementById('demo-container');
const demoEl = document.getElementById('demo');
const form = document.getElementById('configuration-form');
const resetButton = document.getElementById('reset-button');
const submitButton = document.getElementById('submit-button');
const showAdvancedButton = document.getElementById('advanced-options-button');

const apiKeyField = form.elements.namedItem('api-key');
const clientIdField = form.elements.namedItem('client-id');
const containerField = form.elements.namedItem('container');
const debugField = form.elements.namedItem('debug');
const localeField = form.elements.namedItem('locale');
const redirectToField = form.elements.namedItem('redirect-to');
const requestingEmailField = form.elements.namedItem('requesting-email');
const skipVerificationField = form.elements.namedItem('skip-verification');
const timeoutField = form.elements.namedItem('timeout');
const urlField = form.elements.namedItem('url');

const client = new HelloSign();

const openRequest = (signUrl) => {
  const options = {
    clientId: clientIdField.value,
    debug: debugField.checked,
    locale: localeField.value,
    skipDomainVerification: skipVerificationField.checked,
  };

  // Apply timeout.
  if (timeoutField.value) {
    options.timeout = timeoutField.value;
  }

  // Apply redirect URL.
  if (redirectToField.value) {
    options.redirectTo = redirectToField.value;
  }

  // Apply requesting email.
  if (requestingEmailField.value) {
    options.requestingEmail = requestingEmailField.value;
  }

  // Apply container.
  if (containerField.checked) {
    options.container = demoEl;
    demoContainerEl.classList.remove('invisible');
  } else {
    demoContainerEl.classList.add('invisible');
  }

  // Open HelloSign Embedded.
  client.open(signUrl, options);

  // Re-enable submit button.
  submitButton.removeAttribute('disabled');
};

const createRequest = () => {
  const clientId = clientIdField.value;
  const apiKey = apiKeyField.value;

  fetch('/create-signature-request', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ clientId, apiKey }),
  }).then((res) => {
    return res.json();
  }).then((body) => {
    if (body.success) {
      openRequest(body.data.signUrl);
    } else {
      alert('Something went wrong. Did you enter your API Key and Client ID correctly?');

      // Re-enable submit button.
      submitButton.removeAttribute('disabled');
    }
  });
};

const initLocales = () => {
  Object.values(HelloSign.locales).forEach((val) => {
    if (val === HelloSign.locales.EN_US) {
      localeField.insertAdjacentHTML('beforeend', `
        <option value="${val}" selected>${val}</option>
      `);
    } else {
      localeField.insertAdjacentHTML('beforeend', `
        <option value="${val}">${val}</option>
      `);
    }
  });
};

const loadForm = () => {
  const config = window.localStorage.getItem('config');

  if (config) {
    const obj = JSON.parse(config);

    Object.entries(obj).forEach(([key, value]) => {
      const elem = form.elements.namedItem(key);

      if (elem) {
        switch (elem.type) {
          case 'checkbox':
          case 'radio': {
            elem.checked = value;
            break;
          }
          case 'button':
          case 'submit': {
            // Do nothing
            break;
          }
          default: {
            elem.value = value;
          }
        }
      }
    });
  }
};

const saveForm = () => {
  const obj = Array.from(form.elements).reduce((acc, field) => {
    switch (field.type) {
      case 'checkbox':
      case 'radio': {
        return {
          ...acc,
          [field.name]: field.checked,
        };
      }
      case 'button':
      case 'submit': {
        return acc;
      }
      default: {
        return {
          ...acc,
          [field.name]: field.value,
        };
      }
    }
  }, {});

  window.localStorage.setItem('config', JSON.stringify(obj));
};

const resetForm = () => {
  window.localStorage.removeItem('config');
  window.localStorage.removeItem('showAdvancedOptions');

  window.location.reload();
};

const initForm = () => {
  resetButton.addEventListener('click', (evt) => {
    evt.preventDefault();

    if (confirm('Are you sure you want to reset the form?')) {
      resetForm();
    }
  });

  form.addEventListener('change', () => {
    saveForm();
  });

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();

    // Disable the submit button temporarily.
    submitButton.setAttribute('disabled', true);

    if (urlField.value.length) {
      openRequest(urlField.value);
    } else {
      createRequest();
    }
  });

  loadForm();
};

const loadShowAdvanced = () => {
  const showAdvancedOptions = window.localStorage.getItem('showAdvancedOptions');

  if (showAdvancedOptions) {
    const isShown = JSON.parse(showAdvancedOptions);

    if (isShown) {
      $(advancedOptionsEl).collapse('show');
    }
  }
};

const initShowAdvanced = () => {
  $(advancedOptionsEl).on('show.bs.collapse', () => {
    window.localStorage.setItem('showAdvancedOptions', JSON.stringify(true));
    showAdvancedButton.textContent = 'Hide Advanced Options';
  });

  $(advancedOptionsEl).on('hide.bs.collapse', () => {
    window.localStorage.setItem('showAdvancedOptions', JSON.stringify(false));
    showAdvancedButton.textContent = 'Show Advanced Options';
  });

  loadShowAdvanced();
};

const initClient = () => {
  client.on(HelloSign.events.CLOSE, () => {
    demoContainerEl.classList.toggle('invisible', true);
  });

  client.on(HelloSign.events.OPEN, () => {
    if (containerField.checked) {
      window.scrollTo({
        top: demoContainerEl.offsetTop,
        behavior: 'smooth',
      });
    }
  });
};

const init = () => {
  initLocales();
  initForm();
  initShowAdvanced();
  initClient();
};

init();
