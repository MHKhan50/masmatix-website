# Masmatix Innovations website

Company website for Masmatix Innovations Ltd: https://masmatixinnovations.co.uk

## Structure

```
index.html        home page
privacy.html      privacy policy
css/styles.css    all styles
js/main.js        copy button and contact form
images/           logo, favicon, photos
CNAME             custom domain for GitHub Pages
```

## Running locally

Open the folder in VS Code and start the Live Server extension, or open `index.html` in a browser.

## Contact form

 The form posts to Web3Forms. Add the access key to `WEB3FORMS_KEY` at the top of `js/main.js`.
Without a key, the form opens the visitor's email app with the message filled in.

## Deploying

The site is served by GitHub Pages from the `main` branch. Push to `main` and the live site updates within a couple of minutes.
