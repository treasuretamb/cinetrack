// details.js - Detail page functionality
import { fetchDetails, getImageUrl } from './api.js';
import { addToWatchlist, removeFromWatchlist, addToFavorites, removeFromFavorites, addToWatched, isInWatchlist, isInFavorites, isWatched } from './storage.js';
import { showNotification, createCard } from './ui.js';

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: parseInt(params.get('id')),
        type: params.get('type') || 'movie'
    };
}

// Initialize detail page
async function init() {
    const { id, type } = getUrlParams();
    
    if (!id) {
        showNotification('Invalid content ID', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    await loadDetails(id, type);
}

// Load and display content details
async function loadDetails(id, mediaType) {
    try {
        showLoading();
        
        const data = await fetchDetails(id, mediaType);
        
        if (!data) {
            throw new Error('Failed to load details');
        }
        
        renderDetails(data, mediaType);
        renderCast(data.credits);
        renderSimilar(data.similar, mediaType);
        setupActionButtons(data, mediaType);
        
    } catch (error) {
        console.error('Error loading details:', error);
        showNotification('Failed to load details. Redirecting...', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
    } finally {
        hideLoading();
    }
}

// Render main details section
function renderDetails(data, mediaType) {
    const title = data.title || data.name;
    const releaseDate = data.release_date || data.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const runtime = data.runtime || (data.episode_run_time && data.episode_run_time[0]) || 'N/A';
    const rating = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
    
    // Update page title
    document.title = `${title} - CineTrack`;
    
    // Set backdrop
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && data.backdrop_path) {
        const backdropUrl = getImageUrl(data.backdrop_path, 'w1280');
        heroSection.style.backgroundImage = `linear-gradient(to bottom, rgba(34, 31, 31, 0.3), rgba(34, 31, 31, 0.9)), url(${backdropUrl})`;
    }
    
    // Set poster
    const posterImg = document.getElementById('detailPoster');
    if (posterImg) {
        posterImg.src = getImageUrl(data.poster_path);
        posterImg.alt = title;
    }
    
    // Set title
    const titleElement = document.getElementById('detailTitle');
    if (titleElement) titleElement.textContent = title;
    
    // Set metadata
    const metadataElement = document.getElementById('detailMetadata');
    if (metadataElement) {
        const runtimeText = runtime !== 'N/A' ? `${runtime} min` : runtime;
        metadataElement.innerHTML = `
            <span class="badge">${mediaType === 'movie' ? 'Movie' : 'TV Show'}</span>
            <span>${year}</span>
            <span>${runtimeText}</span>
            <span class="rating">⭐ ${rating}</span>
        `;
    }
    
    // Set genres
    const genresElement = document.getElementById('detailGenres');
    if (genresElement && data.genres) {
        genresElement.innerHTML = data.genres
            .map(g => `<span class="genre-tag">${g.name}</span>`)
            .join('');
    }
    
    // Set overview
    const overviewElement = document.getElementById('detailOverview');
    if (overviewElement) {
        overviewElement.textContent = data.overview || 'No overview available.';
    }
}

// Render cast section
function renderCast(credits) {
    const castContainer = document.getElementById('castList');
    if (!castContainer || !credits || !credits.cast) return;
    
    // Show top 10 cast members
    const topCast = credits.cast.slice(0, 10);
    
    castContainer.innerHTML = topCast.map(person => {
        const photoUrl = person.profile_path 
            ? getImageUrl(person.profile_path, 'w185')
            : 'https://via.placeholder.com/185x278/221F1F/E50914?text=No+Photo';
        
        return `
            <div class="cast-member">
                <img src="${photoUrl}" alt="${person.name}" loading="lazy">
                <div class="cast-info">
                    <div class="cast-name">${person.name}</div>
                    <div class="cast-character">${person.character || 'Unknown Role'}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render similar content
function renderSimilar(similar, mediaType) {
    const similarContainer = document.getElementById('similarContent');
    if (!similarContainer || !similar || !similar.results) return;
    
    const results = similar.results.slice(0, 10);
    
    if (results.length === 0) {
        similarContainer.innerHTML = '<p class="empty-message">No similar content found.</p>';
        return;
    }
    
    similarContainer.innerHTML = results.map(item => {
        const title = item.title || item.name;
        const posterUrl = getImageUrl(item.poster_path);
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        
        return `
            <div class="similar-card" onclick="window.location.href='details.html?id=${item.id}&type=${mediaType}'">
                <img src="${posterUrl}" alt="${title}" loading="lazy">
                <div class="similar-info">
                    <div class="similar-title">${title}</div>
                    <div class="similar-rating">⭐ ${rating}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Setup action buttons
function setupActionButtons(data, mediaType) {
    const id = data.id;
    
    // Watchlist button
    const watchlistBtn = document.getElementById('btnWatchlist');
    if (watchlistBtn) {
        const inWatchlist = isInWatchlist(id, mediaType);
        updateButtonState(watchlistBtn, inWatchlist, '📋 In Watchlist', '➕ Add to Watchlist');
        
        watchlistBtn.addEventListener('click', () => {
            toggleWatchlist(data, mediaType, watchlistBtn);
        });
    }
    
    // Favorite button
    const favoriteBtn = document.getElementById('btnFavorite');
    if (favoriteBtn) {
        const inFavorites = isInFavorites(id, mediaType);
        updateButtonState(favoriteBtn, inFavorites, '❤️ Favorited', '🤍 Add to Favorites');
        
        favoriteBtn.addEventListener('click', () => {
            toggleFavorite(data, mediaType, favoriteBtn);
        });
    }
    
    // Watched button
    const watchedBtn = document.getElementById('btnWatched');
    if (watchedBtn) {
        const watched = isWatched(id, mediaType);
        updateButtonState(watchedBtn, watched, '✓ Watched', 'Mark as Watched');
        
        watchedBtn.addEventListener('click', () => {
            toggleWatched(data, mediaType, watchedBtn);
        });
    }
}

// Update button state
function updateButtonState(button, isActive, activeText, inactiveText) {
    if (isActive) {
        button.classList.add('active');
        button.textContent = activeText;
    } else {
        button.classList.remove('active');
        button.textContent = inactiveText;
    }
}

// Toggle watchlist
function toggleWatchlist(data, mediaType, button) {
    const item = {
        id: data.id,
        title: data.title || data.name,
        poster_path: data.poster_path,
        media_type: mediaType,
        vote_average: data.vote_average
    };
    
    const inWatchlist = isInWatchlist(item.id, mediaType);
    
    if (inWatchlist) {
        removeFromWatchlist(item.id, mediaType);
        updateButtonState(button, false, '📋 In Watchlist', '➕ Add to Watchlist');
        showNotification('Removed from watchlist', 'success');
    } else {
        addToWatchlist(item);
        updateButtonState(button, true, '📋 In Watchlist', '➕ Add to Watchlist');
        showNotification('Added to watchlist!', 'success');
    }
}

// Toggle favorite
function toggleFavorite(data, mediaType, button) {
    const item = {
        id: data.id,
        title: data.title || data.name,
        poster_path: data.poster_path,
        media_type: mediaType,
        vote_average: data.vote_average
    };
    
    const inFavorites = isInFavorites(item.id, mediaType);
    
    if (inFavorites) {
        removeFromFavorites(item.id, mediaType);
        updateButtonState(button, false, '❤️ Favorited', '🤍 Add to Favorites');
        showNotification('Removed from favorites', 'success');
    } else {
        addToFavorites(item);
        updateButtonState(button, true, '❤️ Favorited', '🤍 Add to Favorites');
        showNotification('Added to favorites!', 'success');
    }
}

// Toggle watched
function toggleWatched(data, mediaType, button) {
    const item = {
        id: data.id,
        title: data.title || data.name,
        media_type: mediaType
    };
    
    const watched = isWatched(item.id, mediaType);
    
    if (!watched) {
        addToWatched(item);
        updateButtonState(button, true, '✓ Watched', 'Mark as Watched');
        showNotification('Marked as watched!', 'success');
    }
}

// Loading helpers
function showLoading() {
    const loadingElement = document.getElementById('detailLoading');
    if (loadingElement) loadingElement.style.display = 'flex';
    
    const contentElement = document.getElementById('detailContent');
    if (contentElement) contentElement.style.display = 'none';
}

function hideLoading() {
    const loadingElement = document.getElementById('detailLoading');
    if (loadingElement) loadingElement.style.display = 'none';
    
    const contentElement = document.getElementById('detailContent');
    if (contentElement) contentElement.style.display = 'block';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}