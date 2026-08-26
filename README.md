# DomainCompare — Marketing Site
<<<<<<< HEAD

Public-facing landing page for the **Domain Search and Price Comparison
Platform** final-year project (BSc.IT, Presidential Graduate School /
Westcliff University). Built from a "modern-ux-ui" React + Tailwind
template, repurposed section-by-section for this project.
=======
**Domain Search and Price Comparison
Platform** final-year project (BSc.IT, Presidential Graduate School /
Westcliff University). Built from a React + Tailwind
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19

## Stack

- React 19 + Vite 7
- Tailwind CSS v4 (via `@tailwindcss/vite`, no config file needed)
- lucide-react (icons)
- react-syntax-highlighter (lazy-loaded, only in the "How it works" section)

## Project structure

```
src/
  App.jsx                    # composes all sections
  components/
    Navbar.jsx                 # header + nav links + mobile menu
<<<<<<< HEAD
    Hero.jsx                    # GoDaddy-style search: input, TLD chips, results
=======
    Hero.jsx                    # search: input, TLD chips, results
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
    TldChip.jsx                  # one TLD quick-select pill
    ResultsSkeleton.jsx          # loading state while "searching"
    ResultsPanel.jsx             # availability + price table + alternatives
    PriceBarRow.jsx               # one registrar row (table row / mobile card)
    StatusBadge.jsx                # Available / Registered pill
    Features.jsx                   # "How it works" - 3 steps w/ real API JSON examples
    CodeBlock.jsx                   # lazy-loaded syntax-highlighted code panel
    ComparisonPreview.jsx           # live example comparison (uses ResultsPanel)
    WhyCompare.jsx                   # trust/feature panel
    Footer.jsx                        # footer links + registrar disclaimer
```

## The redirect / affiliate registration model

<<<<<<< HEAD
This platform is **not** an ICANN-accredited registrar. It never registers
a domain itself - every "Register" button opens the selected registrar's
own checkout in a new tab. This is
intentional and matches the project proposal's Legal/Ethical section.

Registrar names (`NovaReg`, `Domainly`, etc.) are placeholders. Swap
`checkoutUrlTemplate` for real affiliate links once you've signed up for
actual registrar affiliate programs.

=======
It never registers a domain itself - every "Register" button opens the selected registrar's
own checkout in a new tab (`buildCheckoutUrl()` in `mockData.js`). This is
intentional and matches the project proposal's Legal/Ethical section.

>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build -> dist/
npm run lint      # ESLint
```
<<<<<<< HEAD

=======
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
