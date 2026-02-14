import { getImageUrl } from './api.js';
import { isInWatchlist, isInFavorites, isWatched } from './storage.js';

// Create a movie/TV card element
export function createCard(item) {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.dataset.id = item.id;
    card.dataset.mediaType = item.media_type || 'movie';
    
    const title = item.title || item.name;
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const posterUrl = getImageUrl(item.poster_path);
    
    const inWatchlist = isInWatchlist(item.id, item.media_type);
    const inFavorites = isInFavorites(item.id, item.media_type);
    const watched = isWatched(item.id, item.media_type);
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${posterUrl}" alt="${title}" loading="lazy">
            ${watched ? '<div class="watched-badge">✓ Watched</div>' : ''}
        </div>
        <div class="card-content">
            <h3 class="card-title">${title}</h3>
            <div class="card-rating">
                <span class="star">⭐</span>
                <span>${rating}</span>
            </div>
            <div class="card-actions">
                <button class="btn-icon ${inWatchlist ? 'active' : ''}" data-action="watchlist" title="Add to Watchlist">
                    📋
                </button>
                <button class="btn-icon ${inFavorites ? 'active' : ''}" data-action="favorite" title="Add to Favorites">
                    ${inFavorites ? '❤️' : '🤍'}
                </button>
                <button class="btn-primary btn-small" data-action="details">
                    View Details
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Render multiple cards in a grid
export function renderCards(items, container) {
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        showEmptyState();
        return;
    }
    
    items.forEach(item => {
        const card = createCard(item);
        container.appendChild(card);
    });
}

// Show loading spinner
export function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'flex';
    
    const grid = document.getElementById('contentGrid');
    if (grid) grid.style.display = 'none';
}

// Hide loading spinner
export function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
    
    const grid = document.getElementById('contentGrid');
    if (grid) grid.style.display = 'grid';
}

// Show empty state
export function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.style.display = 'block';
    
    const grid = document.getElementById('contentGrid');
    if (grid) grid.style.display = 'none';
}

// Hide empty state
export function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.style.display = 'none';
}

// Show notification
export function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}