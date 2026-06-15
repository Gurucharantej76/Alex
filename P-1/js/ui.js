/**
 * UI Module
 * Handles all DOM manipulation, rendering, and view switching.
 */

class UI {
    static init() {
        this.cacheDOM();
        this.bindEvents();
        this.applyTheme(Storage.getTheme());
        this.switchView('dashboard');
        this.updateDashboard();
    }

    static cacheDOM() {
        this.app = document.querySelector('.app-container');
        this.navLinks = document.querySelectorAll('.nav-links li');
        this.views = document.querySelectorAll('.view-section');
        this.themeBtn = document.getElementById('theme-btn');
        
        // Modals
        this.entryModal = document.getElementById('entry-modal');
        this.viewModal = document.getElementById('view-entry-modal');
        this.closeButtons = document.querySelectorAll('.close-modal');
        
        // Forms & Inputs
        this.entryForm = document.getElementById('entry-form');
        this.searchInput = document.getElementById('search-input');
        this.entryTags = document.getElementById('entry-tags');
        
        // Dashboard Elements
        this.statTotal = document.getElementById('stat-total-entries');
        this.statStreak = document.getElementById('stat-streak');
        this.statWords = document.getElementById('stat-words');
        this.statTopMood = document.getElementById('stat-top-mood');
        this.recentEntriesList = document.getElementById('recent-entries-list');
        this.onThisDayContent = document.getElementById('on-this-day-content');
        
        // Timeline & Favorites Elements
        this.timelineContainer = document.getElementById('timeline-container');
        this.favoritesContainer = document.getElementById('favorites-container');
        this.filterMood = document.getElementById('filter-mood');
        this.filterCategory = document.getElementById('filter-category');
        this.filterDate = document.getElementById('filter-date');
        
        // Buttons
        this.newEntryBtn = document.getElementById('new-entry-btn');
        this.viewAllBtn = document.getElementById('view-all-btn');
        
        // Settings Buttons
        this.exportBtn = document.getElementById('export-btn');
        this.importInput = document.getElementById('import-input');
        this.clearDataBtn = document.getElementById('clear-data-btn');
        this.downloadFilterType = document.getElementById('download-filter-type');
        this.downloadDateInput = document.getElementById('download-date-input');
        this.downloadMonthInput = document.getElementById('download-month-input');
        this.downloadYearInput = document.getElementById('download-year-input');
        this.downloadCategoryInput = document.getElementById('download-category-input');
        this.downloadPreviewContainer = document.getElementById('download-preview-container');
        this.downloadFilteredBtn = document.getElementById('download-filtered-btn');
        
        // View Modal Elements
        this.downloadSingleBtn = document.getElementById('download-single-btn');
        this.viewTitle = document.getElementById('view-title');
        this.viewContent = document.getElementById('view-content');
        this.viewMood = document.getElementById('view-mood');
        this.viewDate = document.getElementById('view-date');
        this.viewCategory = document.getElementById('view-category');
        
        this.currentViewId = null;
    }

    static bindEvents() {
        // Navigation
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.switchView(e.currentTarget.dataset.view);
            });
        });

        // Theme Toggle
        this.themeBtn.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            Storage.saveTheme(newTheme);
        });

        // Modals
        this.newEntryBtn.addEventListener('click', () => this.openEntryModal());
        this.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.entryModal.classList.remove('active');
                this.viewModal.classList.remove('active');
            });
        });

        // Form Submit
        this.entryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEntry();
        });

        // Search and Filters
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.filterMood.addEventListener('change', () => this.renderTimeline());
        this.filterCategory.addEventListener('change', () => this.renderTimeline());
        this.filterDate.addEventListener('change', () => this.renderTimeline());

        // Dashboard actions
        this.viewAllBtn.addEventListener('click', () => this.switchView('timeline'));

        // View Modal Actions
        document.getElementById('edit-entry-btn').addEventListener('click', () => {
            this.viewModal.classList.remove('active');
            this.openEntryModal(this.currentViewId);
        });

        document.getElementById('delete-entry-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this memory?')) {
                Storage.deleteEntry(this.currentViewId);
                this.viewModal.classList.remove('active');
                this.showToast('Entry deleted successfully', 'success');
                this.refreshCurrentView();
            }
        });

        document.getElementById('toggle-favorite-btn').addEventListener('click', (e) => {
            const isFav = Diary.toggleFavorite(this.currentViewId);
            const icon = e.currentTarget.querySelector('i');
            if (isFav) {
                icon.classList.remove('ph-star');
                icon.classList.add('ph-fill', 'ph-star');
                icon.style.color = 'var(--warning)';
            } else {
                icon.classList.remove('ph-fill', 'ph-star');
                icon.classList.add('ph-star');
                icon.style.color = '';
            }
            this.refreshCurrentView();
        });

        // Settings Actions
        if (this.downloadFilterType) {
            this.downloadFilterType.addEventListener('change', (e) => {
                this.downloadDateInput.style.display = 'none';
                this.downloadMonthInput.style.display = 'none';
                this.downloadYearInput.style.display = 'none';
                this.downloadCategoryInput.style.display = 'none';
                
                if (e.target.value === 'date') this.downloadDateInput.style.display = 'block';
                if (e.target.value === 'month') this.downloadMonthInput.style.display = 'block';
                if (e.target.value === 'year') this.downloadYearInput.style.display = 'block';
                if (e.target.value === 'category') this.downloadCategoryInput.style.display = 'block';
                
                this.updateDownloadPreview();
            });
            
            this.downloadDateInput.addEventListener('change', () => this.updateDownloadPreview());
            this.downloadMonthInput.addEventListener('change', () => this.updateDownloadPreview());
            this.downloadYearInput.addEventListener('input', () => this.updateDownloadPreview());
            this.downloadCategoryInput.addEventListener('change', () => this.updateDownloadPreview());

            this.downloadFilteredBtn.addEventListener('click', () => {
                if (this.filteredEntriesToDownload && this.filteredEntriesToDownload.length > 0) {
                    this.downloadAsPreviewTxt(this.filteredEntriesToDownload, this.filteredDownloadFilename);
                    this.showToast('Entries downloaded successfully', 'success');
                }
            });
        }

        if (this.downloadSingleBtn) {
            this.downloadSingleBtn.addEventListener('click', () => {
                const entry = Diary.getEntryById(this.currentViewId);
                if (entry) {
                    const dateObj = new Date(entry.date);
                    const dateFormatted = `${dateObj.getDate()}-${dateObj.toLocaleString('en-US', {month: 'long'}).toLowerCase()}-${dateObj.getFullYear()}`;
                    this.downloadAsTxt([entry], `diary-${dateFormatted}.txt`);
                }
            });
        }

        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => {
                const entries = Storage.getEntries();
                if(entries.length === 0) {
                    this.showToast('No entries to download', 'info');
                    return;
                }
                this.downloadAsTxt(entries, `mydiary_all_entries_${new Date().toISOString().split('T')[0]}.txt`);
                this.showToast('Data downloaded successfully', 'success');
            });
        }

        if (this.importInput) {
            this.importInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    const textContent = event.target.result;
                    this.switchView('dashboard'); // Switch back from settings to see the modal
                    this.openEntryModal();
                    document.getElementById('entry-title').value = file.name.replace(/\.[^/.]+$/, ""); // Use filename as default title
                    document.getElementById('entry-content').value = textContent;
                    this.showToast('File uploaded. Please fill missing details.', 'info');
                };
                reader.readAsText(file);
                e.target.value = ''; // Reset input
            });
        }

        if (this.clearDataBtn) {
            this.clearDataBtn.addEventListener('click', () => {
                if (confirm('WARNING: Are you sure you want to delete all your diary entries? This action cannot be undone!')) {
                    Storage.clearData();
                    this.showToast('All data cleared', 'info');
                    this.refreshCurrentView();
                }
            });
        }
    }

    static switchView(viewName) {
        // Update Nav
        this.navLinks.forEach(link => {
            if (link.dataset.view === viewName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update Sections
        this.views.forEach(view => {
            if (view.id === `${viewName}-view`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Render specific view data
        if (viewName === 'dashboard') {
            this.updateDashboard();
        } else if (viewName === 'timeline') {
            this.renderTimeline();
        } else if (viewName === 'favorites') {
            this.renderFavorites();
        }
    }

    static refreshCurrentView() {
        const activeNav = document.querySelector('.nav-links li.active');
        if (activeNav) {
            this.switchView(activeNav.dataset.view);
        }
    }

    static applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = this.themeBtn.querySelector('i');
        if (theme === 'dark') {
            icon.classList.replace('ph-moon', 'ph-sun');
        } else {
            icon.classList.replace('ph-sun', 'ph-moon');
        }
    }

    static openEntryModal(id = null) {
        document.getElementById('modal-title').textContent = id ? 'Edit Memory' : 'New Memory';
        
        if (id) {
            const entry = Diary.getEntryById(id);
            if (entry) {
                document.getElementById('entry-id').value = entry.id;
                document.getElementById('entry-title').value = entry.title;
                document.getElementById('entry-mood').value = entry.mood;
                document.getElementById('entry-category').value = entry.category;
                document.getElementById('entry-date').value = entry.date;
                document.getElementById('entry-content').value = entry.content;
                if (this.entryTags) this.entryTags.value = entry.tags ? entry.tags.join(', ') : '';
            }
        } else {
            this.entryForm.reset();
            document.getElementById('entry-id').value = '';
            document.getElementById('entry-date').value = new Date().toISOString().split('T')[0];
            if (this.entryTags) this.entryTags.value = '';
        }
        
        this.entryModal.classList.add('active');
    }

    static saveEntry() {
        const data = {
            id: document.getElementById('entry-id').value,
            title: document.getElementById('entry-title').value,
            mood: document.getElementById('entry-mood').value,
            category: document.getElementById('entry-category').value,
            tags: document.getElementById('entry-tags') ? document.getElementById('entry-tags').value : '',
            date: document.getElementById('entry-date').value,
            content: document.getElementById('entry-content').value
        };

        const entry = Diary.createEntry(data);
        Storage.saveEntry(entry);
        
        this.entryModal.classList.remove('active');
        this.showToast('Memory saved successfully!', 'success');
        this.refreshCurrentView();
    }

    static openViewModal(id) {
        const entry = Diary.getEntryById(id);
        if (!entry) return;

        this.currentViewId = id;
        
        this.viewTitle.textContent = entry.title;
        this.viewContent.textContent = entry.content;
        this.viewMood.textContent = Diary.getMoodEmoji(entry.mood);
        this.viewDate.textContent = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        this.viewCategory.textContent = entry.category.charAt(0).toUpperCase() + entry.category.slice(1);

        const favBtnIcon = document.getElementById('toggle-favorite-btn').querySelector('i');
        if (entry.isFavorite) {
            favBtnIcon.classList.remove('ph-star');
            favBtnIcon.classList.add('ph-fill', 'ph-star');
            favBtnIcon.style.color = 'var(--warning)';
        } else {
            favBtnIcon.classList.remove('ph-fill', 'ph-star');
            favBtnIcon.classList.add('ph-star');
            favBtnIcon.style.color = '';
        }

        this.viewModal.classList.add('active');
    }

    static updateDashboard() {
        const stats = Dashboard.getStats();
        
        this.statTotal.textContent = stats.totalEntries;
        this.statStreak.textContent = `${stats.streak} Day${stats.streak !== 1 ? 's' : ''}`;
        this.statWords.textContent = stats.totalWords;
        this.statTopMood.textContent = stats.topMood;

        // Recent Entries
        const entries = Storage.getEntries().slice(0, 5);
        this.recentEntriesList.innerHTML = '';
        
        if (entries.length === 0) {
            this.recentEntriesList.innerHTML = '<div class="empty-state">No entries yet. Start writing!</div>';
        } else {
            entries.forEach(entry => {
                const el = this.createEntryCard(entry);
                this.recentEntriesList.appendChild(el);
            });
        }

        // On This Day
        const onThisDay = Dashboard.getOnThisDay();
        this.onThisDayContent.innerHTML = '';
        if (onThisDay.length === 0) {
            this.onThisDayContent.innerHTML = '<div class="empty-state">No memories for today yet.</div>';
        } else {
            onThisDay.forEach(entry => {
                const yearsAgo = new Date().getFullYear() - new Date(entry.date).getFullYear();
                const el = this.createEntryCard(entry);
                const badge = document.createElement('div');
                badge.className = 'tag';
                badge.style.marginBottom = '0.5rem';
                badge.textContent = `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago today`;
                el.insertBefore(badge, el.firstChild);
                this.onThisDayContent.appendChild(el);
            });
        }
    }

    static renderTimeline(searchTerm = '') {
        if (!searchTerm && this.searchInput) {
            searchTerm = this.searchInput.value;
        }

        const mood = this.filterMood.value;
        const category = this.filterCategory.value;
        const filterDate = this.filterDate.value;
        
        const entries = Diary.filterEntries(searchTerm, mood, category, filterDate);
        
        this.timelineContainer.innerHTML = '';
        
        if (entries.length === 0) {
            this.timelineContainer.innerHTML = '<div class="empty-state">No entries found matching your criteria.</div>';
            return;
        }

        // Group entries by month/year
        let currentMonthYear = '';

        entries.forEach(entry => {
            const date = new Date(entry.date);
            const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            if (monthYear !== currentMonthYear) {
                const header = document.createElement('h3');
                header.style.marginBottom = '1rem';
                header.style.color = 'var(--text-muted)';
                header.textContent = monthYear;
                this.timelineContainer.appendChild(header);
                currentMonthYear = monthYear;
            }

            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const dot = document.createElement('div');
            dot.className = 'timeline-dot';
            
            const card = this.createEntryCard(entry);
            
            item.appendChild(dot);
            item.appendChild(card);
            this.timelineContainer.appendChild(item);
        });
    }

    static renderFavorites() {
        const entries = Storage.getEntries().filter(e => e.isFavorite);
        
        if (!this.favoritesContainer) return;
        this.favoritesContainer.innerHTML = '';
        
        if (entries.length === 0) {
            this.favoritesContainer.innerHTML = '<div class="empty-state">No favorites yet</div>';
            return;
        }

        entries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const dot = document.createElement('div');
            dot.className = 'timeline-dot';
            dot.style.backgroundColor = 'var(--warning)';
            dot.style.borderColor = 'var(--bg-surface)';
            
            const card = this.createEntryCard(entry);
            
            item.appendChild(dot);
            item.appendChild(card);
            this.favoritesContainer.appendChild(item);
        });
    }

    static handleSearch() {
        const term = this.searchInput.value;
        if (term.trim() !== '') {
            this.switchView('timeline');
            this.renderTimeline(term);
        } else {
            // Restore normal timeline if we were just searching
            if (document.getElementById('timeline-view').classList.contains('active')) {
                this.renderTimeline();
            }
        }
    }

    static updateDownloadPreview() {
        const type = this.downloadFilterType.value;
        let filterVal = '';
        let filename = 'diary-export.txt';
        let entries = Storage.getEntries();

        if (type === 'date') {
            filterVal = this.downloadDateInput.value;
            if (!filterVal) return this.clearDownloadPreview();
            entries = entries.filter(e => e.date === filterVal);
            
            const d = new Date(filterVal);
            filename = `diary-${d.getDate()}-${d.toLocaleString('en-US', {month: 'long'}).toLowerCase()}-${d.getFullYear()}.txt`;
        } else if (type === 'month') {
            filterVal = this.downloadMonthInput.value;
            if (!filterVal) return this.clearDownloadPreview();
            entries = entries.filter(e => e.date.startsWith(filterVal));
            
            const parts = filterVal.split('-');
            const d = new Date(parts[0], parts[1] - 1, 1);
            filename = `diary-${d.toLocaleString('en-US', {month: 'long'}).toLowerCase()}-${d.getFullYear()}.txt`;
        } else if (type === 'year') {
            filterVal = this.downloadYearInput.value;
            if (!filterVal) return this.clearDownloadPreview();
            entries = entries.filter(e => e.date.startsWith(filterVal));
            filename = `diary-${filterVal}.txt`;
        } else if (type === 'category') {
            filterVal = this.downloadCategoryInput.value;
            if (!filterVal) return this.clearDownloadPreview();
            entries = entries.filter(e => e.category === filterVal);
            filename = `diary-${filterVal}.txt`;
        }

        this.filteredEntriesToDownload = entries;
        this.filteredDownloadFilename = filename;

        if (entries.length === 0) {
            this.downloadPreviewContainer.style.display = 'block';
            this.downloadPreviewContainer.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1rem 0;">No entries found</div>';
            this.downloadFilteredBtn.disabled = true;
            return;
        }

        let previewHtml = `<div style="font-weight: 500; margin-bottom: 0.5rem; color: var(--text-main);">Found ${entries.length} matching entry/entries:</div>`;
        
        entries.forEach(entry => {
            const previewText = entry.content.length > 50 ? entry.content.substring(0, 50) + '...' : entry.content;
            previewHtml += `
                <div style="border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                    <div style="font-weight: 500;">${entry.title}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        ${new Date(entry.date).toLocaleDateString()} &middot; Mood: ${entry.mood} &middot; Category: ${entry.category}
                    </div>
                    <div style="font-size: 0.9rem; color: var(--text-main); margin-top: 0.25rem;">"${previewText}"</div>
                </div>
            `;
        });
        
        this.downloadPreviewContainer.style.display = 'block';
        this.downloadPreviewContainer.innerHTML = previewHtml;
        this.downloadFilteredBtn.disabled = false;
    }

    static clearDownloadPreview() {
        this.downloadPreviewContainer.style.display = 'none';
        this.downloadPreviewContainer.innerHTML = '';
        this.downloadFilteredBtn.disabled = true;
        this.filteredEntriesToDownload = null;
    }

    static downloadAsPreviewTxt(entries, filename) {
        let textContent = '';
        entries.forEach((entry, index) => {
            const entryTime = entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
            const preview = entry.content.length > 60 ? entry.content.substring(0, 60) + '...' : entry.content;
            
            textContent += `========================================\n`;
            textContent += `TITLE: ${entry.title.toUpperCase()}\n`;
            textContent += `PREVIEW: ${preview}\n`;
            textContent += `========================================\n`;
            textContent += `FULL DETAILS:\n`;
            textContent += `Date: ${new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
            textContent += `Time: ${entryTime}\n`;
            textContent += `Mood: ${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}\n`;
            textContent += `Category: ${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}\n`;
            textContent += `Tags: ${(entry.tags && entry.tags.length > 0) ? entry.tags.join(', ') : 'None'}\n`;
            textContent += `Content:\n${entry.content}\n`;
            if (index < entries.length - 1) {
                textContent += `\n\n`;
            }
        });

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static downloadAsTxt(entries, filename) {
        let textContent = '';
        entries.forEach((entry, index) => {
            const entryTime = entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
            textContent += `Title: ${entry.title}\n`;
            textContent += `Date: ${new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
            textContent += `Time: ${entryTime}\n`;
            textContent += `Mood: ${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}\n`;
            textContent += `Category: ${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}\n`;
            textContent += `Tags: ${(entry.tags && entry.tags.length > 0) ? entry.tags.join(', ') : 'None'}\n`;
            textContent += `Content: ${entry.content}\n`;
            if (index < entries.length - 1) {
                textContent += `\n----------------------------------------\n\n`;
            }
        });
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    static createEntryCard(entry) {
        const div = document.createElement('div');
        div.className = 'entry-card';
        div.addEventListener('click', () => this.openViewModal(entry.id));

        const formattedDate = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        div.innerHTML = `
            <div class="entry-card-header">
                <div class="entry-card-title">${Diary.getMoodEmoji(entry.mood)} ${entry.title}</div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <div class="entry-card-date">${formattedDate}</div>
                    <button class="icon-btn fav-toggle-btn" style="width:28px; height:28px; min-width:28px; color: ${entry.isFavorite ? 'var(--warning)' : 'var(--text-muted)'}" data-id="${entry.id}" title="Toggle Favorite">
                        <i class="${entry.isFavorite ? 'ph-fill ph-star' : 'ph ph-star'}"></i>
                    </button>
                </div>
            </div>
            <div class="entry-card-preview">${entry.content}</div>
            <div class="entry-tags">
                <span class="tag">${entry.category}</span>
                ${(entry.tags || []).map(t => `<span class="tag" style="background-color: var(--border);">${t}</span>`).join('')}
            </div>
        `;

        // Handle favorite toggle inside card without opening the modal
        const favBtn = div.querySelector('.fav-toggle-btn');
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent modal opening
            const isFav = Diary.toggleFavorite(entry.id);
            const icon = favBtn.querySelector('i');
            if (isFav) {
                icon.classList.remove('ph-star');
                icon.classList.add('ph-fill', 'ph-star');
                favBtn.style.color = 'var(--warning)';
            } else {
                icon.classList.remove('ph-fill', 'ph-star');
                icon.classList.add('ph-star');
                favBtn.style.color = 'var(--text-muted)';
            }
            
            // Only refresh view if we are on the favorites tab, otherwise the card simply updates
            const activeNav = document.querySelector('.nav-links li.active');
            if (activeNav && activeNav.dataset.view === 'favorites') {
                this.renderFavorites();
            }
        });

        return div;
    }

    static showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'ph-check-circle' : (type === 'error' ? 'ph-x-circle' : 'ph-info');
        
        toast.innerHTML = `
            <i class="ph ${icon}" style="font-size: 1.25rem;"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Trigger reflow for animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}
