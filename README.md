# Trivex

Static website for Trivex, an IT services company providing managed IT support, cloud infrastructure, Odoo ERP, custom software, mobile apps, AI agents, chatbots, and security services.

## Pages

- `index.html`: Home page featuring an animated SVG network diagram, overview of core IT services, key service commitments, and a single-partner support overview.
- `about.html`: Company overview detailing the single-team IT support model, the three-step engagement process (Audit, Fixed quote, Set up and support), and supported platforms.
- `services.html`: Detailed service directory organized into interactive tabs (Managed IT support, Cloud and infrastructure, Odoo ERP, Custom software, Mobile apps, AI agents, Chatbots, and Security) with mock demonstrations and pricing structure.
- `contact.html`: Contact page featuring an inquiry form integrated with Web3Forms, email copy button, submission guidelines, and a common questions FAQ accordion.
- `404.html`: Custom 404 error page matching the site styling with navigation back to the home and services pages.

## Tech Stack

- HTML5: Semantic markup with inline SVG icons and vector diagrams.
- CSS: Custom stylesheet (`styles.css`) using CSS custom properties, responsive layout grids and flexboxes, fluid typography (`clamp`), and support for `prefers-reduced-motion`.
- JavaScript: Client-side script (`script.js`) handling mobile menu toggle, reduced-motion preferences, accessible tab navigation with URL hash history and keyboard navigation, intersection observer animations, clipboard interactions, and contact form validation and submission.
- Fonts: Google Fonts (`Schibsted Grotesk`, weights 400 to 800) loaded via Google Fonts CDN.
- Form Service: Web3Forms API endpoint used for asynchronous form submission with fallback to standard HTTP POST.

## Local Development

The site consists entirely of static assets and does not require a build step or package dependencies.

Run a local HTTP server:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in a web browser.

Alternatively, open `index.html` directly in any web browser.

## Deployment

The repository includes a `.nojekyll` file at the root, which configures GitHub Pages to serve static files directly without running Jekyll.

## Project Structure

```
.
|-- .nojekyll       # Disables Jekyll processing on GitHub Pages
|-- 404.html        # Not found error page
|-- about.html      # About page
|-- contact.html    # Contact and inquiry page
|-- index.html      # Landing page
|-- script.js       # Client-side JavaScript
|-- services.html   # Services and pricing page
`-- styles.css      # Global stylesheet
```
