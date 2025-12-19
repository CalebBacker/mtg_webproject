/**
 * MAIN ENTRY POINT - This is where the application starts
 * 
 * Think of this file as the "on switch" for the entire app.
 * When you open the website, this file runs first and tells the browser
 * to display our Magic: The Gathering deck database application.
 */

// Import React - This is a library that helps us build interactive web pages
import React from 'react';
// Import createRoot - This helps us attach our app to the webpage
import { createRoot } from 'react-dom/client';
// Import our main App component - This contains all the pages and navigation
import App from './App';

// Find the empty div in the HTML file (with id="root") and prepare to put our app there
// This is like finding an empty picture frame on the wall where we'll hang our painting
const root = createRoot(document.getElementById('root'));

// Actually display our App component inside that div
// This is like hanging the painting in the frame - now everyone can see it!
root.render(<App />);
