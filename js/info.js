// Gerenciador de Configurações - Manipula todas as configurações da aplicação
class SettingsManager {
    constructor() {
        this.settings = {
            theme: 'light',
            temperatureUnit: 'celsius',
            windSpeedUnit: 'kmh',
            precipitationUnit: 'mm',
            refreshRate: '0',
            defaultLocation: '',
            // Limites de temperatura (Celsius)
            tempThresholds: {
                veryCold: 0,
                cold: 10,
                mild: 20,
                warm: 25,
                hot: 35
            },
            // Limites de precipitação (mm)
            precipThresholds: {
                light: 2.5,
                moderate: 7.6,
                heavy: 25,
                veryHeavy: 50
            },
            // Limites de velocidade do vento (km/h)
            windThresholds: {
                light: 5,
                moderate: 13,
                strong: 28,
                veryStrong: 63
            },
            // Limites de umidade (%)
            humidityThresholds: {
                dry: 30,
                comfortable: 60,
                humid: 80
            }
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.applyTheme();
        this.setupEventListeners();
    }

    // Carregar configurações do localStorage
    loadSettings() {
        const savedSettings = localStorage.getItem('weatherwise_settings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            // Mesclar com padrões para garantir que todas as propriedades de limite existem
            this.settings = { ...this.settings, ...parsedSettings };
            
            // Garantir que todos os objetos de limite existem com valores padrão
            if (!this.settings.tempThresholds) {
                this.settings.tempThresholds = {
                    veryCold: 0, cold: 10, mild: 20, warm: 25, hot: 35
                };
            }
            if (!this.settings.precipThresholds) {
                this.settings.precipThresholds = {
                    light: 2.5, moderate: 7.6, heavy: 25, veryHeavy: 50
                };
            }
            if (!this.settings.windThresholds) {
                this.settings.windThresholds = {
                    light: 5, moderate: 13, strong: 28, veryStrong: 63
                };
            }
            if (!this.settings.humidityThresholds) {
                this.settings.humidityThresholds = {
                    dry: 30, comfortable: 60, humid: 80
                };
            }
        }
    }

    // Salvar configurações no localStorage
    saveSettings() {
        // Atualizar configurações do formulário
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            this.settings.theme = themeToggle.checked ? 'dark' : 'light';
        }

        // Unidade de temperatura
        const tempUnit = document.querySelector('input[name="temperatureUnit"]:checked');
        if (tempUnit) {
            this.settings.temperatureUnit = tempUnit.value;
        }

        // Unidade de vento
        const windUnitSelect = document.getElementById('windUnit');
        if (windUnitSelect) {
            this.settings.windSpeedUnit = windUnitSelect.value;
        }

        // Unidade de precipitação
        const precipUnit = document.querySelector('input[name="precipitationUnit"]:checked');
        if (precipUnit) {
            this.settings.precipitationUnit = precipUnit.value;
        }

        // Taxa de atualização
        const refreshRateSelect = document.getElementById('refreshRate');
        if (refreshRateSelect) {
            this.settings.refreshRate = refreshRateSelect.value;
        }

        // Localização padrão
        const defaultLocationInput = document.getElementById('defaultLocation');
        if (defaultLocationInput) {
            this.settings.defaultLocation = defaultLocationInput.value.trim();
        }

        // Salvar configurações de limite
        this.saveThresholdSettings();

        localStorage.setItem('weatherwise_settings', JSON.stringify(this.settings));
    }

    // Aplicar tema à página atual
    applyTheme() {
        const body = document.body;
        
        if (this.settings.theme === 'dark') {
            body.classList.add('dark-theme');
            // Garantir que todos os elementos de texto tenham cores brilhantes
            this.applyBrightTextColors();
        } else {
            body.classList.remove('dark-theme');
        }
    }

    // Aplicar cores de texto brilhantes para tema escuro
    applyBrightTextColors() {
        // Adicionar cor de texto brilhante aos elementos de texto comuns
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, label, small, strong, b, em, i');
        textElements.forEach(element => {
            // Aplicar apenas se o elemento não tiver uma cor específica
            if (!element.style.color && !element.classList.contains('btn')) {
                element.style.color = '#f0f0f0';
            }
        });
    }

    // Obter uma configuração específica
    getSetting(key, defaultValue = null) {
        return this.settings[key] || defaultValue;
    }

    // Obter todas as configurações
    getSettings() {
        return this.settings;
    }

    // Converter temperatura entre unidades
    convertTemperature(value, fromUnit, toUnit) {
        if (fromUnit === toUnit) return value;
        
        // Converter para Celsius primeiro
        let celsius = value;
        if (fromUnit === 'fahrenheit') {
            celsius = (value - 32) * 5/9;
        }
        
        // Converter para unidade alvo
        if (toUnit === 'fahrenheit') {
            return celsius * 9/5 + 32;
        }
        return celsius;
    }

    // Converter velocidade do vento entre unidades
    convertWindSpeed(value, fromUnit, toUnit) {
        if (fromUnit === toUnit) return value;
        
        // Converter para km/h primeiro
        let kmh = value;
        if (fromUnit === 'mph') {
            kmh = value * 1.60934;
        } else if (fromUnit === 'ms') {
            kmh = value * 3.6;
        }
        
        // Converter para unidade alvo
        if (toUnit === 'mph') {
            return kmh / 1.60934;
        } else if (toUnit === 'ms') {
            return kmh / 3.6;
        }
        return kmh;
    }

    // Converter precipitação entre unidades
    convertPrecipitation(value, fromUnit, toUnit) {
        if (fromUnit === toUnit) return value;
        
        // Converter para mm primeiro
        let mm = value;
        if (fromUnit === 'inches') {
            mm = value * 25.4;
        }
        
        // Converter para unidade alvo
        if (toUnit === 'inches') {
            return mm / 25.4;
        }
        return mm;
    }

    // Carregar configurações de limite no formulário
    loadThresholdSettings() {
        const tempUnit = this.settings.temperatureUnit;
        
        // Limites de temperatura
        document.getElementById('tempVeryCold').value = this.convertTemperature(
            this.settings.tempThresholds.veryCold, 'celsius', tempUnit
        ).toFixed(1);
        document.getElementById('tempCold').value = this.convertTemperature(
            this.settings.tempThresholds.cold, 'celsius', tempUnit
        ).toFixed(1);
        document.getElementById('tempMild').value = this.convertTemperature(
            this.settings.tempThresholds.mild, 'celsius', tempUnit
        ).toFixed(1);
        document.getElementById('tempWarm').value = this.convertTemperature(
            this.settings.tempThresholds.warm, 'celsius', tempUnit
        ).toFixed(1);
        document.getElementById('tempHot').value = this.convertTemperature(
            this.settings.tempThresholds.hot, 'celsius', tempUnit
        ).toFixed(1);

        // Limites de precipitação
        const precipUnit = this.settings.precipitationUnit;
        document.getElementById('precipLight').value = this.convertPrecipitation(
            this.settings.precipThresholds.light, 'mm', precipUnit
        ).toFixed(1);
        document.getElementById('precipModerate').value = this.convertPrecipitation(
            this.settings.precipThresholds.moderate, 'mm', precipUnit
        ).toFixed(1);
        document.getElementById('precipHeavy').value = this.convertPrecipitation(
            this.settings.precipThresholds.heavy, 'mm', precipUnit
        ).toFixed(1);
        document.getElementById('precipVeryHeavy').value = this.convertPrecipitation(
            this.settings.precipThresholds.veryHeavy, 'mm', precipUnit
        ).toFixed(1);

        // Limites de velocidade do vento
        const windUnit = this.settings.windSpeedUnit;
        document.getElementById('windLight').value = this.convertWindSpeed(
            this.settings.windThresholds.light, 'kmh', windUnit
        ).toFixed(1);
        document.getElementById('windModerate').value = this.convertWindSpeed(
            this.settings.windThresholds.moderate, 'kmh', windUnit
        ).toFixed(1);
        document.getElementById('windStrong').value = this.convertWindSpeed(
            this.settings.windThresholds.strong, 'kmh', windUnit
        ).toFixed(1);
        document.getElementById('windVeryStrong').value = this.convertWindSpeed(
            this.settings.windThresholds.veryStrong, 'kmh', windUnit
        ).toFixed(1);

        // Limites de umidade
        document.getElementById('humidityDry').value = this.settings.humidityThresholds.dry;
        document.getElementById('humidityComfortable').value = this.settings.humidityThresholds.comfortable;
        document.getElementById('humidityHumid').value = this.settings.humidityThresholds.humid;
    }

    // Salvar configurações de limite do formulário
    saveThresholdSettings() {
        const tempUnit = this.settings.temperatureUnit;
        
        // Limites de temperatura - converter de volta para Celsius para armazenamento
        this.settings.tempThresholds.veryCold = this.convertTemperature(
            parseFloat(document.getElementById('tempVeryCold').value), tempUnit, 'celsius'
        );
        this.settings.tempThresholds.cold = this.convertTemperature(
            parseFloat(document.getElementById('tempCold').value), tempUnit, 'celsius'
        );
        this.settings.tempThresholds.mild = this.convertTemperature(
            parseFloat(document.getElementById('tempMild').value), tempUnit, 'celsius'
        );
        this.settings.tempThresholds.warm = this.convertTemperature(
            parseFloat(document.getElementById('tempWarm').value), tempUnit, 'celsius'
        );
        this.settings.tempThresholds.hot = this.convertTemperature(
            parseFloat(document.getElementById('tempHot').value), tempUnit, 'celsius'
        );

        // Limites de precipitação - converter de volta para mm para armazenamento
        const precipUnit = this.settings.precipitationUnit;
        this.settings.precipThresholds.light = this.convertPrecipitation(
            parseFloat(document.getElementById('precipLight').value), precipUnit, 'mm'
        );
        this.settings.precipThresholds.moderate = this.convertPrecipitation(
            parseFloat(document.getElementById('precipModerate').value), precipUnit, 'mm'
        );
        this.settings.precipThresholds.heavy = this.convertPrecipitation(
            parseFloat(document.getElementById('precipHeavy').value), precipUnit, 'mm'
        );
        this.settings.precipThresholds.veryHeavy = this.convertPrecipitation(
            parseFloat(document.getElementById('precipVeryHeavy').value), precipUnit, 'mm'
        );

        // Limites de velocidade do vento - converter de volta para km/h para armazenamento
        const windUnit = this.settings.windSpeedUnit;
        this.settings.windThresholds.light = this.convertWindSpeed(
            parseFloat(document.getElementById('windLight').value), windUnit, 'kmh'
        );
        this.settings.windThresholds.moderate = this.convertWindSpeed(
            parseFloat(document.getElementById('windModerate').value), windUnit, 'kmh'
        );
        this.settings.windThresholds.strong = this.convertWindSpeed(
            parseFloat(document.getElementById('windStrong').value), windUnit, 'kmh'
        );
        this.settings.windThresholds.veryStrong = this.convertWindSpeed(
            parseFloat(document.getElementById('windVeryStrong').value), windUnit, 'kmh'
        );

        // Limites de umidade
        this.settings.humidityThresholds.dry = parseInt(document.getElementById('humidityDry').value);
        this.settings.humidityThresholds.comfortable = parseInt(document.getElementById('humidityComfortable').value);
        this.settings.humidityThresholds.humid = parseInt(document.getElementById('humidityHumid').value);
    }

    // Restaurar limites para padrões
    resetThresholdsToDefaults() {
        // Padrões de temperatura (Celsius)
        this.settings.tempThresholds = {
            veryCold: 0,
            cold: 10,
            mild: 20,
            warm: 25,
            hot: 35
        };

        // Padrões de precipitação (mm)
        this.settings.precipThresholds = {
            light: 2.5,
            moderate: 7.6,
            heavy: 25,
            veryHeavy: 50
        };

        // Padrões de velocidade do vento (km/h)
        this.settings.windThresholds = {
            light: 5,
            moderate: 13,
            strong: 28,
            veryStrong: 63
        };

        // Padrões de umidade (%)
        this.settings.humidityThresholds = {
            dry: 30,
            comfortable: 60,
            humid: 80
        };

        this.loadThresholdSettings();
        this.saveSettings();
    }

    // Definir uma configuração específica
    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applyTheme(); // Reapply theme if it was changed
    }

    // Configurar ouvintes de eventos para página de configurações
    setupEventListeners() {
        // Configurar apenas se estiver na página de configurações
        if (window.location.pathname.includes('info.html')) {
            this.setupSettingsPageListeners();
        }
    }

    // Configurar ouvintes especificamente para página de configurações
    setupSettingsPageListeners() {
        // Alternância de tema
        const themeToggle = document.getElementById('themeToggle');
        const themeLabel = document.getElementById('themeLabel');
        
        if (themeToggle) {
            // Definir estado inicial
            themeToggle.checked = this.settings.theme === 'dark';
            themeLabel.textContent = this.settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode';
            
            themeToggle.addEventListener('change', () => {
                const newTheme = themeToggle.checked ? 'dark' : 'light';
                this.setSetting('theme', newTheme);
                themeLabel.textContent = newTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
                
                // Apply theme immediately to all open pages
                this.broadcastThemeChange(newTheme);
            });
        }

        // Temperature unit
        const tempUnitRadios = document.querySelectorAll('input[name="tempUnit"]');
        tempUnitRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.setSetting('temperatureUnit', radio.id);
                }
            });
        });

        // Wind unit
        const windUnitSelect = document.getElementById('windUnit');
        if (windUnitSelect) {
            windUnitSelect.addEventListener('change', () => {
                this.setSetting('windSpeedUnit', windUnitSelect.value);
            });
        }

        // Precipitation unit
        const precipUnitRadios = document.querySelectorAll('input[name="precipUnit"]');
        precipUnitRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.setSetting('precipitationUnit', radio.id);
                }
            });
        });

        // Refresh rate
        const refreshRateSelect = document.getElementById('refreshRate');
        if (refreshRateSelect) {
            refreshRateSelect.addEventListener('change', () => {
                this.setSetting('refreshRate', refreshRateSelect.value);
            });
        }

        // Default location
        const defaultLocationInput = document.getElementById('defaultLocation');
        if (defaultLocationInput) {
            defaultLocationInput.addEventListener('blur', () => {
                this.setSetting('defaultLocation', defaultLocationInput.value);
            });
        }

        // Use current location button
        const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
        if (useCurrentLocationBtn) {
            useCurrentLocationBtn.addEventListener('click', () => {
                this.getCurrentLocation();
            });
        }

        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveAllSettings();
            });
        }

        // Reset settings button
        const resetSettingsBtn = document.getElementById('resetSettings');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => {
                this.resetAllSettings();
            });
        }

        // Reset thresholds button
        const resetThresholdsBtn = document.getElementById('resetThresholds');
        if (resetThresholdsBtn) {
            resetThresholdsBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all thresholds to defaults?')) {
                    this.resetThresholdsToDefaults();
                }
            });
        }

        // Unit change listeners to update threshold displays
        const tempUnitRadiosThreshold = document.querySelectorAll('input[name="temperatureUnit"]');
        tempUnitRadiosThreshold.forEach(radio => {
            radio.addEventListener('change', () => {
                this.settings.temperatureUnit = radio.value;
                this.loadThresholdSettings();
            });
        });

        const precipUnitRadiosThreshold = document.querySelectorAll('input[name="precipitationUnit"]');
        precipUnitRadiosThreshold.forEach(radio => {
            radio.addEventListener('change', () => {
                this.settings.precipitationUnit = radio.value;
                this.loadThresholdSettings();
            });
        });

        const windUnitSelectThreshold = document.getElementById('windUnit');
        if (windUnitSelectThreshold) {
            windUnitSelectThreshold.addEventListener('change', () => {
                this.settings.windSpeedUnit = windUnitSelectThreshold.value;
                this.loadThresholdSettings();
            });
        }
    }

    // Load all settings into the settings page form
    loadSettingsIntoForm() {
        // Theme
        const themeToggle = document.getElementById('themeToggle');
        const themeLabel = document.getElementById('themeLabel');
        if (themeToggle) {
            themeToggle.checked = this.settings.theme === 'dark';
            themeLabel.textContent = this.settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode';
        }

        // Temperature unit
        if (this.settings.temperatureUnit) {
            const tempUnitRadio = document.getElementById(this.settings.temperatureUnit);
            if (tempUnitRadio) tempUnitRadio.checked = true;
        }

        // Wind unit
        const windUnitSelect = document.getElementById('windUnit');
        if (windUnitSelect) {
            windUnitSelect.value = this.settings.windSpeedUnit;
        }

        // Precipitation unit
        if (this.settings.precipitationUnit) {
            const precipUnitRadio = document.getElementById(this.settings.precipitationUnit);
            if (precipUnitRadio) precipUnitRadio.checked = true;
        }

        // Load threshold settings
        this.loadThresholdSettings();

        // Refresh rate
        const refreshRateSelect = document.getElementById('refreshRate');
        if (refreshRateSelect) {
            refreshRateSelect.value = this.settings.refreshRate;
        }

        // Default location
        const defaultLocationInput = document.getElementById('defaultLocation');
        if (defaultLocationInput) {
            defaultLocationInput.value = this.settings.defaultLocation;
        }
    }

    // Obter localização atual usando API de geolocalização
    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(4);
                    const lng = position.coords.longitude.toFixed(4);
                    const locationInput = document.getElementById('defaultLocation');
                    if (locationInput) {
                        locationInput.value = `${lat}, ${lng}`;
                        this.setSetting('defaultLocation', `${lat}, ${lng}`);
                    }
                },
                (error) => {
                    alert('Não foi possível obter sua localização. Por favor, verifique as configurações do seu navegador.');
                }
            );
        } else {
            alert('A geolocalização não é suportada pelo seu navegador.');
        }
    }

    // Guardar todas as configurações atuais
    saveAllSettings() {
        this.saveSettings();
        alert('Configurações guardadas com sucesso!');
    }

    // Repor todas as configurações para padrões
    resetAllSettings() {
        if (confirm('Tem certeza de que deseja repor todas as configurações para os padrões?')) {
            this.settings = {
                theme: 'light',
                temperatureUnit: 'celsius',
                windSpeedUnit: 'kmh',
                precipitationUnit: 'mm',
                refreshRate: '0',
                defaultLocation: ''
            };
            this.saveSettings();
            this.applyTheme();
            this.loadSettingsIntoForm();
            alert('As configurações foram repostas para os padrões.');
        }
    }

    // Transmitir mudança de tema para outras páginas
    broadcastThemeChange(theme) {
        // Usar localStorage para comunicar mudanças de tema entre páginas
        localStorage.setItem('weatherwise_theme_change', theme);
        localStorage.setItem('weatherwise_theme_timestamp', Date.now().toString());
    }

    // Ouvir por mudanças de tema de outras páginas
    listenForThemeChanges() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'weatherwise_theme_change') {
                const newTheme = e.newValue;
                if (newTheme && newTheme !== this.settings.theme) {
                    this.setSetting('theme', newTheme);
                    this.applyTheme();
                    
                    // Atualizar alternância de tema se estiver na página de configurações
                    const themeToggle = document.getElementById('themeToggle');
                    const themeLabel = document.getElementById('themeLabel');
                    if (themeToggle && themeLabel) {
                        themeToggle.checked = newTheme === 'dark';
                        themeLabel.textContent = newTheme === 'dark' ? 'Modo Escuro' : 'Modo Claro';
                    }
                }
            }
        });
    }
}

// Utilitários de conversão de temperatura
const TemperatureConverter = {
    celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    },
    
    fahrenheitToCelsius(fahrenheit) {
        return (fahrenheit - 32) * 5/9;
    }
};

// Utilitários de conversão de velocidade do vento
const WindSpeedConverter = {
    kmhToMph(kmh) {
        return kmh * 0.621371;
    },
    
    mphToKmh(mph) {
        return mph * 1.60934;
    },
    
    kmhToMs(kmh) {
        return kmh / 3.6;
    },
    
    msToKmh(ms) {
        return ms * 3.6;
    }
};

// Utilitários de conversão de precipitação
const PrecipitationConverter = {
    mmToInches(mm) {
        return mm * 0.0393701;
    },
    
    inchesToMm(inches) {
        return inches * 25.4;
    }
};

// Criar instância global do gestor de configurações imediatamente
window.settingsManager = new SettingsManager();

// Inicializar gestor de configurações quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Carregar configurações no formulário se estiver na página de configurações
    if (window.location.pathname.includes('info.html')) {
        window.settingsManager.loadSettingsIntoForm();
    }
    
    // Começar a ouvir por mudanças de tema
    window.settingsManager.listenForThemeChanges();
});

// Aplicar tema imediatamente quando o script carrega (antes de DOMContentLoaded)
(function() {
    // Verificar se há um tema guardado e aplicá-lo imediatamente
    const savedSettings = localStorage.getItem('weatherwise_settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.theme === 'dark' && document.body) {
            document.body.classList.add('dark-theme');
        }
    }
})();/ /   � l t i m a   a t u a l i z a � � o :   1 0 / 0 5 / 2 0 2 5   2 1 : 1 6 : 2 0 
 
 