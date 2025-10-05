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
        document.addEventListener('DOMContentLoaded', initializeTheme);
    } else {
        initializeTheme();
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