// Funzione per caricare e visualizzare l'albero
function initializeTreeChart(data) {
    d3.select("#tree-chart").selectAll("svg").remove();

    const widthdx = 800; // Maggiore larghezza del grafico
    const root = d3.hierarchy(data);
    const dx = 11; // Spaziatura verticale tra i nodi
    const dy = 150; // Spaziatura orizzontale aumentata
    const tree = d3.tree().nodeSize([dx, dy]); // Tree layout

    tree(root);

    // Calcola dimensioni per centrare l'albero
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });

    const heightdx = x1 - x0 + dx * 2;

    // Crea l'SVG e centra l'albero
    const svgdx = d3.select("#tree-chart")
        .append("svg")
        .attr("width", widthdx + 300)
        .attr("height", heightdx)
        .attr("viewBox", [-dy / 1.5, x0 - dx, widthdx+300, heightdx]) // Aumenta la larghezza visibile
        .attr("style", "font: 10px sans-serif;");

    // Disegna i collegamenti
    const link = svgdx.append("g")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("class", "link") // Classe per identificare i collegamenti
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    // Disegna i nodi
    const node = svgdx.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("class", "node") // Classe per identificare i nodi
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .each(function(d) { d.node = this; })
        .on("mouseover", highlightPath) // Aggiungi eventi mouseover
        .on("mouseout", resetHighlight); // Aggiungi eventi mouseout

    // Cerchi nei nodi
    node.append("circle")
        .attr("fill", "#000")
        .attr("r", 4);

    // Testo dei nodi
    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -8 : 8) // Testo a sinistra o destra
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        .attr("fill", "#000"); // Testo nero

    // Funzione per evidenziare il percorso
    function highlightPath(event, d) {
        let current = d;

        // Evidenzia il percorso nell'albero
        while (current) {
            d3.select(current.node) // Nodo cerchio
                .select("circle")
                .attr("fill", "orange");

            d3.select(current.node) // Nodo testo
                .select("text")
                .attr("fill", "orange")
                .style("font-size", "14px");

            d3.selectAll(".link") // Collegamento verso il nodo genitore
                .filter(link => link.target === current)
                .attr("stroke", "orange");

            current = current.parent; // Passa al genitore
        }

        // Evidenziazione del nome del nodo
        d3.select("#selected-node").text(d.data.name).style("color", "orange");
    }

    // Funzione per resettare l'evidenziazione
    function resetHighlight(event, d) {
        // Resetta colori di nodi e collegamenti
        d3.selectAll("circle").attr("fill", "#000");
        d3.selectAll("text")
            .attr("fill", "#000") // Colore testo nero
            .style("font-size", "10px"); // Font di partenza
        d3.selectAll(".link").attr("stroke", "#000");
    }
    // Funzione per gestire il dataset nella sezione extra-info
    function showNodeInfo(nodeData) {
        const infoContainer = document.getElementById("extra-info");
        infoContainer.innerHTML = `
            <h3>${nodeData.name}</h3>
            ${nodeData.value ? `<p>Value: ${nodeData.value}</p>` : ""}
        `;
    }

    // Associa l'evento click ai nodi dell'albero per mostrare i dettagli
    d3.selectAll(".node").on("click", function(event, d) {
        showNodeInfo(d.data);
    });
}

//Caricamento file
d3.json("data_set_tree.json").then(data => {
    initializeTreeChart(data);
}).catch(error => {
    console.error("Errore nel caricamento del file JSON:", error);
});