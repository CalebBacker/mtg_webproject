/**
 * DECK DETAIL PAGE - Shows Everything About One Specific Deck
 * 
 * This page appears when you click on a deck from the main list. It shows:
 * - The commander card (with image)
 * - Statistics (wins, losses, mulligans, win rate)
 * - A notes section where you can write about the deck
 * - The full decklist with card images
 * - Sorting options to organize the cards
 * 
 * You can edit stats, add notes, and sort cards in different ways.
 */

// Import React tools for managing changing data
import React, { useState, useEffect } from 'react';
// Import tools to get the deck ID from the URL and navigate to other pages
import { useParams, useNavigate } from 'react-router-dom';

function DeckDetail() {
    /**
     * GET THE DECK ID FROM THE URL
     * 
     * When you visit "/deck/123", this extracts "123" as the deck ID.
     * We use this ID to find which deck to display.
     */
    const { id } = useParams();
    
    // Get the navigation function so we can go back to the deck list
    const navigate = useNavigate();
    
    /**
     * STATE VARIABLES - Memory boxes that remember information
     * 
     * - deck: The deck we're currently viewing (starts as null until we load it)
     * - showStatsModal: Whether the "edit stats" popup is open or closed
     * - statsInput: The numbers you're typing in the edit stats popup
     * - notes: The notes you've written about this deck
     * - sortBy: How the cards are currently sorted ('name', 'mana', or 'type')
     */
    const [deck, setDeck] = useState(null);  // No deck loaded yet
    const [showStatsModal, setShowStatsModal] = useState(false);  // Edit popup starts closed
    const [statsInput, setStatsInput] = useState({
        wins: 0,
        losses: 0,
        mulligans: 0
    });
    const [notes, setNotes] = useState('');  // No notes yet
    const [sortBy, setSortBy] = useState('name');  // Start sorted by name

    /**
     * LOAD THE DECK WHEN THE PAGE OPENS
     * 
     * This runs when the page first loads or when the deck ID in the URL changes.
     * It finds the deck with the matching ID and loads all its information.
     */
    useEffect(() => {
        // Get all saved decks from browser storage
        const savedDecks = localStorage.getItem('mtgDecks');
        if (savedDecks) {
            // Convert from text format back to data
            const decks = JSON.parse(savedDecks);
            // Find the deck that matches the ID in the URL
            const foundDeck = decks.find(d => d.id === id);
            
            if (foundDeck) {
                // We found it! Load all the deck's information
                setDeck(foundDeck);
                // Load the statistics into the edit form
                setStatsInput({
                    wins: foundDeck.stats?.wins || 0,
                    losses: foundDeck.stats?.losses || 0,
                    mulligans: foundDeck.stats?.mulligans || 0
                });
                // Load any notes that were saved
                setNotes(foundDeck.notes || '');
            }
        }
    }, [id]); // Run this whenever the ID in the URL changes

    /**
     * SAVE UPDATED DECK INFORMATION
     * 
     * This function saves changes you make to the deck (like updating stats or notes).
     * It finds the deck in the list, replaces it with the updated version, and saves everything.
     * 
     * @param {Object} updatedDeck - The deck object with all the updated information
     */
    const saveDeck = (updatedDeck) => {
        // Get all decks from storage
        const savedDecks = localStorage.getItem('mtgDecks');
        if (savedDecks) {
            const decks = JSON.parse(savedDecks);
            // Replace the old version of this deck with the new one
            // map() goes through each deck and replaces the one with matching ID
            const updatedDecks = decks.map(d => d.id === id ? updatedDeck : d);
            // Save everything back to storage
            localStorage.setItem('mtgDecks', JSON.stringify(updatedDecks));
            // Update what we're showing on screen
            setDeck(updatedDeck);
        }
    };

    /**
     * SAVE STATS FROM THE EDIT POPUP
     * 
     * This runs when you click "Save" in the edit stats popup. It takes the numbers
     * you typed in and saves them to the deck. It also automatically calculates
     * the total games (wins + losses).
     */
    const handleUpdateStats = () => {
        // Create an updated deck with the new statistics
        const updatedDeck = {
            ...deck,  // Keep everything else the same
            stats: {
                ...statsInput,  // Use the numbers you typed in
                // Automatically calculate total games
                totalGames: (statsInput.wins || 0) + (statsInput.losses || 0)
            },
            notes: notes  // Also save any notes you wrote
        };
        // Save the updated deck
        saveDeck(updatedDeck);
        // Close the edit popup
        setShowStatsModal(false);
    };

    /**
     * QUICK STAT UPDATE (The +/- Buttons)
     * 
     * This runs when you click the + or - buttons next to wins, losses, or mulligans.
     * It quickly increases or decreases the number by 1.
     * 
     * @param {string} stat - Which stat to update ('wins', 'losses', or 'mulligans')
     * @param {number} delta - How much to change it by (+1 or -1)
     */
    const handleQuickStatUpdate = (stat, delta) => {
        // Create updated stats
        const updatedStats = {
            ...deck.stats,  // Keep other stats the same
            // Update the specific stat, but don't let it go below 0
            [stat]: Math.max(0, (deck.stats[stat] || 0) + delta),
            // If we're updating wins or losses, recalculate total games
            totalGames: stat === 'wins' || stat === 'losses' 
                ? Math.max(0, (deck.stats.wins || 0) + (stat === 'wins' ? delta : 0) + 
                             (deck.stats.losses || 0) + (stat === 'losses' ? delta : 0))
                : deck.stats.totalGames || 0  // Mulligans don't affect total games
        };
        // Save the updated deck
        const updatedDeck = { ...deck, stats: updatedStats };
        saveDeck(updatedDeck);
    };

    /**
     * IF DECK NOT FOUND, SHOW ERROR MESSAGE
     * 
     * If the deck ID in the URL doesn't match any saved deck, show an error
     * message and a button to go back to the deck list.
     */
    if (!deck) {
        return (
            <div style={{ padding: '2em', textAlign: 'center' }}>
                <p>Deck not found</p>
                <button onClick={() => navigate('/')}>Back to Decks</button>
            </div>
        );
    }

    /**
     * CALCULATE WIN RATE
     * 
     * This calculates what percentage of games you won.
     * Formula: (Wins / Total Games) × 100
     * 
     * Example: 3 wins out of 5 games = 60% win rate
     */
    const winRate = deck.stats?.totalGames > 0 
        ? ((deck.stats.wins || 0) / deck.stats.totalGames * 100).toFixed(1)
        : 0;  // If no games played yet, win rate is 0%

    /**
     * GET MANA VALUE (Converted Mana Cost)
     * 
     * This figures out how much mana a card costs. For example:
     * - "{1}{R}" = 2 mana (1 generic + 1 red)
     * - "{3}{G}{G}" = 5 mana (3 generic + 2 green)
     * 
     * We prefer to use the CMC (Converted Mana Cost) that Scryfall gives us,
     * but if we don't have that, we count the numbers in the mana cost string.
     * 
     * @param {Object} card - The card object
     * @returns {number} - The total mana value
     */
    const getManaValue = (card) => {
        // If Scryfall gave us the CMC, use that (it's more accurate)
        if (card.cmc !== null && card.cmc !== undefined) {
            return card.cmc;
        }
        // Otherwise, we need to count the numbers in the mana cost string
        if (!card.manaCost || card.manaCost === '') return 0;
        
        // Find all the numbers in curly braces (like {1}, {2}, etc.)
        const matches = card.manaCost.match(/\{(\d+)\}/g);
        if (!matches) return 0;
        
        // Add up all the numbers we found
        return matches.reduce((sum, match) => {
            const num = parseInt(match.replace(/[{}]/g, ''));
            return sum + (isNaN(num) ? 0 : num);
        }, 0);
    };

    /**
     * GET CARD TYPE FOR SORTING
     * 
     * This extracts the main type from a card's type line. For example:
     * - "Creature — Human Wizard" → "Creature"
     * - "Instant" → "Instant"
     * - "Artifact Creature — Golem" → "Artifact Creature"
     * 
     * We only want the part before the dash for sorting purposes.
     * 
     * @param {string} typeLine - The full type line from Scryfall
     * @returns {string} - Just the main type
     */
    const getCardType = (typeLine) => {
        if (!typeLine) return 'Unknown';
        // Split at the dash and take the first part
        // "Creature — Human Wizard" becomes ["Creature ", " Human Wizard"]
        const mainType = typeLine.split('—')[0].trim();
        return mainType || 'Unknown';
    };

    /**
     * SORT THE DECKLIST
     * 
     * This function organizes the cards in your deck based on which sort button
     * you clicked. It creates a new sorted list without changing the original.
     * 
     * Sorting options:
     * - 'name': Alphabetical by card name (A to Z)
     * - 'mana': By mana cost (cheapest first), then by name if same cost
     * - 'type': By card type (Creatures together, Instants together, etc.), then by name
     * 
     * @returns {Array} - The sorted list of cards
     */
    const getSortedDecklist = () => {
        // If there's no decklist, return empty array
        if (!deck.decklist) return [];
        
        // Make a copy of the decklist (don't change the original)
        const sorted = [...deck.decklist];
        
        // Sort based on which option is selected
        switch (sortBy) {
            case 'name':
                // Sort alphabetically by card name
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
                
            case 'mana':
                // Sort by mana cost (lowest first)
                sorted.sort((a, b) => {
                    const manaA = getManaValue(a);
                    const manaB = getManaValue(b);
                    // If different mana costs, sort by cost
                    if (manaA !== manaB) {
                        return manaA - manaB;
                    }
                    // If same mana cost, sort alphabetically by name
                    return a.name.localeCompare(b.name);
                });
                break;
                
            case 'type':
                // Sort by card type
                sorted.sort((a, b) => {
                    const typeA = getCardType(a.type);
                    const typeB = getCardType(b.type);
                    // If different types, sort by type name
                    if (typeA !== typeB) {
                        return typeA.localeCompare(typeB);
                    }
                    // If same type, sort alphabetically by name
                    return a.name.localeCompare(b.name);
                });
                break;
                
            default:
                // Unknown sort option, don't sort
                break;
        }
        
        return sorted;  // Give back the sorted list
    };

    const sortedDecklist = getSortedDecklist();

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2em', fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: '2em' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '0.5em 1em',
                        marginBottom: '1em',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Decks
                </button>
                <h1 style={{ margin: 0 }}>{deck.name}</h1>
            </div>

            {deck.commander && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5em',
                    borderRadius: '8px',
                    marginBottom: '2em',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    gap: '2em',
                    alignItems: 'center'
                }}>
                    {deck.commander.imageUrl && (
                        <img
                            src={deck.commander.imageUrl}
                            alt={deck.commander.name}
                            style={{
                                width: '200px',
                                borderRadius: '8px'
                            }}
                        />
                    )}
                    <div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '0.5em' }}>Commander</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{deck.commander.name}</div>
                    </div>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2em',
                marginBottom: '2em'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5em',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ marginTop: 0 }}>Statistics</h2>
                    <div style={{ marginBottom: '1em' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5em' }}>
                            <span>Wins:</span>
                            <div>
                                <button
                                    onClick={() => handleQuickStatUpdate('wins', -1)}
                                    style={{ padding: '0.25em 0.5em', marginRight: '0.5em' }}
                                >-</button>
                                <strong>{deck.stats?.wins || 0}</strong>
                                <button
                                    onClick={() => handleQuickStatUpdate('wins', 1)}
                                    style={{ padding: '0.25em 0.5em', marginLeft: '0.5em' }}
                                >+</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5em' }}>
                            <span>Losses:</span>
                            <div>
                                <button
                                    onClick={() => handleQuickStatUpdate('losses', -1)}
                                    style={{ padding: '0.25em 0.5em', marginRight: '0.5em' }}
                                >-</button>
                                <strong>{deck.stats?.losses || 0}</strong>
                                <button
                                    onClick={() => handleQuickStatUpdate('losses', 1)}
                                    style={{ padding: '0.25em 0.5em', marginLeft: '0.5em' }}
                                >+</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5em' }}>
                            <span>Mulligans:</span>
                            <div>
                                <button
                                    onClick={() => handleQuickStatUpdate('mulligans', -1)}
                                    style={{ padding: '0.25em 0.5em', marginRight: '0.5em' }}
                                >-</button>
                                <strong>{deck.stats?.mulligans || 0}</strong>
                                <button
                                    onClick={() => handleQuickStatUpdate('mulligans', 1)}
                                    style={{ padding: '0.25em 0.5em', marginLeft: '0.5em' }}
                                >+</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5em' }}>
                            <span>Total Games:</span>
                            <strong>{deck.stats?.totalGames || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Win Rate:</span>
                            <strong>{winRate}%</strong>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowStatsModal(true)}
                        style={{
                            padding: '0.75em 1.5em',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        Edit Stats
                    </button>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5em',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ marginTop: 0 }}>Notes</h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={() => {
                            const updatedDeck = { ...deck, notes: notes };
                            saveDeck(updatedDeck);
                        }}
                        placeholder="Add notes about this deck..."
                        style={{
                            width: '100%',
                            minHeight: '150px',
                            padding: '0.75em',
                            border: '2px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontFamily: 'sans-serif',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                padding: '1.5em',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
                    <h2 style={{ margin: 0 }}>Decklist ({deck.decklist?.length || 0} cards)</h2>
                    <div style={{ display: 'flex', gap: '0.5em' }}>
                        <button
                            onClick={() => setSortBy('name')}
                            style={{
                                padding: '0.5em 1em',
                                fontSize: '14px',
                                backgroundColor: sortBy === 'name' ? '#2196F3' : '#f0f0f0',
                                color: sortBy === 'name' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: sortBy === 'name' ? 'bold' : 'normal'
                            }}
                        >
                            Name
                        </button>
                        <button
                            onClick={() => setSortBy('mana')}
                            style={{
                                padding: '0.5em 1em',
                                fontSize: '14px',
                                backgroundColor: sortBy === 'mana' ? '#2196F3' : '#f0f0f0',
                                color: sortBy === 'mana' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: sortBy === 'mana' ? 'bold' : 'normal'
                            }}
                        >
                            Mana Value
                        </button>
                        <button
                            onClick={() => setSortBy('type')}
                            style={{
                                padding: '0.5em 1em',
                                fontSize: '14px',
                                backgroundColor: sortBy === 'type' ? '#2196F3' : '#f0f0f0',
                                color: sortBy === 'type' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: sortBy === 'type' ? 'bold' : 'normal'
                            }}
                        >
                            Type
                        </button>
                    </div>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1em'
                }}>
                    {sortedDecklist.map((card, index) => (
                        <div
                            key={index}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            {card.imageUrl && (
                                <img
                                    src={card.imageUrl}
                                    alt={card.name}
                                    style={{
                                        width: '100%',
                                        display: 'block'
                                    }}
                                />
                            )}
                            <div style={{ padding: '0.5em', fontSize: '14px' }}>
                                <div style={{ fontWeight: 'bold' }}>
                                    {card.quantity}x {card.name}
                                </div>
                                {card.manaCost && (
                                    <div style={{ color: '#666', fontSize: '12px' }}>
                                        {card.manaCost}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showStatsModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2em',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Edit Statistics</h2>
                        <div style={{ marginBottom: '1em' }}>
                            <label style={{ display: 'block', marginBottom: '0.5em' }}>Wins:</label>
                            <input
                                type="number"
                                value={statsInput.wins}
                                onChange={(e) => setStatsInput({ ...statsInput, wins: parseInt(e.target.value) || 0 })}
                                style={{
                                    width: '100%',
                                    padding: '0.5em',
                                    fontSize: '16px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '1em' }}>
                            <label style={{ display: 'block', marginBottom: '0.5em' }}>Losses:</label>
                            <input
                                type="number"
                                value={statsInput.losses}
                                onChange={(e) => setStatsInput({ ...statsInput, losses: parseInt(e.target.value) || 0 })}
                                style={{
                                    width: '100%',
                                    padding: '0.5em',
                                    fontSize: '16px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '1em' }}>
                            <label style={{ display: 'block', marginBottom: '0.5em' }}>Mulligans:</label>
                            <input
                                type="number"
                                value={statsInput.mulligans}
                                onChange={(e) => setStatsInput({ ...statsInput, mulligans: parseInt(e.target.value) || 0 })}
                                style={{
                                    width: '100%',
                                    padding: '0.5em',
                                    fontSize: '16px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowStatsModal(false)}
                                style={{
                                    padding: '0.75em 1.5em',
                                    fontSize: '16px',
                                    backgroundColor: '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStats}
                                style={{
                                    padding: '0.75em 1.5em',
                                    fontSize: '16px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeckDetail;
