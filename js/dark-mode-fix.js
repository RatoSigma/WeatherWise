// Correção simples de modo escuro para compatibilidade do navegador
(function() {
    'use strict';
    
    // Função para aplicar modo escuro
    function applyDarkMode() {
        const body = document.body;
        if (!body) {
            console.error('Elemento body não encontrado');
            return;
        }
        
        // Adicionar classe de tema escuro
        body.classList.add('dark-theme');
        
        // Forçar navegador a reconhecer a mudança
        body.style.display = 'none';
        body.offsetHeight; // Forçar reflow
        body.style.display = '';
    }
    
    // Função para remover modo escuro
    function removeDarkMode() {
        const body = document.body;
        if (!body) return;
        
        body.classList.remove('dark-theme');
        
        // Forçar navegador a reconhecer a mudança
        body.style.display = 'none';
        body.offsetHeight; // Forçar reflow
        body.style.display = '';
    }
    
    // Verificar tema guardado e aplicá-lo
    function initializeTheme() {
        try {
            const savedSettings = localStorage.getItem('weatherwise_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.theme === 'dark') {
                    applyDarkMode();
                }
            }
        } catch (error) {
            console.error('Erro ao inicializar tema:', error);
        }
    }
    
    // Aplicar tema o mais rápido possível
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeTheme();
            setupThemeToggleListener();
        });
    } else {
        initializeTheme();
        setupThemeToggleListener();
    }
    
    // Setup theme toggle listener
    function setupThemeToggleListener() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // Set initial state based on current theme
            const savedSettings = localStorage.getItem('weatherwise_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                themeToggle.checked = settings.theme === 'dark';
                updateThemeLabel(themeToggle.checked);
            }
            
            // Add change event listener
            themeToggle.addEventListener('change', function() {
                if (this.checked) {
                    applyDarkMode();
                    updateThemeLabel(true);
                    saveThemeSetting('dark');
                } else {
                    removeDarkMode();
                    updateThemeLabel(false);
                    saveThemeSetting('light');
                }
            });
        }
    }
    
    // Update theme label text
    function updateThemeLabel(isDark) {
        const themeLabel = document.getElementById('themeLabel');
        if (themeLabel) {
            themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
        }
    }
    
    // Save theme setting to localStorage
    function saveThemeSetting(theme) {
        try {
            const savedSettings = localStorage.getItem('weatherwise_settings');
            let settings = savedSettings ? JSON.parse(savedSettings) : {};
            settings.theme = theme;
            localStorage.setItem('weatherwise_settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving theme setting:', error);
        }
    }
    
    // Ouvir por mudanças de tema
    window.addEventListener('storage', function(e) {
        if (e.key === 'weatherwise_settings') {
            try {
                const settings = JSON.parse(e.newValue);
                if (settings.theme === 'dark') {
                    applyDarkMode();
                } else {
                    removeDarkMode();
                }
            } catch (error) {
                console.error('Erro ao lidar com evento de armazenamento:', error);
            }
        }
    });
})();