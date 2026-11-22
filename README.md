# Frankenstein Form Validation (`FormValidationjs`)

## Synopsis

At first I struggled with the exercise because I could not do a generic placeholder validation form, yet I also did not know right away how to translate my vision and make it look like what I imagined. After reflecting on it, the *Frankenstein* theme felt just right. In the end, just like my to-do list, this became another dream come true—and this time I brought *Frankenstein* to life! The creature is alive! Now I know how Victor Frankenstein must have felt—and in the process, I ended up creating a mini faux visual novel draft by accident too. All for art's sake!

## Overview

A gothic, *Frankenstein*-inspired browser form validation web application built with modular JavaScript, custom CSS animations, and Webpack. It transforms standard client-side form validation into an interactive narrative experience, using custom validation logic, dynamic DOM state updates, and atmospheric styling instead of generic error banners. This was also my very first time using lint!

## Features

- **Custom Client-Side Validation:** Dedicated validation modules (`validators.js`, `index.js`) enforcing field constraints using the Constraint Validation API (`setCustomValidity`, ARIA attributes, and custom error state classes).
- **Dynamic Narrative & UI States:** Interactive state transitions featuring custom quotes, creature visibility toggles, reset controls, step-by-step rendering, and accidental faux visual novel beats.
- **Gothic Dark-Mode Styling:** Custom CSS (`styles.css`) tailored to a dark, literary aesthetic with visual decay/alert states and responsive layout controls.
- **Modular Build Pipeline & Linting:** Configured with Webpack (`webpack.config.js`), ESLint (`eslint.config.mjs`), and npm scripts (`package.json`) for clean bundling, code checks, and development workflows.

## Project Structure

```text
form-validation/
├── src/
│   ├── index.js        # Main entry point, DOM event listeners, and state orchestration
│   ├── validators.js   # Custom validation rules and field checks
│   └── styles.css      # Gothic UI styling and validation state animations
├── eslint.config.mjs   # ESLint flat configuration for JavaScript modules in the browser
├── package.json        # Project dependencies, lint/build scripts, and metadata
├── package-lock.json   # Locked dependency tree
└── webpack.config.js   # Webpack bundling configuration