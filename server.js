const bodyParser = require('body-parser');
const express = require('express');
const hellosign = require('hellosign-sdk');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/dist')));

app.post('/create-signature-request', (req, res) => {
  const { apiKey, clientId } = req.body;

  const client = hellosign({
    key: apiKey,
    client_id: clientId,
  });

  client.signatureRequest.createEmbedded({
    test_mode: 1,
    subject: 'NDA with Acme Co.',
    message: 'Please sign this NDA and then we can discuss more.',
    allow_decline: 1,
    signers: [
      {
        email_address: 'alice@example.com',
        name: 'Alice',
        order: 0,
      },
    ],
    cc_email_addresses: ['bob@example.com'],
    files: [path.join(__dirname, 'files/nda.docx')],
  }).then((data) => {
    const firstSignature = data.signature_request.signatures[0];
    const signatureId = firstSignature.signature_id;

    client.embedded.getSignUrl(signatureId).then((signatureData) => {
      res.json({
        success: true,
        data: {
          signUrl: signatureData.embedded.sign_url,
        },
      });
    });
  }).catch(() => {
    res.json({
      success: false,
    });
  });
});

app.listen(process.env.PORT || 3000, (err) => {
  if (!err) {
    console.log('Server running at http://locahost:3000');
  }
});
