#MindStack

## Overview
The Project Forum is a comprehensive platform designed to foster collaboration, learning, and communication among users. It allows participants to post questions, share ideas, provide solutions, and engage in discussions on various project-related topics. Users can interact through comments, reply threads, and feedback mechanisms such as upvotes or likes to recognize valuable contributions. The forum is organized with categories, tags, and a search function, making it easy to find information and follow specific topics. By promoting knowledge sharing and collaboration, the Project Forum helps users solve problems efficiently, stay informed about project updates, and build a supportive community for continuous learning and development.

---

## Live Demo
Visit the forum here: [MindStack](https://www.mindstack.study/)

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Note when install USE*** --legacy-peer-deps
npm install tailwindcss --legacy-peer-deps
npm uninstall tailwindcss --legacy-peer-deps
npm install firebase --legacy-peer-deps
npm install eslint@^9 --save-dev --legacy-peer-deps
npm install -D tailwindcss@latest @tailwindcss/vite --legacy-peer-deps

<!-- legacy-peer-deps is for force when catch error by eslint -->

## command rules firebase //do this after set new rules
firebase deploy 

## ============ [ Installation ] ================
D:\ISTAD\Web\sample-final-2\mind_stack>npm list
vithi_stack@0.0.0 D:\ISTAD\Web\sample-final-2\mind_stack
+-- @emnapi/core@1.8.1
+-- @emnapi/runtime@1.8.1
+-- @emnapi/wasi-threads@1.1.0
+-- @eslint/js@9.39.3
+-- @napi-rs/wasm-runtime@1.1.1
+-- @tailwindcss/vite@4.2.1
+-- @tanstack/react-query@5.90.21
+-- @tybys/wasm-util@0.10.1
+-- @types/react-dom@19.2.3
+-- @types/react@19.2.14
+-- @vitejs/plugin-react-swc@4.2.3
+-- autoprefixer@10.4.24
+-- daisyui@5.5.19
+-- date-fns@4.1.0
+-- eslint-plugin-react-hooks@7.0.1
+-- eslint-plugin-react-refresh@0.4.26
+-- eslint@9.39.3
+-- firebase@12.9.0
+-- flowbite-react@0.12.17
+-- flowbite@4.0.1
+-- globals@16.5.0
+-- postcss@8.5.6
+-- react-dom@19.2.4
+-- react-hook-form@7.71.2
+-- react-icons@5.5.0
+-- react-router-dom@7.13.1
+-- react@19.2.4
+-- tailwindcss@4.2.1
+-- tslib@2.8.1
+-- vite@7.3.1
`-- zod@3.25.76

## 📌 What is ESLint and why install it?

ESLint is a static code analysis tool that helps:

    Catch errors before they happen (e.g., unused variables, missing dependencies).

    Enforce code style and consistency across a team.

    Prevent common pitfalls in JavaScript/React (e.g., missing hooks dependencies, unsafe effects).

You install ESLint (and its plugins) to automatically check your code every time you save or build, making your codebase more reliable and maintainable.


## 📁 What does this specific config do?

    globalIgnores(['dist']) – tells ESLint to skip the dist/ folder (build output).

    files: ['**/*.{js,jsx}'] – applies these rules only to .js and .jsx files.

    extends – pulls in recommended rule sets from:

        @eslint/js – core JavaScript best practices.

        eslint-plugin-react-hooks – enforces the Rules of Hooks.

        eslint-plugin-react-refresh – ensures components are compatible with Fast Refresh in Vite.

    languageOptions – sets up modern JS (ECMAScript 2020+), browser globals, and JSX support.

    rules – customises the no-unused-vars rule to ignore variables that start with a capital letter or underscore (often used for React components or placeholder variables).

## 📦 Why install @eslint/js and these plugins?

    @eslint/js provides the core recommended rules (the js.configs.recommended you see).

    globals gives you predefined global variables for browsers (like window, document) so ESLint doesn’t complain about them.

    eslint-plugin-react-hooks and eslint-plugin-react-refresh add React-specific linting, crucial for a Vite + React project.

## ❓ What is "eslint.js"?

Probably a typo or shorthand. You likely installed:

    eslint (the core linter)

    @eslint/js (the recommended JS rules)

    globals

    eslint-plugin-react-hooks

    eslint-plugin-react-refresh
