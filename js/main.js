// Masmatix Innovations - site scripts

// Web3Forms access key from web3forms.com.
// While this is empty, the contact form opens the visitor's email app instead.
const WEB3FORMS_KEY = '';
const CONTACT_EMAIL = 'info@masmatixinnovations.co.uk';

// Footer year
document.getElementById('yr').textContent = new Date().getFullYear();

// "Copy" button next to the email address
const copyButton = document.getElementById('copy');
const emailText = document.getElementById('mail');

copyButton.addEventListener('click', () => {
  const selectEmail = () => {
    const range = document.createRange();
    range.selectNodeContents(emailText);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyButton.textContent = 'Selected, press Ctrl+C';
  };

  try {
    navigator.clipboard.writeText(emailText.textContent).then(() => {
      copyButton.textContent = 'Copied';
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 1800);
    }, selectEmail);
  } catch (err) {
    selectEmail();
  }
});

// Contact form
const form = document.getElementById('enquiry');
const note = document.getElementById('form-note');
const submitButton = document.getElementById('f-submit');
const callFields = document.getElementById('call-fields');
const dateInput = document.getElementById('f-date');

const value = (id) => document.getElementById(id).value.trim();
const selectedMode = () => form.querySelector('input[name="mode"]:checked').value;

function showNote(text, isError = false) {
  note.textContent = text;
  note.classList.toggle('err', isError);
}

// Show the date, time and platform fields only for video call requests
form.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    const isCall = selectedMode() === 'Video call';
    callFields.hidden = !isCall;
    submitButton.textContent = isCall ? 'Request video call' : 'Send enquiry';
  });
});

// No booking dates in the past
dateInput.min = new Date().toISOString().slice(0, 10);

function validate() {
  const required = ['f-first', 'f-last', 'f-email', 'f-msg'];
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  let firstInvalid = null;

  required.forEach((id) => {
    const field = document.getElementById(id);
    const filled = field.value.trim() !== '';
    const valid = id === 'f-email' ? emailPattern.test(field.value.trim()) : filled;
    field.setAttribute('aria-invalid', valid ? 'false' : 'true');
    if (!valid && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) {
    showNote('Please fill in your name, a valid email and a short message.', true);
    firstInvalid.focus();
    return false;
  }

  if (!document.getElementById('f-consent').checked) {
    showNote('Please tick the box so we can reply to you.', true);
    return false;
  }

  return true;
}

function collectData() {
  const data = {
    first_name: value('f-first'),
    last_name: value('f-last'),
    company: value('f-company'),
    email: value('f-email'),
    phone: value('f-phone'),
    topic: value('f-topic'),
    request: selectedMode(),
    message: value('f-msg'),
  };

  if (data.request === 'Video call') {
    data.preferred_date = value('f-date');
    data.preferred_time = value('f-time');
    data.platform = value('f-platform');
  }

  return data;
}

function resetForm() {
  form.reset();
  callFields.hidden = true;
  submitButton.textContent = 'Send enquiry';
}

async function sendWithWeb3Forms(data, subject) {
  submitButton.disabled = true;
  showNote('Sending…');

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject,
        from_name: 'Masmatix website',
        ...data,
      }),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    resetForm();
    showNote(`Thank you, ${data.first_name}. Your message has reached us and we will be in touch soon.`);
  } catch (err) {
    showNote(`Your message could not be sent. Please email ${CONTACT_EMAIL} instead.`, true);
  } finally {
    submitButton.disabled = false;
  }
}

function openEmailApp(data, subject) {
  const body = Object.entries(data)
    .filter(([, text]) => text)
    .map(([key, text]) => `${key.replace(/_/g, ' ')}: ${text}`)
    .join('\n');

  window.location.href =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showNote(`Your email app should open with your message ready to send. If it does not, email ${CONTACT_EMAIL}.`);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  showNote('');
  if (!validate()) return;

  const data = collectData();
  const kind = data.request === 'Video call' ? 'Video call request' : 'New enquiry';
  const subject = `${kind} from ${data.first_name} ${data.last_name}`;

  if (WEB3FORMS_KEY) {
    sendWithWeb3Forms(data, subject);
  } else {
    openEmailApp(data, subject);
  }
});
