require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post('/send', async (req, res) => {
  const { naam, bedrijf, email, bericht } = req.body;

  if (!naam || !email || !bericht) {
    return res.status(400).json({ ok: false, error: 'Naam, e-mail en bericht zijn verplicht.' });
  }

  try {
    await transporter.sendMail({
      from: `"LIJM Website" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `Nieuw bericht van ${naam}${bedrijf ? ` (${bedrijf})` : ''}`,
      text: `Naam: ${naam}\nBedrijf: ${bedrijf || '—'}\nE-mail: ${email}\n\n${bericht}`,
      html: `
        <p><strong>Naam:</strong> ${naam}</p>
        <p><strong>Bedrijf:</strong> ${bedrijf || '—'}</p>
        <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr/>
        <p>${bericht.replace(/\n/g, '<br/>')}</p>
      `,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    res.status(500).json({ ok: false, error: 'Versturen mislukt. Probeer het later opnieuw.' });
  }
});

app.listen(PORT, () => {
  console.log(`LIJM server draait op http://localhost:${PORT}`);
});
