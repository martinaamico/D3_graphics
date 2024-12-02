
// In tree.js
function showNodeInfo(nodeData) {
    const infoContainer = document.getElementById("extra-info");

    fetch('dati_specifici.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Errore nel caricamento del file JSON");
            }
            return response.json();
        })
        .then(data => {
            const geneInfo = findGeneInfo(data, nodeData.data.name);

            if (geneInfo) {
                infoContainer.innerHTML = `
                    <div class="gene-info">
                        <h3>${geneInfo.nome}</h3>
                        <p><strong>Spiegazione della funzione:</strong> ${geneInfo.spiegazione_della_funzione}</p>
                        <p><strong>Scoperta:</strong> ${geneInfo.scoperta}</p>
                        <p><strong>Posizione del filamento:</strong> ${geneInfo.posizione_del_filamento}</p>
                        <p><strong>Importanza clinica:</strong> ${geneInfo.importanza_clinica}</p>
                        <p><strong>Altri dettagli:</strong> ${geneInfo.applicazioni_biotecnologiche || geneInfo.terapie_correlate || ""}</p>
                    </div>
                `;
            } else {
                infoContainer.innerHTML = `<p>Informazioni non disponibili per il gene: ${nodeData.data.name}</p>`;
            }
        })
        .catch(error => {
            console.error("Errore durante il caricamento delle informazioni del gene:", error);
            infoContainer.innerHTML = `<p>Errore nel caricamento delle informazioni.</p>`;
        });
}

function findGeneInfo(data, geneName) {
    for (const category in data.GeneOntology) {
        for (const subcategory in data.GeneOntology[category]) {
            const genes = data.GeneOntology[category][subcategory];
            const gene = genes.find(g => g.nome === geneName);
            if (gene) {
                return gene;
            }
        }
    }
    return null;
}
function highlightPathbyName(geneName) {
    // Trova il nodo corrispondente al gene nell'albero
    
    const targetNode = d3.selectAll(".node")
        .filter(function(d) {
            return d.data.name === geneName;
        })
        .datum(); // Ottieni i dati del nodo selezionato
    console.log(geneName)
    
    if (!targetNode) {
        console.error(`Nodo non trovato per il gene: ${geneName}`);
        return;
    }

    // Resetta l'evidenziazione esistente
    resetHighlight();

    // Evidenzia il percorso dal nodo al genitore
    let current = targetNode;
    while (current) {
        d3.select(current.node) // Evidenzia il nodo
            .select("circle")
            .attr("fill", "orange");

        d3.select(current.node) // Evidenzia il testo
            .select("text")
            .attr("fill", "orange")
            .style("font-size", "14px");

        d3.selectAll(".link") // Evidenzia il collegamento verso il genitore
            .filter(link => link.target === current)
            .attr("stroke", "orange");

        current = current.parent; // Passa al nodo genitore
    }

    // Mostra il nome del gene evidenziato
    d3.select("#selected-node").text(targetNode.data.name).style("color", "orange");
}
// Funzione per resettare l'evidenziazione
function resetHighlight() {
    // Resetta colori di nodi e collegamenti
    d3.selectAll("circle").attr("fill", "#000");
    d3.selectAll("text")
        .attr("fill", "#000") // Colore testo nero
        .style("font-size", "10px"); // Font di partenza
    d3.selectAll(".link").attr("stroke", "#000");
}


function initializeTreeChart(data) {
    let selectedNode = null; // Nodo selezionato

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
        .attr("viewBox", [-dy / 1.5, x0 - dx, widthdx + 300, heightdx]) // Aumenta la larghezza visibile
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
        .each(function(d) { d.node = this; });

    console.log("dati da root",root)
        // Cerchi nei nodi
    node.append("circle")
        .attr("fill", "#000")
        .attr("r", 4)
        .style("cursor", "pointer"); // Imposta il cursore "pointer" sui cerchi

        // Testo dei nodi
    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -8 : 8) // Testo a sinistra o destra
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        .attr("fill", "#000") // Testo nero
        .style("cursor", "pointer"); // Imposta il cursore "pointer" sui testi

    // Funzione per evidenziare il percorso
    function highlightPath(d) {
        //console.log("Calling selectTreetochord with:", d.data.name); // Debug
        //selectTreetochord(d.data.name);
        console.log("nome d", d.data.name);
        evidenziaArc(d.data.name);
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
    
    // Funzione per mostrare i dettagli del nodo cliccato
    // tree.js
    
    /*function findGeneInfo(data, geneName) {
        for (const category in data.GeneOntology) {
            for (const subcategory in data.GeneOntology[category]) {
                const genes = data.GeneOntology[category][subcategory];
                const gene = genes.find(g => g.nome === geneName);
                if (gene) {
                    return gene;
                }
            }
        }
        return null;
    }*/
    
    // Associa l'evento click ai nodi dell'albero per mostrare i dettagli
    d3.selectAll(".node").on("click", function(event, d) {
        // Resetta l'evidenziazione
        resetHighlight();

        // Evidenzia il nodo cliccato
        highlightPath(d);
        //console.log(d);
        selectedNode = d; // Salva il nodo selezionato

        // Mostra le informazioni del nodo cliccato
        showNodeInfo(d);
    });
}

// Caricamento file
d3.json("data_set_tree.json").then(data => {
    initializeTreeChart(data);
}).catch(error => {
    console.error("Errore nel caricamento del file JSON:", error);
});
