// Load the GeoJSON data for German Bundesländer
const geojson = await d3.json("data/4_niedrig.geo.json");
const rewesData = await d3.json("data/bundeslaender_rewes.json");

// Sample data: population by state (in millions, approximate 2023 data)
const populationData = {
    "Schleswig-Holstein": 2.9,
    "Hamburg": 1.9,
    "Niedersachsen": 8.0,
    "Bremen": 0.7,
    "Nordrhein-Westfalen": 17.9,
    "Hessen": 6.3,
    "Rheinland-Pfalz": 4.1,
    "Baden-Württemberg": 11.1,
    "Bayern": 13.1,
    "Saarland": 1.0,
    "Berlin": 3.7,
    "Brandenburg": 2.5,
    "Mecklenburg-Vorpommern": 1.6,
    "Sachsen": 4.1,
    "Sachsen-Anhalt": 2.2,
    "Thüringen": 2.1
};

// Add population data to GeoJSON features
geojson.features.forEach(feature => {
    const name = feature.properties.name;
    feature.properties.rewes = rewesData[name].rewes || 0;
    feature.properties.rewes_per_sq_km = rewesData[name].rewes_per_sq_km || 0;
    feature.properties.total_area_sq_km = rewesData[name].total_area_sq_km || 0;
});

const reweCounts = {};
for (const [state, data] of Object.entries(rewesData)) {
    reweCounts[state] = data.rewes;
}

// Create a color scale
const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, d3.max(Object.values(reweCounts))]);

const mapContainer = document.getElementById("map-container");

// Create a tooltip for this map
const tooltip = document.createElement("div");
tooltip.className = "custom-tooltip plot-style-tooltip";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

// Create the plot
const map = Plot.plot({
    projection: {
        type: "mercator",
        domain: geojson
    },
    marks: [
        Plot.geo(geojson, {
            fill: d => d.properties.rewes,
            stroke: "white",
            strokeWidth: 1,
            channels: {
                state: d => d.properties.name,
                rewes: d => d.properties.rewes
            }
        })
    ],
    color: {
        scheme: "blues",
        domain: [0, d3.max(Object.values(reweCounts))],
        legend: true,
        type: "linear"
    },
    width: 600,
    height: 600,
    marginRight: 100
});

// Add event listeners to each path element
const paths = map.querySelectorAll('path[fill]');
let currentHighlight = null;

paths.forEach((path, index) => {
    const feature = geojson.features[index];
    
    // path.style.cursor = 'pointer';
    path.style.transition = 'all 0.2s ease';
    
    path.addEventListener('mouseenter', function(event) {
        // Highlight the state
        if (currentHighlight) {
            currentHighlight.style.stroke = 'white';
            currentHighlight.style.strokeWidth = '1';
        }
        this.style.stroke = 'orange';
        this.style.strokeWidth = '3';
        currentHighlight = this;
        
        // Show tooltip
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">
                ${feature.properties.name}
            </div>
            <div style="font-size: 12px;">
                REWEs: ${feature.properties.rewes} REWEs
            </div>
        `;
    });
    
    path.addEventListener('mousemove', function(event) {
        // Update tooltip position to follow cursor
        tooltip.style.left = (event.pageX + 15) + 'px';
        tooltip.style.top = (event.pageY + 15) + 'px';
    });
    
    path.addEventListener('mouseleave', function() {
        // Remove highlight
        this.style.stroke = 'white';
        this.style.strokeWidth = '1';
        if (currentHighlight === this) {
            currentHighlight = null;
        }
        
        // Hide tooltip
        tooltip.style.display = 'none';
    });
});

// Add the plot to the page
document.getElementById("map-container").appendChild(map);

// Create data table
const tableData = Object.entries(rewesData)
    .map(([name, data]) => ({
        name,
        rewes: data.rewes,
        area: data.total_area_sq_km,
        density: data.rewes_per_sq_km
    }))
    .sort((a, b) => b.density - a.density);

const table = document.createElement('table');
table.className = 'rewe-data-table';

// Create table header
const thead = document.createElement('thead');
thead.innerHTML = `
    <tr>
        <th>Bundesland</th>
        <th class="number">REWEs</th>
        <th class="number">Area (km²)</th>
        <th class="number">REWEs/km²</th>
    </tr>
`;
table.appendChild(thead);

// Create table body
const tbody = document.createElement('tbody');
tableData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${row.name}</td>
        <td class="number">${row.rewes.toLocaleString()}</td>
        <td class="number">${row.area.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
        <td class="number">${row.density.toFixed(4)}</td>
    `;
    tbody.appendChild(tr);
});
table.appendChild(tbody);

document.getElementById("table-container").appendChild(table);
