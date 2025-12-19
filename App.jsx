/**
 * MAIN APP COMPONENT - The Navigation and Routing System
 * 
 * This file is like the main hallway of a house. It:
 * 1. Creates a navigation bar at the top so you can move between pages
 * 2. Sets up the routing system (like a map that says "when user goes to /deck/123, show DeckDetail")
 * 3. Wraps everything in a nice background color
 */

// Import React - needed for all React components
import React from 'react';
// Import routing tools - these help us move between different pages
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// Import our two main page components
import DeckList from './DeckList';      // The page that shows all your decks
import DeckDetail from './DeckDetail';  // The page that shows one specific deck

/**
 * NAVIGATION COMPONENT - The Top Bar
 * 
 * This creates the dark navigation bar at the top of every page.
 * It shows a "My Decks" link that takes you back to the main page.
 * The link changes color when you're on that page (gold when active, white when not).
 */
function Navigation() {
    // Find out which page the user is currently on
    const location = useLocation();
    
    return (
        // Create a navigation bar with dark background
        <nav style={{
            padding: '1em',                    // Add space inside the bar
            backgroundColor: '#1a1a1a',       // Dark gray/black background
            borderBottom: '2px solid #333',    // Add a subtle border at the bottom
            marginBottom: '2em'                // Add space below the bar
        }}>
            <div style={{
                maxWidth: 1200,                // Don't let it get too wide on big screens
                margin: '0 auto',              // Center it on the page
                display: 'flex',               // Put items side by side
                gap: '2em',                    // Space between items
                alignItems: 'center'           // Vertically center items
            }}>
                {/* Create a clickable link that goes to the home page */}
                <Link 
                    to="/"  // When clicked, go to the home page (which shows DeckList)
                    style={{
                        textDecoration: 'none',  // Remove underline from link
                        // If we're on the home page, make it gold and bold. Otherwise white.
                        color: location.pathname === '/' ? '#FFD700' : '#fff',
                        fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                        fontSize: '18px'
                    }}
                >
                    My Decks
                </Link>
            </div>
        </nav>
    );
}

/**
 * MAIN APP COMPONENT
 * 
 * This is the root of our entire application. It:
 * 1. Sets up the router (the system that handles page navigation)
 * 2. Shows the navigation bar on every page
 * 3. Defines which component to show for each URL path
 */
function App() {
    return (
        // Router is like a traffic director - it watches the URL and shows the right page
        <Router>
            {/* Create a container that fills the whole screen with a light gray background */}
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                {/* Show the navigation bar on every page */}
                <Navigation />
                
                {/* Define the routing rules - like a map of URLs to pages */}
                <Routes>
                    {/* When the URL is exactly "/" (home page), show the DeckList component */}
                    <Route path="/" element={<DeckList />} />
                    
                    {/* When the URL is "/deck/123" (or any number), show the DeckDetail component */}
                    {/* The :id part means "capture whatever comes after /deck/ and call it 'id'" */}
                    <Route path="/deck/:id" element={<DeckDetail />} />
                </Routes>
            </div>
        </Router>
    );
}

// Export this component so other files can use it
export default App;
