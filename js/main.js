// main.js - Enhanced main application with Week 6 features
import { fetchTrending, searchContent, fetchGenres, discoverByGenre } from './api.js';
import { addToWatchlist, removeFromWatchlist, addToFavorites, removeFromFavorites, addToWatched, isInWatchlist, isInFavorites } from './storage.js';
import { renderCards, showLoading, hideLoading, showNotification, hideEmptyState, showEmptyState } from './ui.js';
import { GENRES } from './config.js';

// State management
let currentContentType = 'all';
let currentGenre = null;
let currentSearchQuery = '';
let currentPage = 1;
let totalPages = 1;
let searchTimeout = null;
let currentResults = [];

// Initialize the app
async function init() {
    console.log('🎬 Initializing CineTrack...');
    
    // Load genres
    await loadGenres();
    
    // Load trending content
    await loadTrendingContent();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('✅ CineTrack initialized successfully!');
}

// Load genres from API
async function loadGenres() {
    try {
        const movieGenres = await fetchGenres('movie');
        const tvGenres = await fetchGenres('tv');
        
        GENRES.movie = movieGenres;
        GENRES.tv = tvGenres;
        
        renderGenreFilters();
    } catch (error) {
        console.error('Error loading genres:', error);
        showNotification('Failed to load genres', 'error');
    }
}

// Render genre filter chips
function renderGenreFilters() {
    const container = document.getElementById('genreFilters');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Add "All" chip
    const allChip = createGenreChip({ id: null, name: '🌟 All' }, true);
    container.appendChild(allChip);
    
    // Get appropriate genres based on content type
    let genres = [];
    if (currentContentType === 'movie') {
        genres = GENRES.movie;
    } else if (currentContentType === 'tv') {
        genres = GENRES.tv;
    } else {
        // For 'all', combine both (remove duplicates by name)
        const combined = [...GENRES.movie, ...GENRES.tv];
        const uniqueMap = new Map();
        combined.forEach(g => uniqueMap.set(g.name, g));
        genres = Array.from(uniqueMap.values());
    }
    
    // Sort alphabetically
    genres.sort((a, b) => a.name.localeCompare(b.name));
    
    // Render genre chips
    genres.forEach(genre => {
        const chip = createGenreChip(genre);
        container.appendChild(chip);
    });
}

// Create a genre filter chip
function createGenreChip(genre, isActive = false) {
    const chip = document.createElement('button');
    chip.className = `genre-chip ${isActive ? 'active' : ''}`;
    chip.textContent = genre.name;
    chip.dataset.genreId = genre.id;
    chip.setAttribute('aria-pressed', isActive);
    
    chip.addEventListener('click', () => handleGenreClick(genre.id, chip));
    
    return chip;
}

// Handle genre chip click
async function handleGenreClick(genreId, chipElement) {
    // Update active state
    document.querySelectorAll('.genre-chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
    });
    chipElement.classList.add('active');
    chipElement.setAttribute('aria-pressed', 'true');
    
    currentGenre = genreId;
    currentPage = 1;
    
    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    currentSearchQuery = '';
    updateClearButton();
    
    // Update content title
    updateContentTitle(genreId ? chipElement.textContent : null);
    
    // Load content
    if (genreId === null) {
        await loadTrendingContent();
    } else {
        await loadContentByGenre(genreId);
    }
}

// Update content title
function updateContentTitle(genreName = null) {
    const titleElement = document.getElementById('contentTitle');
    if (!titleElement) return;
    
    if (currentSearchQuery) {
        titleElement.textContent = `🔍 Search results for "${currentSearchQuery}"`;
    } else if (genreName) {
        titleElement.textContent = `${genreName}`;
    } else {
        const typeEmoji = currentContentType === 'movie' ? '🎬' : currentContentType === 'tv' ? '📺' : '🔥';
        const typeText = currentContentType === 'movie' ? 'Trending Movies' : currentContentType === 'tv' ? 'Trending TV Shows' : 'Trending Now';
        titleElement.textContent = `${typeEmoji} ${typeText}`;
    }
}

// Update result count
function updateResultCount(count) {
    const countElement = document.getElementById('resultCount');
    if (countElement) {
        countElement.textContent = count > 0 ? `${count} results` : '';
    }
}

// Load trending content
async function loadTrendingContent() {
    showLoading();
    hideEmptyState();
    hideLoadMore();
    
    try {
        const mediaType = currentContentType === 'all' ? 'all' : currentContentType;
        const results = await fetchTrending(mediaType);
        
        currentResults = results;
        const container = document.getElementById('contentGrid');
        if (container) {
            renderCards(results, container);
            updateResultCount(results.length);
        }
        
        updateContentTitle();
    } catch (error) {
        console.error('Error loading trending content:', error);
        showNotification('Failed to load content. Please try again.', 'error');
        showEmptyState();
    } finally {
        hideLoading();
    }
}

// Load content by genre
async function loadContentByGenre(genreId) {
    showLoading();
    hideEmptyState();
    hideLoadMore();
    
    try {
        const mediaType = currentContentType === 'all' ? 'movie' : currentContentType;
        const results = await discoverByGenre(genreId, mediaType);
        
        currentResults = results;
        const container = document.getElementById('contentGrid');
        if (container) {
            if (results.length === 0) {
                showEmptyState();
                updateResultCount(0);
            } else {
                renderCards(results, container);
                updateResultCount(results.length);
            }
        }
    } catch (error) {
        console.error('Error loading content by genre:', error);
        showNotification('Failed to load content. Please try again.', 'error');
        showEmptyState();
    } finally {
        hideLoading();
    }
}

// Handle search
async function handleSearch(query) {
    currentSearchQuery = query.trim();
    
    if (!currentSearchQuery) {
        currentPage = 1;
        await loadTrendingContent();
        return;
    }
    
    showLoading();
    hideEmptyState();
    hideLoadMore();
    
    try {
        const mediaType = currentContentType === 'all' ? 'multi' : currentContentType;
        const results = await searchContent(currentSearchQuery, mediaType);
        
        currentResults = results;
        const container = document.getElementById('contentGrid');
        if (container) {
            if (results.length === 0) {
                showEmptyState();
                updateResultCount(0);
            } else {
                renderCards(results, container);
                updateResultCount(results.length);
            }
        }
        
        updateContentTitle();
    } catch (error) {
        console.error('Error searching:', error);
        showNotification('Search failed. Please try again.', 'error');
        showEmptyState();
    } finally {
        hideLoading();
    }
}

// Debounced search handler
function handleSearchInput(event) {
    const query = event.target.value;
    
    // Update clear button visibility
    updateClearButton();
    
    // Clear existing timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Set new timeout (300ms debounce)
    searchTimeout = setTimeout(() => {
        handleSearch(query);
    }, 300);
}

// Update clear search button visibility
function updateClearButton() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    if (searchInput && clearBtn) {
        if (searchInput.value) {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        updateClearButton();
        currentSearchQuery = '';
        loadTrendingContent();
    }
}

// Handle content type filter
async function handleContentTypeFilter(type) {
    currentContentType = type;
    currentGenre = null;
    currentPage = 1;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // Re-render genre filters for the new content type
    renderGenreFilters();
    
    // Clear search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        updateClearButton();
    }
    currentSearchQuery = '';
    
    // Load trending content for the selected type
    await loadTrendingContent();
}

// Handle card actions
function handleCardAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const action = button.dataset.action;
    const card = button.closest('.content-card');
    if (!card) return;
    
    const id = parseInt(card.dataset.id);
    const mediaType = card.dataset.mediaType;
    
    // Get item data from card
    const titleElement = card.querySelector('.card-title');
    const posterImg = card.querySelector('.card-image img');
    const ratingElement = card.querySelector('.card-rating span:last-child');
    
    const item = {
        id: id,
        media_type: mediaType,
        title: titleElement ? titleElement.textContent : 'Unknown',
        poster_path: posterImg ? posterImg.getAttribute('data-poster') : null,
        vote_average: ratingElement ? parseFloat(ratingElement.textContent) : 0
    };
    
    switch (action) {
        case 'watchlist':
            handleWatchlistToggle(item, button, card);
            break;
        case 'favorite':
            handleFavoriteToggle(item, button, card);
            break;
        case 'details':
            navigateToDetails(id, mediaType);
            break;
    }
}

// Toggle watchlist
function handleWatchlistToggle(item, button, card) {
    const inWatchlist = isInWatchlist(item.id, item.media_type);
    
    if (inWatchlist) {
        removeFromWatchlist(item.id, item.media_type);
        button.classList.remove('active');
        button.setAttribute('title', 'Add to Watchlist');
        showNotification('Removed from watchlist', 'success');
    } else {
        addToWatchlist(item);
        button.classList.add('active');
        button.setAttribute('title', 'Remove from Watchlist');
        showNotification('Added to watchlist! 📋', 'success');
    }
}

// Toggle favorites
function handleFavoriteToggle(item, button, card) {
    const inFavorites = isInFavorites(item.id, item.media_type);
    
    if (inFavorites) {
        removeFromFavorites(item.id, item.media_type);
        button.classList.remove('active');
        button.textContent = '🤍';
        button.setAttribute('title', 'Add to Favorites');
        showNotification('Removed from favorites', 'success');
    } else {
        addToFavorites(item);
        button.classList.add('active');
        button.textContent = '❤️';
        button.setAttribute('title', 'Remove from Favorites');
        showNotification('Added to favorites! ❤️', 'success');
    }
}

// Navigate to details page
function navigateToDetails(id, mediaType) {
    window.location.href = `details.html?id=${id}&type=${mediaType}`;
}

// Hide load more button
function hideLoadMore() {
    const container = document.getElementById('loadMoreContainer');
    if (container) {
        container.style.display = 'none';
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        
        // Enter key on search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (searchTimeout) clearTimeout(searchTimeout);
                handleSearch(searchInput.value);
            }
        });
    }
    
    // Clear search button
    const clearBtn = document.getElementById('clearSearch');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }
    
    // Search button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput ? searchInput.value : '';
            if (searchTimeout) clearTimeout(searchTimeout);
            handleSearch(query);
        });
    }
    
    // Content type filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            handleContentTypeFilter(type);
        });
    });
    
    // Card actions (use event delegation)
    const contentGrid = document.getElementById('contentGrid');
    if (contentGrid) {
        contentGrid.addEventListener('click', handleCardAction);
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}