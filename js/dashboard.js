// Funcionalidade JavaScript do Dashboard

// Variáveis globais
let map;
let marker;
let selectedLocation = null;
let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let charts = {};

// Inicializar o mapa quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Atrasar ligeiramente a inicialização do mapa para garantir que o DOM esteja totalmente pronto
    setTimeout(function() {
        initMap();
        setupEventListeners();
        initCharts();
        initCalendar();
    }, 100);
});

// Inicializar o mapa Leaflet
function initMap() {
    try {
        // Criar mapa centrado numa localização padrão (0,0)
        map = L.map('mapContainer', {
            center: [0, 0],
            zoom: 2,
            zoomControl: true,
            attributionControl: true
        });
        
        // Adicionar camada de tiles do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Forçar um redimensionamento para garantir que o mapa renderiza corretamente
        setTimeout(function() {
            map.invalidateSize();
        }, 100);
        
        // Adicionar controle de geocodificação para pesquisa de localização com autocompletar
        const geocoder = L.Control.geocoder({
            defaultMarkGeocode: false,
            placeholder: 'Search for a location...',
            errorMessage: 'Nothing found.',
            suggestMinLength: 3,
            suggestTimeout: 250,
            queryMinLength: 1
        }).addTo(map);
        
        // Manipular resultados de geocodificação
        geocoder.on('markgeocode', function(e) {
            const latlng = e.geocode.center;
            setLocationMarker(latlng);
            map.fitBounds(e.geocode.bbox);
        });
        
        // Adicionar evento de clique ao mapa
        map.on('click', function(e) {
            setLocationMarker(e.latlng);
        });
    } catch (error) {
        console.error("Error initializing map:", error);
    }
}

// Configurar listeners de eventos para botões e inputs
function setupEventListeners() {
    // Entrada de localização com autocompletar
    const locationInput = document.getElementById('locationInput');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLocation(this.value);
        }
    });
    
    // Adicionar evento de entrada para sugestões de autocompletar
    locationInput.addEventListener('input', function() {
        if (this.value.length >= 3) {
            fetchLocationSuggestions(this.value);
        }
    });
    
    // Listeners de eventos para navegação do calendário
    prevMonthBtn.addEventListener('click', function() {
        navigateMonth(-1);
    });
    
    nextMonthBtn.addEventListener('click', function() {
        navigateMonth(1);
    });
    
    // Botão de análise
    document.getElementById('analyzeBtn').addEventListener('click', function() {
        if (selectedLocation && selectedDate) {
            analyzeWeather();
        } else {
            alert('Please select both a location and a date first');
        }
    });
    
    // Botões de download
    document.getElementById('downloadJsonBtn').addEventListener('click', function() {
        if (selectedLocation && selectedDate) {
            downloadJSON();
        } else {
            alert('Please select a location and date, then analyze weather data first');
        }
    });

    document.getElementById('downloadCsvBtn').addEventListener('click', function() {
        if (selectedLocation && selectedDate) {
            downloadCSV();
        } else {
            alert('Please select a location and date, then analyze weather data first');
        }
    });
}

// Pesquisar uma localização por nome
function searchLocation(locationName) {
    if (!locationName) return;
    
    // Usar API Nominatim para geocodificação (OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const latlng = { 
                    lat: parseFloat(result.lat), 
                    lng: parseFloat(result.lon) 
                };
                setLocationMarker(latlng);
                map.setView(latlng, 10);
                
                // Atualizar entrada de localização com o nome do lugar encontrado
                document.getElementById('locationInput').value = result.display_name;
            } else {
                alert('Location not found. Please try a different search term.');
            }
        })
        .catch(error => {
            console.error('Error searching for location:', error);
            alert('Error searching for location. Please try again.');
        });
}

// Buscar sugestões de localização para autocompletar
function fetchLocationSuggestions(query) {
    if (!query || query.length < 3) return;
    
    // Usar API Nominatim para sugestões de geocodificação
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateSuggestionsList(data);
        })
        .catch(error => {
            console.error('Error fetching location suggestions:', error);
        });
}

// Atualizar a lista de sugestões na interface do usuário
function updateSuggestionsList(suggestions) {
    // Obter ou criar contêiner de sugestões
    let suggestionsContainer = document.getElementById('locationSuggestions');
    
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'locationSuggestions';
        suggestionsContainer.className = 'suggestions-container';
        const locationInputContainer = document.getElementById('locationInput').parentNode;
        locationInputContainer.appendChild(suggestionsContainer);
    }
    
    // Limpar sugestões anteriores
    suggestionsContainer.innerHTML = '';
    
    if (!suggestions || suggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    // Adicionar novas sugestões
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion.display_name;
        
        // Add click event to select this location
        item.addEventListener('click', function() {
            document.getElementById('locationInput').value = suggestion.display_name;
            const latlng = { 
                lat: parseFloat(suggestion.lat), 
                lng: parseFloat(suggestion.lon) 
            };
            setLocationMarker(latlng);
            map.setView(latlng, 10);
            suggestionsContainer.style.display = 'none';
        });
        
        suggestionsContainer.appendChild(item);
    });
    
    // Show suggestions container
     suggestionsContainer.style.display = 'block';
    
    // Ocultar sugestões ao clicar fora
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#locationInput') && !e.target.closest('#locationSuggestions')) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

// Definir um marcador na localização selecionada
function setLocationMarker(latlng) {
    // Remover marcador existente se houver
    if (marker) {
        map.removeLayer(marker);
    }
    
    // Garantir que latlng é um objeto Leaflet LatLng adequado
    const latLngObj = latlng instanceof L.LatLng ? latlng : L.latLng(latlng.lat, latlng.lng);
    
    // Adicionar novo marcador
    marker = L.marker(latLngObj).addTo(map);
    
    // Armazenar localização selecionada
    selectedLocation = {
        lat: latLngObj.lat,
        lng: latLngObj.lng
    };
    
    // Atualizar entrada de localização com coordenadas
    document.getElementById('locationInput').value = `${latLngObj.lat.toFixed(4)}, ${latLngObj.lng.toFixed(4)}`;
    
    // Garantir que o marcador esteja visível
    map.setView(latLngObj, map.getZoom());
}

// Inicializar gráficos Chart.js
function initCharts() {
    // Gráfico de temperatura
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    charts.temperature = new Chart(tempCtx, {
        type: 'bar',
        data: {
            labels: ['Very Cold', 'Cold', 'Mild', 'Warm', 'Hot', 'Very Hot'],
            datasets: [{
                label: 'Temperature Probability (%)',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(0, 123, 255, 0.5)',
                    'rgba(23, 162, 184, 0.5)',
                    'rgba(40, 167, 69, 0.5)',
                    'rgba(255, 193, 7, 0.5)',
                    'rgba(253, 126, 20, 0.5)',
                    'rgba(220, 53, 69, 0.5)'
                ],
                borderColor: [
                    'rgba(0, 123, 255, 1)',
                    'rgba(23, 162, 184, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(253, 126, 20, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // Gráfico de precipitação
    const precipCtx = document.getElementById('precipitationChart').getContext('2d');
    charts.precipitation = new Chart(precipCtx, {
        type: 'bar',
        data: {
            labels: ['None', 'Light', 'Moderate', 'Heavy', 'Very Heavy'],
            datasets: [{
                label: 'Precipitation Probability (%)',
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 255, 255, 0.5)',
                    'rgba(173, 216, 230, 0.5)',
                    'rgba(135, 206, 235, 0.5)',
                    'rgba(65, 105, 225, 0.5)',
                    'rgba(0, 0, 139, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 255, 255, 1)',
                    'rgba(173, 216, 230, 1)',
                    'rgba(135, 206, 235, 1)',
                    'rgba(65, 105, 225, 1)',
                    'rgba(0, 0, 139, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // Gráfico de vento
    const windCtx = document.getElementById('windChart').getContext('2d');
    charts.wind = new Chart(windCtx, {
        type: 'bar',
        data: {
            labels: ['Calm', 'Light', 'Moderate', 'Strong', 'Very Strong'],
            datasets: [{
                label: 'Wind Speed Probability (%)',
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 255, 255, 0.5)',
                    'rgba(144, 238, 144, 0.5)',
                    'rgba(60, 179, 113, 0.5)',
                    'rgba(46, 139, 87, 0.5)',
                    'rgba(0, 100, 0, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 255, 255, 1)',
                    'rgba(144, 238, 144, 1)',
                    'rgba(60, 179, 113, 1)',
                    'rgba(46, 139, 87, 1)',
                    'rgba(0, 100, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // Gráfico de humidade
    const humidityCtx = document.getElementById('humidityChart').getContext('2d');
    charts.humidity = new Chart(humidityCtx, {
        type: 'bar',
        data: {
            labels: ['Very Dry', 'Dry', 'Comfortable', 'Humid', 'Very Humid'],
            datasets: [{
                label: 'Humidity Probability (%)',
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 228, 181, 0.5)',
                    'rgba(250, 250, 210, 0.5)',
                    'rgba(152, 251, 152, 0.5)',
                    'rgba(175, 238, 238, 0.5)',
                    'rgba(176, 224, 230, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 228, 181, 1)',
                    'rgba(250, 250, 210, 1)',
                    'rgba(152, 251, 152, 1)',
                    'rgba(175, 238, 238, 1)',
                    'rgba(176, 224, 230, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Inicializar calendário
function initCalendar() {
    updateCalendarDisplay();
    initYearSelector();
    
    // Adicionar listeners de eventos de clique aos dias do calendário
    document.querySelector('.calendar-table').addEventListener('click', function(e) {
        // Verificar se o elemento clicado é uma célula de dia (td) e não está desativado
        if (e.target.tagName === 'TD' && !e.target.classList.contains('muted')) {
            // Remover classe ativa do dia previamente selecionado
            const previouslySelected = document.querySelector('td.btn-primary');
            if (previouslySelected) {
                previouslySelected.classList.remove('btn-primary');
            }
            
            // Adicionar classe ativa ao dia selecionado
            e.target.classList.add('btn-primary');
            
            // Atualizar data selecionada
            const day = parseInt(e.target.textContent);
            selectedDate = new Date(currentYear, currentMonth, day);
            
            // Atualizar exibição da data selecionada
            document.getElementById('selectedDate').textContent = selectedDate.toLocaleDateString();
        }
    });
    
    // Configurar navegação do mês
    document.getElementById('prevMonth').addEventListener('click', function() {
        navigateMonth(-1);
    });
    
    document.getElementById('nextMonth').addEventListener('click', function() {
        navigateMonth(1);
    });
    
    // Configurar alternância do seletor de ano
    document.getElementById('currentMonthYear').addEventListener('click', function(e) {
        toggleYearSelector();
        e.stopPropagation();
    });
    
    // Fechar seletor de ano ao clicar fora
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#yearSelector') && !e.target.closest('#currentMonthYear')) {
            document.getElementById('yearSelector').classList.remove('show');
        }
    });
}

// Inicializar seletor de ano com uma gama de anos
function initYearSelector() {
    const yearSelector = document.getElementById('yearSelector');
    yearSelector.innerHTML = '';
    
    // Gerar anos (ano atual - 10 até ano atual + 10)
    const currentYearNum = new Date().getFullYear();
    for (let year = currentYearNum - 10; year <= currentYearNum + 10; year++) {
        const yearOption = document.createElement('div');
        yearOption.classList.add('year-option');
        if (year === currentYear) {
            yearOption.classList.add('selected');
        }
        yearOption.textContent = year;
        yearOption.dataset.year = year;
        
        yearOption.addEventListener('click', function() {
            selectYear(year);
        });
        
        yearSelector.appendChild(yearOption);
    }
}

// Alternar visibilidade do seletor de ano
function toggleYearSelector() {
    const yearSelector = document.getElementById('yearSelector');
    yearSelector.classList.toggle('show');
    
    // Rolar para o ano selecionado
    if (yearSelector.classList.contains('show')) {
        const selectedYearElement = yearSelector.querySelector('.year-option.selected');
        if (selectedYearElement) {
            selectedYearElement.scrollIntoView({ block: 'center' });
        }
    }
}

// Selecionar um ano e atualizar calendário
function selectYear(year) {
    currentYear = year;
    updateCalendarDisplay();
    
    // Atualizar ano selecionado no seletor
    const yearOptions = document.querySelectorAll('.year-option');
    yearOptions.forEach(option => {
        if (parseInt(option.dataset.year) === year) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Ocultar seletor de ano
    document.getElementById('yearSelector').classList.remove('show');
}

// Atualizar exibição do calendário baseado no mês e ano atuais
function updateCalendarDisplay() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Atualizar exibição de mês e ano
    document.getElementById('currentMonthYear').textContent = monthNames[currentMonth] + ' ' + currentYear;
    
    // Obter primeiro dia do mês e total de dias no mês
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Obter dias no mês anterior
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // Limpar calendário existente
    const tbody = document.getElementById('calendarBody');
    tbody.innerHTML = '';
    
    let date = 1;
    let nextMonthDate = 1;
    
    // Criar linhas do calendário
    for (let i = 0; i < 6; i++) {
        // Criar uma linha
        const row = document.createElement('tr');
        
        // Criar células para cada dia da semana
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            
            // Preencher dias do mês anterior
            if (i === 0 && j < firstDay) {
                const prevMonthDay = daysInPrevMonth - (firstDay - j - 1);
                cell.textContent = prevMonthDay;
                cell.classList.add('muted');
            }
            // Preencher dias do mês atual
            else if (date <= daysInMonth) {
                cell.textContent = date;
                
                // Destacar data de hoje
                const today = new Date();
                if (date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                    cell.classList.add('btn-info');
                }
                
                // Destacar data selecionada se existir
                if (selectedDate && date === selectedDate.getDate() && 
                    currentMonth === selectedDate.getMonth() && 
                    currentYear === selectedDate.getFullYear()) {
                    cell.classList.add('btn-primary');
                }
                
                date++;
            }
            // Preencher dias do próximo mês
            else {
                cell.textContent = nextMonthDate;
                cell.classList.add('muted');
                nextMonthDate++;
            }
            
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
        
        // Parar de criar linhas se já passámos o mês atual
        if (date > daysInMonth && i >= 4) break;
    }
}

// Navegar para o mês anterior ou seguinte
function navigateMonth(direction) {
    currentMonth += direction;
    
    // Manipular mudança de ano
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    // Garantir que o mês esteja dentro dos limites válidos (0-11)
    currentMonth = ((currentMonth % 12) + 12) % 12;
    
    updateCalendarDisplay();
}

// Analisar dados meteorológicos das APIs da NASA
function analyzeWeather() {
    if (!selectedDate) {
        alert('Por favor selecione uma data do calendário');
        return; 
    }
    
    // Obter mês da data selecionada (0-11)
    const month = selectedDate.getMonth();
    
    // Mostrar estado de carregamento
    document.getElementById('weatherSummary').textContent = 'Carregando dados meteorológicos...';
    
    // Buscar dados da API NASA POWER
    fetchNasaData(selectedLocation.lat, selectedLocation.lng, month)
        .then(data => {
            // Processar dados e atualizar gráficos
            updateCharts(data);
            // Atualizar texto de resumo
            updateSummary(data);
        })
        .catch(error => {
            console.error('Erro ao buscar dados da NASA:', error);
            document.getElementById('weatherSummary').textContent = 'Erro ao buscar dados meteorológicos. Por favor tente novamente.';
        });
}

// Buscar dados da API NASA POWER
function fetchNasaData(lat, lng, month) {
    // Em uma aplicação real, isto faria uma chamada de API real para a NASA
    // Para esta demonstração, vamos simular os dados
    
    return new Promise((resolve) => {
        // Simular atraso de API
        setTimeout(() => {
            // Gerar dados aleatórios baseados na localização e mês
            // Isto é apenas para demonstração - aplicação real usaria dados reais da API NASA
        
            // Ajustar probabilidades de temperatura baseadas na latitude e mês
            let tempFactor = Math.abs(lat) / 90; // 0 no equador, 1 nos polos
            let monthFactor = Math.abs(month - 6.5) / 5.5; // 0 no meio do ano, 1 no início/fim
                
                // Hemisfério norte
                if (lat > 0) {
                    // Verão é quente (meio do ano)
                    monthFactor = 1 - monthFactor;
                }
                
                // Gerar probabilidades de temperatura
                const tempProbs = [
                    Math.round(tempFactor * monthFactor * 100), // Muito Frio
                    Math.round(tempFactor * 80 - monthFactor * 40), // Frio
                    Math.round(50 - Math.abs(monthFactor - 0.5) * 50), // Ameno
                    Math.round(50 - tempFactor * 50 + monthFactor * 30), // Quente
                    Math.round((1 - tempFactor) * monthFactor * 80), // Muito Quente
                    Math.round((1 - tempFactor) * monthFactor * 50)  // Extremamente Quente
                ];
                
                // Normalizar para garantir que a soma é razoável (não exatamente 100% pois estas são probabilidades independentes)
                const tempSum = tempProbs.reduce((a, b) => a + b, 0);
                const normalizedTempProbs = tempProbs.map(p => Math.round(p * 100 / tempSum));
                
                // Gerar outras probabilidades meteorológicas
                const precipProbs = [
                    Math.round(50 - monthFactor * 30), // Nenhuma
                    Math.round(30 + monthFactor * 20), // Leve
                    Math.round(10 + monthFactor * 20), // Moderada
                    Math.round(5 + monthFactor * 10),  // Pesada
                    Math.round(monthFactor * 5)        // Muito Pesada
                ];
                
                const windProbs = [
                    Math.round(20 - monthFactor * 10), // Calmo
                    Math.round(40 - monthFactor * 10), // Leve
                    Math.round(20 + monthFactor * 10), // Moderado
                    Math.round(10 + monthFactor * 5),  // Forte
                    Math.round(5 + monthFactor * 5)    // Muito Forte
                ];
                
                const humidityProbs = [
                    Math.round(10 + tempFactor * 20),  // Muito Seco
                    Math.round(20 + tempFactor * 10),  // Seco
                    Math.round(40 - tempFactor * 10),  // Confortável
                    Math.round(20 - tempFactor * 5 + monthFactor * 10), // Húmido
                    Math.round(10 - tempFactor * 5 + monthFactor * 15)  // Muito Húmido
                ];
                
                // Normalizar todas as probabilidades para garantir que somam 100%
                const precipSum = precipProbs.reduce((a, b) => a + b, 0);
                const normalizedPrecipProbs = precipProbs.map(p => Math.round(p * 100 / precipSum));
                
                const windSum = windProbs.reduce((a, b) => a + b, 0);
                const normalizedWindProbs = windProbs.map(p => Math.round(p * 100 / windSum));
                
                const humiditySum = humidityProbs.reduce((a, b) => a + b, 0);
                const normalizedHumidityProbs = humidityProbs.map(p => Math.round(p * 100 / humiditySum));
                
                const data = {
                    temperature: normalizedTempProbs,
                    precipitation: normalizedPrecipProbs,
                    wind: normalizedWindProbs,
                    humidity: normalizedHumidityProbs
                };
                
                resolve({
                    temperature: normalizedTempProbs,
                    precipitation: normalizedPrecipProbs,
                    wind: normalizedWindProbs,
                    humidity: normalizedHumidityProbs
                });
        }, 1000);
    });
}

// Gerar etiquetas de limiar baseadas nas configurações do utilizador
function generateThresholdLabels() {
    const settings = window.settingsManager ? window.settingsManager.getSettings() : {
        temperatureUnit: 'celsius',
        windSpeedUnit: 'kmh',
        precipitationUnit: 'mm',
        tempThresholds: { veryCold: 0, cold: 10, mild: 20, warm: 25, hot: 35 },
        precipThresholds: { light: 2.5, moderate: 7.6, heavy: 25, veryHeavy: 50 },
        windThresholds: { light: 5, moderate: 13, strong: 28, veryStrong: 63 }
    };
    const tempUnit = settings.temperatureUnit || 'celsius';
    const windUnit = settings.windSpeedUnit || 'kmh';
    const precipUnit = settings.precipitationUnit || 'mm';
    
    // Obter limiares das configurações
    const tempThresholds = settings.tempThresholds || {
        veryCold: 0, cold: 10, mild: 20, warm: 25, hot: 35
    };
    const precipThresholds = settings.precipThresholds || {
        light: 2.5, moderate: 7.6, heavy: 25, veryHeavy: 50
    };
    const windThresholds = settings.windThresholds || {
        light: 5, moderate: 13, strong: 28, veryStrong: 63
    };
    
    // Converter limiares de temperatura para unidade de exibição
    const convertTemp = (value) => {
        if (tempUnit === 'fahrenheit') {
            return Math.round(value * 9/5 + 32);
        }
        return value;
    };
    
    // Converter limiares de precipitação para unidade de exibição
    const convertPrecip = (value) => {
        if (precipUnit === 'inches') {
            return Math.round(value / 25.4 * 10) / 10;
        }
        return value;
    };
    
    // Converter limiares de velocidade do vento para unidade de exibição
    const convertWind = (value) => {
        if (windUnit === 'mph') {
            return Math.round(value / 1.60934 * 10) / 10;
        } else if (windUnit === 'ms') {
            return Math.round(value / 3.6 * 10) / 10;
        }
        return value;
    };
    
    const tempUnitSymbol = tempUnit === 'fahrenheit' ? '°F' : '°C';
    const precipUnitSymbol = precipUnit === 'inches' ? '"' : 'mm';
    const windUnitSymbol = windUnit === 'mph' ? 'mph' : windUnit === 'ms' ? 'm/s' : 'km/h';
    
    return {
        temperature: [
            `Very Cold (<${convertTemp(tempThresholds.veryCold)}${tempUnitSymbol})`,
            `Cold (${convertTemp(tempThresholds.veryCold)}-${convertTemp(tempThresholds.cold)}${tempUnitSymbol})`,
            `Mild (${convertTemp(tempThresholds.cold)}-${convertTemp(tempThresholds.mild)}${tempUnitSymbol})`,
            `Warm (${convertTemp(tempThresholds.mild)}-${convertTemp(tempThresholds.warm)}${tempUnitSymbol})`,
            `Hot (${convertTemp(tempThresholds.warm)}-${convertTemp(tempThresholds.hot)}${tempUnitSymbol})`,
            `Very Hot (>${convertTemp(tempThresholds.hot)}${tempUnitSymbol})`
        ],
        precipitation: [
            `None (0${precipUnitSymbol})`,
            `Light (0-${convertPrecip(precipThresholds.light)}${precipUnitSymbol})`,
            `Moderate (${convertPrecip(precipThresholds.light)}-${convertPrecip(precipThresholds.moderate)}${precipUnitSymbol})`,
            `Heavy (${convertPrecip(precipThresholds.moderate)}-${convertPrecip(precipThresholds.heavy)}${precipUnitSymbol})`,
            `Very Heavy (>${convertPrecip(precipThresholds.veryHeavy)}${precipUnitSymbol})`
        ],
        wind: [
            `Calm (0-${convertWind(windThresholds.light)}${windUnitSymbol})`,
            `Light (${convertWind(windThresholds.light)}-${convertWind(windThresholds.moderate)}${windUnitSymbol})`,
            `Moderate (${convertWind(windThresholds.moderate)}-${convertWind(windThresholds.strong)}${windUnitSymbol})`,
            `Strong (${convertWind(windThresholds.strong)}-${convertWind(windThresholds.veryStrong)}${windUnitSymbol})`,
            `Very Strong (>${convertWind(windThresholds.veryStrong)}${windUnitSymbol})`
        ],
        humidity: [
            'Very Dry (<30%)',
            'Dry (30-60%)',
            'Comfortable (60-80%)',
            'Humid (80-90%)',
            'Very Humid (>90%)'
        ]
    };
}

// Atualizar gráficos com novos dados
function updateCharts(data) {
    // Obter configurações para conversões de unidades
    const settings = window.settingsManager ? window.settingsManager.getSettings() : {
        temperatureUnit: 'celsius',
        windSpeedUnit: 'kmh',
        precipitationUnit: 'mm'
    };
    const tempUnit = settings.temperatureUnit || 'celsius';
    const windUnit = settings.windSpeedUnit || 'kmh';
    const precipUnit = settings.precipitationUnit || 'mm';
    
    // Gerar etiquetas de limiar
    const labels = generateThresholdLabels();
    
    // Atualizar gráfico de temperatura
    if (data.temperature) {
        charts.temperature.data.datasets[0].data = data.temperature;
        charts.temperature.data.labels = labels.temperature;
        charts.temperature.update();
    }
    
    // Atualizar gráfico de precipitação apenas se marcado
    if (document.getElementById('precipitationCheck').checked && data.precipitation) {
        charts.precipitation.data.datasets[0].data = data.precipitation;
        charts.precipitation.data.labels = labels.precipitation;
        charts.precipitation.update();
        document.getElementById('precipitationChart').closest('.chart-container').style.display = 'block';
    } else {
        document.getElementById('precipitationChart').closest('.chart-container').style.display = 'none';
    }
    
    // Atualizar gráfico de vento apenas se marcado
    if (document.getElementById('windSpeedCheck').checked && data.wind) {
        charts.wind.data.datasets[0].data = data.wind;
        charts.wind.data.labels = labels.wind;
        charts.wind.update();
        document.getElementById('windChart').closest('.chart-container').style.display = 'block';
    } else {
        document.getElementById('windChart').closest('.chart-container').style.display = 'none';
    }
    
    // Atualizar gráfico de humidade apenas se marcado
    if (document.getElementById('humidityCheck').checked && data.humidity) {
        charts.humidity.data.datasets[0].data = data.humidity;
        charts.humidity.data.labels = labels.humidity;
        charts.humidity.update();
        document.getElementById('humidityChart').closest('.chart-container').style.display = 'block';
    } else {
        document.getElementById('humidityChart').closest('.chart-container').style.display = 'none';
    }
}

// Atualizar texto de resumo
function updateSummary(data) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = selectedDate ? months[selectedDate.getMonth()] : '';
    const location = document.getElementById('locationInput').value;
    
    // Generate threshold labels
    const labels = generateThresholdLabels();
    
    // Find conditions with highest probability
    const maxTempIndex = data.temperature.indexOf(Math.max(...data.temperature));
    const maxPrecipIndex = data.precipitation.indexOf(Math.max(...data.precipitation));
    const maxWindIndex = data.wind.indexOf(Math.max(...data.wind));
    const maxHumidityIndex = data.humidity.indexOf(Math.max(...data.humidity));
    
    // Extract condition names from labels (remove ranges in parentheses)
    const tempConditions = labels.temperature.map(label => label.replace(/\s*\([^)]*\)/g, '').toLowerCase());
    const precipConditions = labels.precipitation.map(label => label.replace(/\s*\([^)]*\)/g, '').toLowerCase());
    const windConditions = labels.wind.map(label => label.replace(/\s*\([^)]*\)/g, '').toLowerCase());
    const humidityConditions = labels.humidity.map(label => label.replace(/\s*\([^)]*\)/g, '').toLowerCase());
    
    // Create summary text
    let summary = `For ${month} in ${location}, there is a ${data.temperature[maxTempIndex]}% probability of ${tempConditions[maxTempIndex]} weather`;
    
    // Add precipitation if checked
    if (document.getElementById('precipitationCheck').checked) {
        summary += `, a ${data.precipitation[maxPrecipIndex]}% probability of ${precipConditions[maxPrecipIndex]}`;
    }
    
    // Add wind if checked
    if (document.getElementById('windSpeedCheck').checked) {
        summary += `, and a ${data.wind[maxWindIndex]}% probability of ${windConditions[maxWindIndex]}`;
    }
    
    // Add humidity if checked
    if (document.getElementById('humidityCheck').checked) {
        summary += `. Humidity is likely to be ${humidityConditions[maxHumidityIndex]} (${data.humidity[maxHumidityIndex]}%)`;
    }
    
    summary += '.';
    
    // Update summary text
    document.getElementById('weatherSummary').textContent = summary;
}

// Descarregar dados como JSON
function downloadJSON() {
    if (!selectedLocation || !selectedDate) {
        alert('Por favor selecione uma localização e data primeiro, depois analise os dados meteorológicos.');
        return;
    }
    
    const location = document.getElementById('locationInput').value;
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const month = months[selectedDate.getMonth()];
    
    // Verificar se os dados foram analisados
    const hasData = charts.temperature && charts.temperature.data && 
                   charts.temperature.data.datasets && charts.temperature.data.datasets[0] &&
                   charts.temperature.data.datasets[0].data.some(value => value > 0);
    
    if (!hasData) {
        alert('Por favor analise os dados meteorológicos primeiro clicando no botão "Analisar Meteorologia".');
        return;
    }
    
    // Obter configurações atuais para unidades
    const settings = window.settingsManager ? window.settingsManager.getSettings() : {
        temperatureUnit: 'celsius',
        windSpeedUnit: 'kmh',
        precipitationUnit: 'mm'
    };
    
    // Criar objeto de dados abrangente
    const data = {
        location: location,
        coordinates: {
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng
        },
        month: month,
        analysis_date: new Date().toISOString(),
        data_source: "API NASA POWER (simulada)",
        settings: {
            temperature_unit: settings.temperatureUnit,
            wind_speed_unit: settings.windSpeedUnit,
            precipitation_unit: settings.precipitationUnit
        },
        probabilities: {
            temperature: {
                very_cold: charts.temperature.data.datasets[0].data[0] || 0,
                cold: charts.temperature.data.datasets[0].data[1] || 0,
                mild: charts.temperature.data.datasets[0].data[2] || 0,
                warm: charts.temperature.data.datasets[0].data[3] || 0,
                hot: charts.temperature.data.datasets[0].data[4] || 0,
                very_hot: charts.temperature.data.datasets[0].data[5] || 0
            },
            precipitation: {
                none: charts.precipitation.data.datasets[0].data[0] || 0,
                light: charts.precipitation.data.datasets[0].data[1] || 0,
                moderate: charts.precipitation.data.datasets[0].data[2] || 0,
                heavy: charts.precipitation.data.datasets[0].data[3] || 0,
                very_heavy: charts.precipitation.data.datasets[0].data[4] || 0
            },
            wind: {
                calm: charts.wind.data.datasets[0].data[0] || 0,
                light: charts.wind.data.datasets[0].data[1] || 0,
                moderate: charts.wind.data.datasets[0].data[2] || 0,
                strong: charts.wind.data.datasets[0].data[3] || 0,
                very_strong: charts.wind.data.datasets[0].data[4] || 0
            },
            humidity: {
                very_dry: charts.humidity.data.datasets[0].data[0] || 0,
                dry: charts.humidity.data.datasets[0].data[1] || 0,
                comfortable: charts.humidity.data.datasets[0].data[2] || 0,
                humid: charts.humidity.data.datasets[0].data[3] || 0,
                very_humid: charts.humidity.data.datasets[0].data[4] || 0
            }
        }
    };
    
    // Criar nome de ficheiro
    const safeLocation = location.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `weatherwise_${safeLocation}_${month.toLowerCase()}.json`;
    
    // Descarregar JSON
    const jsonData = JSON.stringify(data, null, 2);
    const jsonBlob = new Blob([jsonData], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = filename;
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonUrl);
}

// Descarregar dados como CSV
function downloadCSV() {
    if (!selectedLocation || !selectedDate) {
        alert('Por favor selecione uma localização e data primeiro, depois analise os dados meteorológicos.');
        return;
    }
    
    const location = document.getElementById('locationInput').value;
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const month = months[selectedDate.getMonth()];
    
    // Verificar se os dados foram analisados
    const hasData = charts.temperature && charts.temperature.data && 
                   charts.temperature.data.datasets && charts.temperature.data.datasets[0] &&
                   charts.temperature.data.datasets[0].data.some(value => value > 0);
    
    if (!hasData) {
        alert('Por favor analise os dados meteorológicos primeiro clicando no botão "Analisar Meteorologia".');
        return;
    }
    
    // Obter configurações atuais para unidades
    const settings = window.settingsManager ? window.settingsManager.getSettings() : {
        temperatureUnit: 'celsius',
        windSpeedUnit: 'kmh',
        precipitationUnit: 'mm'
    };
    
    // Create CSV data
    let csvContent = 'Weather Parameter,Condition,Probability (%),Unit\n';
    
    // Temperature data
    const tempConditions = ['Very Cold', 'Cold', 'Mild', 'Warm', 'Hot', 'Very Hot'];
    const tempData = charts.temperature.data.datasets[0].data;
    tempConditions.forEach((condition, index) => {
        csvContent += `Temperature,${condition},${tempData[index] || 0},${settings.temperatureUnit}\n`;
    });
    
    // Precipitation data
    const precipConditions = ['None', 'Light', 'Moderate', 'Heavy', 'Very Heavy'];
    const precipData = charts.precipitation.data.datasets[0].data;
    precipConditions.forEach((condition, index) => {
        csvContent += `Precipitation,${condition},${precipData[index] || 0},${settings.precipitationUnit}\n`;
    });
    
    // Wind data
    const windConditions = ['Calm', 'Light', 'Moderate', 'Strong', 'Very Strong'];
    const windData = charts.wind.data.datasets[0].data;
    windConditions.forEach((condition, index) => {
        csvContent += `Wind Speed,${condition},${windData[index] || 0},${settings.windSpeedUnit}\n`;
    });
    
    // Humidity data
    const humidityConditions = ['Very Dry', 'Dry', 'Comfortable', 'Humid', 'Very Humid'];
    const humidityData = charts.humidity.data.datasets[0].data;
    humidityConditions.forEach((condition, index) => {
        csvContent += `Humidity,${condition},${humidityData[index] || 0},%\n`;
    });
    
    // Create filename
    const safeLocation = location.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `weatherwise_${safeLocation}_${month.toLowerCase()}.csv`;
    
    // Download CSV
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = filename;
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvUrl);
}