    <script>
        // 1. KARTEN-INITIALISIERUNG
        // Zentrale Ausrichtung auf den Mittelmeerraum (Rom / Griechenland / Kleinasien)
        const map = L.map('map', {
            center: [38.5, 20.0], // Koordinaten [Breitengrad, Längengrad]
            zoom: 5,
            minZoom: 3,
            maxZoom: 12
        });

        // Hinzufügen einer eleganten, zurückhaltenden Hintergrundkarte (Basemap)
        // Positron von CartoDB eignet sich hervorragend für historische Overlays
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | Map data: AWMC',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // 2. GEOJSON LADEN (Provinzen)
        // Hier simulieren wir den Zugriff auf deine 'data/provinces.geojson'
        fetch('data/provinces.geojson')
            .then(response => {
                if (!response.ok) throw new Error("GeoJSON Datei nicht gefunden.");
                return response.json();
            })
            .then(data => {
                // GeoJSON zur Karte hinzufügen mit spezifischem Styling
                L.geoJSON(data, {
                    style: function (feature) {
                        return {
                            color: "#8B0000",   // Grenzlinien in Rot
                            weight: 1,          // Liniendicke
                            opacity: 0.3,       // Transparenz der Linien
                            fillColor: "#eab308", // Füllfarbe der Provinzen
                            fillOpacity: 0.05   // Sehr leicht transparent gefüllt
                        };
                    }
                }).addTo(map);
            })
            .catch(error => {
                // Fallback / Fehlerbehandlung für diese Vorschau-Umgebung
                console.info("Hinweis: data/provinces.geojson konnte in der Vorschau nicht geladen werden. Die Karte funktioniert aber weiterhin. Fehler: " + error.message);
                
                // Für diese Demo lade ich ein Dummy-Rechteck, damit du siehst, wie ein GeoJSON aussehen würde
                const dummyGeoJSON = {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [[[10, 35], [30, 35], [30, 45], [10, 45], [10, 35]]]
                        },
                        "properties": {"name": "Demonstrations-Bereich"}
                    }]
                };
                L.geoJSON(dummyGeoJSON, {
                    style: { color: "#8B0000", weight: 2, fillOpacity: 0.0, dashArray: "5, 5" }
                }).addTo(map);
            });

        // 3. DATEN FÜR DIE STECKNADELN (Kaiserpriesterinnen)
        // Dies ist ein Array mit Dummy-Daten. Du kannst dieses später durch eine JSON-Datei 
        // oder eine Datenbankabfrage ersetzen.
        const epigraphData = [
            {
                id: 1,
                name: "Flavia Vibia Sabina",
                locationName: "Ephesos, Asia",
                date: "ca. 120-130 n. Chr.",
                lat: 37.9398, 
                lng: 27.3406,
                shortText: "Ehreninschrift für die Oberpriesterin",
                epigraph: "Der Rat und das Volk von Ephesos ehren Flavia Vibia Sabina, herausragende Oberpriesterin von Asia und Wohltäterin der Stadt...",
                context: "Flavia Vibia Sabina stammte aus einer sehr einflussreichen Familie. Das Amt der Archiereia (Oberpriesterin) des Kaiserkultes in der Provinz Asia war eines der prestigeträchtigsten Ämter, die eine Frau im Osten des Römischen Reiches bekleiden konnte. Sie stiftete wahrscheinlich Bauten oder richtete Spiele aus.",
                reference: "IEph 1004"
            },
            {
                id: 2,
                name: "Iulia Agrippina",
                locationName: "Lugdunum (Lyon), Gallia Lugdunensis",
                date: "ca. 40 n. Chr.",
                lat: 45.7640, 
                lng: 4.8357,
                shortText: "Widmung am Altar der Roma und des Augustus",
                epigraph: "[Rekonstruierter Text] ...für das Wohl des Kaisers, geweiht von den Priesterinnen...",
                context: "Lugdunum war das Zentrum des Kaiserkultes für die drei gallischen Provinzen. Während Frauen oft als Flaminicae (Priesterinnen) der vergöttlichten Kaiserinnen (Divae) auftraten, zeigt die Epigraphik hier eine komplexe Verflechtung lokaler gallischer Eliten mit römischen Herrschaftsstrukturen.",
                reference: "CIL XIII, 1668"
            },
            {
                id: 3,
                name: "Memmia Iuliana",
                locationName: "Aphrodisias, Caria",
                date: "spätes 2. Jh. n. Chr.",
                lat: 37.7088, 
                lng: 28.7236,
                shortText: "Statubenbasis einer Archiereia",
                epigraph: "Die Stadt ehrt Memmia Iuliana, Archiereia der Kaiser, Tochter von Memmius, wegen ihrer außerordentlichen Tugend und Freigebigkeit...",
                context: "In Aphrodisias ist das Sebasteion (Kaiserkult-Tempel) ein prominentes archäologisches Zeugnis. Frauen aus der städtischen Elite spielten eine zentrale Rolle bei der Finanzierung von Festen, was ihnen enorme gesellschaftliche Sichtbarkeit verschaffte.",
                reference: "IAph2007 12-509"
            },
            {
                id: 4,
                name: "Anonyme Flaminica",
                locationName: "Tarraco (Tarragona), Hispania Tarraconensis",
                date: "1. Jh. n. Chr.",
                lat: 41.1189, 
                lng: 1.2445,
                shortText: "Fragment einer Priesterin der Diva Augusta",
                epigraph: "... Flaminica provinciae Hispaniae citerioris ...",
                context: "Das Amt der Provinzialpriesterin (Flaminica) in Tarraco war oft Ehefrauen der Provinzialpriester (Flamen) vorbehalten, doch agierten sie vielfach als eigenständige Stifterinnen. Der Kult richtete sich hier oft speziell an Diva Augusta (Livia).",
                reference: "RIT 288"
            }
        ];

        // 4. MARKER AUF DER KARTE PLATZIEREN
        
        // HTML-Elemente der Sidebar referenzieren
        const introTextDiv = document.getElementById('intro-text');
        const detailsDiv = document.getElementById('epigraph-details');
        const btnBack = document.getElementById('btn-back');

        // Funktion zum Aktualisieren der Seitenleiste
        function showDetails(data) {
            // Inhalte austauschen
            document.getElementById('detail-name').innerText = data.name;
            document.getElementById('detail-location').innerText = `${data.locationName} • ${data.date}`;
            document.getElementById('detail-text').innerText = data.epigraph;
            document.getElementById('detail-context').innerText = data.context;
            document.getElementById('detail-ref').innerText = data.reference;

            // Ansicht wechseln
            introTextDiv.classList.add('hidden');
            detailsDiv.classList.remove('hidden');
        }

        // Event Listener für den "Zurück"-Button
        btnBack.addEventListener('click', () => {
            detailsDiv.classList.add('hidden');
            introTextDiv.classList.remove('hidden');
            // Karte wieder auf den ursprünglichen Zustand zentrieren
            map.setView([38.5, 20.0], 5);
        });

        // Schleife durch die Daten, um Marker zu erstellen
        epigraphData.forEach(item => {
            // Marker erstellen (Wir können hier auch Custom Icons für antike Säulen o.ä. verwenden)
            const marker = L.marker([item.lat, item.lng]).addTo(map);
            
            // Tooltip (erscheint beim Hovern)
            marker.bindTooltip(`<strong>${item.name}</strong><br>${item.locationName}`, {
                direction: 'top',
                className: 'font-sans text-sm'
            });

            // Klick-Ereignis für den Marker
            marker.on('click', () => {
                // Karte auf den Marker zentrieren und leicht heranzoomen
                map.flyTo([item.lat, item.lng], 8, {
                    duration: 1.5 // Weiche Animation
                });
                
                // Sidebar aktualisieren
                showDetails(item);
            });
        });

        // Zusätzlicher CSS Code für eine weiche Einblend-Animation in Tailwind
        tailwind.config.theme.extend.animation = {
            'fade-in': 'fadeIn 0.5s ease-out'
        };
        tailwind.config.theme.extend.keyframes = {
            fadeIn: {
                '0%': { opacity: '0', transform: 'translateY(10px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
            }
        };
    </script>
