function evidenziaArc(geneName) {
    if(final==true){
        const geneIndex = NameGene.indexOf(geneName);
        if (geneIndex === -1) {
            console.error(`Gene ${geneName} non trovato in NameGene.`);
            return;
        }
        sfumaturaARC(geneIndex);
        console.log("cambia index cliccato", geneIndex);

        selectedArcIndexClicked=geneIndex
        console.log("selectIndex: ", selectedArcIndexClicked)
    }
}

let selectedArcIndex = null; 
let selectedArcIndexClicked = null;
function sfumaturaARC(geneIndex) {
    if(final==true){
        if (selectedArcIndex === geneIndex) {
        selectedArcIndex = null;
        svg.selectAll("path.chord")
            .transition()
            .style("stroke-opacity", 0.8)
            .style("fill-opacity", 0.8);
        } else {
        console.log(`Seleziono arco con indice ${geneIndex}`);
        selectedArcIndex = geneIndex;
        svg.selectAll("path.chord")
            .transition()
            .style("stroke-opacity", function (d) {
                return d.source.index === geneIndex || d.target.index === geneIndex ? 0.8 : 0.02;
            })
            .style("fill-opacity", function (d) {
                return d.source.index === geneIndex || d.target.index === geneIndex ? 0.8 : 0.02;
            });
        }
    }
}
// Gestori per mouseover e mouseout
function fade(opacity) {
    return function (event, d) {
        if (selectedArcIndex === null) { // Mouseover solo se nessun arco è selezionato
            svg.selectAll("path.chord")
                .filter(function (chord) {
                    return chord.source.index !== d.index && chord.target.index !== d.index;
                })
                .transition()
                .style("stroke-opacity", opacity)
                .style("fill-opacity", opacity);
        }
    };
}

function initializeChordChart(NameGene,matrix) {
    const dim=NameGene.length;
    // Crea una scala sequenziale che vada dal rosso al viola (arcobaleno)
    const rainbowScale = d3.scaleSequential(d3.interpolateRainbow)
    .domain([0, dim - 1]); // Mappa i valori da 0 a dim-1

    // Crea una scala ordinal con la sequenza di colori dall'arcobaleno
    const fill = d3.scaleOrdinal()
    .domain(d3.range(dim))  // Associa un colore a ciascun arco
    .range(d3.range(dim).map(i => rainbowScale(i)));
    const margin = { top: 40, right: 15, bottom: 10, left: 15 };
    const width = 450 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
    const innerRadius = Math.min(width, height) * 0.39;
    const outerRadius = innerRadius * 1.10;

    // SVG e posizione
    svg = d3.select("#chord")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

    // Generatore di corde
    const chordGenerator = d3.chord()
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    const chords = chordGenerator(matrix); // Matrice

    console.log("Chord groups after matrix:", chords.groups);
    console.log("Chord chords after matrix:", chords);
    console.log("lunghezza della matrice ",matrix.length);
    //console.log("lunghezza della matrice ",matrix.lineNumber);
    console.log("lunghezza del vettore nomi",NameGene.length);

    // Arco esterno
    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    const chordPath = d3.ribbon()
        .radius(innerRadius);

    const g = svg.selectAll("g.group")
        .data(chords.groups)
        .enter().append("svg:g")
        .attr("class", function(d) {return "group " + NameGene[d.index];});
        
    g.append("svg:path")
        .attr("class", "arc")
        .style("stroke", function(d) { return fill(d.index); })
        .style("fill", function(d) { return fill(d.index); })
        .attr("d", arc)
        .style("opacity", 0)
        .transition().duration(1000)
        .style("opacity", 0.4);
    
    /*g.append("svg:text")
        .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("class", "titles")
        //.style("size-font", "12x")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (outerRadius + 10) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .attr('opacity', 0)
        .text(function(d,i) { return NameGene[i]; });  */
    
    /* Initiate inner chords */

    const chords_inside = svg.selectAll("path.chord")
        .data(chords) // Usa direttamente i dati dei chords
        .enter().append("path")
        .attr("class", "chord")
        .style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(); })
        .style("fill", function(d) { return fill(d.source.index); })
        .attr("d", chordPath) // Usa il generatore `d3.ribbon()` per generare la geometria del path
        .attr('opacity', 0);

    const textCenter = svg.append("g")
        .attr("class", "explanationWrapper");
    
    /*Starting text middle top*/
    var middleTextTop = textCenter.append("text")
        .attr("class", "explanation")
        .attr("text-anchor", "middle")
        .attr("x", 0 + "px")
        .attr("y", -24*10/2 + "px")
        .attr("dy", "1em")
        .attr("opacity", 1)
        .text("Premi play per viasualizzare lo story telling o premi skip per saltare la costruzione del grafico e interagire con esso")
        .call(wrap, 350);
    
    /*Starting text middle bottom*/
   var middleTextBottom = textCenter.append("text")
        .attr("class", "explanation")
        .attr("text-anchor", "middle")
        .attr("x", 0 + "px")
        .attr("y", 24*3/2 + "px")
        .attr("dy", "1em")
        .attr('opacity', 1)
        .text("carica testo 2")
        .call(wrap, 350);

    /* Storyboarding Steps */

    // Reset button
    d3.select("#reset")
        .on("click", reset);

    function reset() {
        stopInfiniteCycle();
        location.reload();
        selectedArcIndexClicked=null;
        //d3.select("#clicker").style("display", "block");
    }

    // Skip button
    d3.select("#skip")
        .on("click", finalChord);

    let isPlaying = true;
    let counter = 0;
    let autoAdvance; // Variabile per gestire il setInterval

    // Clicker button
    d3.select("#clicker").on("click", () => {
        // Mostra gli archi per un breve periodo
        d3.selectAll(".arc")
            .transition().delay(9 * 200).duration(100)
            .style("opacity", 0)
            .on("end", function () {
                d3.select(this).remove();
                if (d3.selectAll(".arc").empty()) {
                    //changeTopText("", 3 / 2, 0, 1);
                    //changeBottomText("", 2 / 2, 0, 1);
                    startAutoAdvance(); // Avvia la sequenza automatica
                }
            });
        //startAutoAdvance(); // Avvia la sequenza automatica
    });

    // Funzione per avviare l'avanzamento automatico
    function startAutoAdvance() {
        autoAdvance = setInterval(() => {
            /*if (counter === 1) {
                d3.select("#back").style("display", "block"); // Mostra "BACK" dopo il primo avanzamento
            }*/
            changeTopText("", 0, 0, 1);
            changeBottomText("", 0, 0, 1);

            if (counter <=dim-1) {
                drawStep(counter);
                console.log("creazione archi:",counter);
            }
            //mettere che prende la lunghezza del vettore di nomi e scorrre fino alla metà 
            else if (counter >= dim-1 && counter <= dim*2-1) showChord(counter - (dim));
            if (counter === dim*2-1) {
                finalChord();
                clearInterval(autoAdvance);
            }
            // se clicco advance va avanti due volte?? 
            counter++;
        }, 6000);
    }
    function showChord(sourceIndex) {
        //if(counter==8){// Rimuove i testi
            //changeTopText("", 0, 0, 1);
            //changeBottomText("", 0, 0, 1);
        d3.selectAll("path.chord")
            //.data(chords)   //Associa i dati di `chords` alla selezione
            .transition().duration(1500)
            .attr("opacity", function(d) {
                if (d.source.index === sourceIndex) {
                    return 1;
                }
                return 0;
            })
        const geneName = NameGene[sourceIndex];  // Ottieni il nome del gene
        // Passa il nome del gene alla funzione showNodeInfo
        showNodeInfo({ data: { name: geneName } })
        //connessione al grafico ad albero 
        //si potrebbero fare un file diviso con solo le connessioni? per buona pratica? 
        highlightPathbyName(geneName)
    };

    // Funzione per mettere in pausa e riprendere
    d3.select("#playPause").on("click", () => {
        //if (isCycling) return; // se è attivo il ciclo infinito riprende quando faccio play 
        isPlaying = !isPlaying;
        const button = d3.select("#playPause");
    
        if (isPlaying) {
            startAutoAdvance(); // Riprendi l'avanzamento automatico
            button.text("PAUSE");
        } else {
            clearInterval(autoAdvance); // Ferma l'avanzamento automatico
            button.text("PLAY");
        }
    });
    /*
    d3.select("#playPause").on("click", () => {
    isPlaying = !isPlaying;
    const button = d3.select("#playPause");

    if (isPlaying) {
        startInfiniteCycle(currentNode || 0); // Riprendi dal nodo corrente o 0
        button.text("PAUSE");
    } else {
        clearInterval(cycleInterval); // Ferma il ciclo infinito
        button.text("PLAY");
    }
});
*/
    
    // Advance button
    /*d3.select("#advance").on("click", function () {
        if (counter <=dim-1) {
            drawStep(counter);
            counter++;
        } 
        else if (counter == dim*2-1){
            finalChord();
        }
        else if (counter >= dim-1 && counter <= (dim-1)*2) {
            showChord(counter - dim-1);
            counter++;
        }
        if(counter==dim-1){// Rimuove i testi
            changeTopText("", 0, 0, 1);
            changeBottomText("", 0, 0, 1);
    } // Incrementa il contatore per andare al passaggio successivo
    });*/
    function drawStep(index) {
        createArc(index);
        //changeTopText(``, 3 / 2, 0, 1);
        //changeBottomText("", 2 / 2, 0, 1);
        const geneName = NameGene[index];  // Ottieni il nome del gene
        // Passa il nome del gene alla funzione showNodeInfo
        showNodeInfo({ data: { name: geneName } })
        highlightPathbyName(geneName)
    }
    function createArc(index) {
        const providerName = NameGene[index];
        console.log("nome :",providerName)
        g.filter(d => d.index === index)
            .append("path")
            .attr("class", "arc")
            .style("stroke", d => fill(d.index))
            .style("fill", d => fill(d.index))
            .attr("d", arc)
            .style("opacity", 0)
            .transition().duration(1000)
            .style("opacity", 1)
            .on("end", () => {
                g.filter(d => d.index === index)
                    .append("text")
                    .each(d => d.angle = (d.startAngle + d.endAngle) / 2)
                    .attr("dy", ".35em")
                    .attr("class", "titles")
                    .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
                    .attr("transform", d => `rotate(${d.angle * 180 / Math.PI - 90})translate(${innerRadius + 20})${d.angle > Math.PI ? "rotate(180)" : ""}`)
                    .attr("opacity", 0)
                    .transition().duration(50)
                    .attr("opacity", 1)
                    .text(providerName);
            });
    }
    function finalChord() {
        final= true; 
        d3.select("#skip").style("visibility", "hidden");
        console.log("al final chord il counter vale : ",counter)
       //counter=0;
       //svg.selectAll(".arc").remove();
       changeTopText(" ", 0, 0, 1);
       changeBottomText("", 0, 0, 1);
       if(counter<dim){
        while(counter<=dim){
            createArc(counter);
            counter++;
        }
       }
        /*d3.selectAll(".arc")
            .transition().delay(9 * 500).duration(100)
            .style("opacity", 0)
        svg.selectAll("g.group").select("path")
            .transition().duration(1000)
            .style("opacity", 1);*/

        // Rende visibili le interazioni mouseover e mouseout
        d3.selectAll("path.arc")
            .on("mouseover", fade(.02))
            .on("mouseout", fade(.80))
            .on("click", function(event, d) {
                showGeneInfo(d);
                // Esegui l'effetto di sfumatura sull'arco
                const geneIndex = d.index;
                selectedArcIndexClicked=geneIndex;
                sfumaturaARC(geneIndex);
        });

        // Mostra tutte le chords
        // Assicurati che le "chords" siano selezionate correttamente
        chords_inside.transition().duration(100)
            .style("opacity", 0.6);


        // Mostra i testi e le linee degli archi
        /*d3.selectAll("g.group").selectAll("line")
            .transition().duration(100)
            .style("stroke", "#000");*/
        if(counter>0){}
        if(counter<= dim-1){
            svg.selectAll("g.group")
            .transition().duration(70)
            .selectAll(".titles").style("opacity", 0)
            .selectAll(".titles").style("opacity", 1);
        }
        //counter=dim*2+dim; // blocca avanzamento autoplay = dim +1 generalizzato 
        counter=dim;
        startInfiniteCycle(0);
    }


    /*Returns an event handler for fading a given chord group*/


    function endall(transition, callback) {
        let n = 0;
        transition
            .on("start", function () { ++n; }) // Incrementa il conteggio all'inizio di ogni transizione
            .on("end", function () { if (!--n) callback.apply(this, arguments); }); // Decrementa alla fine e chiama il callback se tutte sono terminate
    }

    /* Gestione del wrapping del testo */
    function wrap(text, width) {
        text.each(function () {
            const textElement = d3.select(this);
            const words = textElement.text().split(/\s+/).reverse();
            let word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4,
                y = textElement.attr("y"),
                x = textElement.attr("x"),
                dy = parseFloat(textElement.attr("dy")) || 0,
                tspan = textElement.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", `${dy}em`);

            while ((word = words.pop())) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = textElement.append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", `${++lineNumber * lineHeight + dy}em`)
                        .text(word);
                }
            }
        });
    }
    function showGeneInfo(d) {
        console.log("Dati dell'oggetto d:", d.index);  // Debug per verificare cosa contiene `d`
        
        const geneIndex = d.index;
        if (geneIndex >= 0 && geneIndex < NameGene.length) {
            const geneName = NameGene[geneIndex];  // Ottieni il nome del gene
            // Passa il nome del gene alla funzione showNodeInfo
            showNodeInfo({ data: { name: geneName } });
            highlightPathbyName(geneName);  // Evidenzia il percorso del gene
        } else {
            console.error("Indice non valido:", geneIndex);
            // Aggiungi un messaggio di errore
            const infoContainer = document.getElementById("extra-info");
            infoContainer.innerHTML = "<p>Informazioni non disponibili per il gene.</p>";
        }
    }
    function showGeneInfoIndex(geneIndex) { // Debug per verificare cosa contiene `d`
        //const name = geneName[geneIndex];
        if (geneIndex >= 0 && geneIndex < NameGene.length) {
            const geneName = NameGene[geneIndex];  // Ottieni il nome del gene
            // Passa il nome del gene alla funzione showNodeInfo
            showNodeInfo({ data: { name: geneName } });
            //highlightPathbyName(geneName);  // Evidenzia il percorso del gene
        } else {
            console.error("Indice non valido:", geneIndex);
            // Aggiungi un messaggio di errore
            const infoContainer = document.getElementById("extra-info");
            infoContainer.innerHTML = "<p>Informazioni non disponibili per il gene.</p>";
        }
    }
    /*Transition the top circle text*/
    function changeTopText (newText, loc, delayDisappear, delayAppear, finalText, xloc, w) {

        /*If finalText is not provided, it is not the last text of the Draw step*/
        if(typeof(finalText)==='undefined') finalText = false;
        
        if(typeof(xloc)==='undefined') xloc = 0;
        if(typeof(w)==='undefined') w = 350;
        
        middleTextTop	
            /*Current text disappear*/
            .transition().delay(700 * delayDisappear).duration(700)
            .attr('opacity', 0)	
            /*New text appear*/
            .call(endall,  function() {
                middleTextTop.text(newText)
                .attr("y", -24*loc + "px")
                .attr("x", xloc + "px")
                .call(wrap, w);	
            })
            .transition().delay(700 * delayAppear).duration(700)
            .attr('opacity', 1)
            .call(endall,  function() {
                if (finalText == true) {
                    d3.select("#clicker")
                        .text(buttonTexts[counter-2])
                        .style("pointer-events", "auto")
                        .transition().duration(400)
                        .style("border-color", "#363636")
                        .style("color", "#363636");
                    };
            });
    };/*changeTopText */

    /*Transition the bottom circle text*/
    function changeBottomText (newText, loc, delayDisappear, delayAppear) {
        middleTextBottom
            /*Current text disappear*/
            .transition().delay(700 * delayDisappear).duration(700)
            .attr('opacity', 0)
            /*New text appear*/
            .call(endall,  function() {
                middleTextBottom.text(newText)
                .attr("y", 24*loc + "px")
                .call(wrap, 350);	
            })
            .transition().delay(700 * delayAppear).duration(700)
            .attr('opacity', 1);
    ;}/*changeTopText*/

    /*Stop clicker from working*/
    /*function stopClicker() {
        d3.select("#clicker")
            .style("pointer-events", "none")
            .transition().duration(400)
            .style("border-color", "#D3D3D3")
            .style("color", "#D3D3D3");
    };/*stopClicker*/
    /*let autoCycle; // Variabile per il ciclo infinito
    let isCycling = false; // Flag per controllare il ciclo infinito

    // Funzione per avviare il ciclo infinito
    function startInfiniteCycle() {
        isCycling = true;
        d3.select("#stop").style("display", "block"); // Mostra il bottone STOP
        d3.select("#playPause").style("display", "none"); // Nascondi il pulsante play/pause

        let geneIndex = 0; // Inizializza al primo gene

        autoCycle = setInterval(() => {
            // Evidenzia il gene corrente e i suoi chord
            const geneName = NameGene[geneIndex];
            evidenziaArc(geneName); // Funzione per evidenziare

            // Incrementa o ricomincia il ciclo
            geneIndex = (geneIndex + 1) % NameGene.length; // Ricomincia da zero quando arriva alla fine
            showGeneInfoIndex(geneIndex);
            
        }, 4000); // Cambia gene ogni 4 secondi
    }

    // Funzione per fermare il ciclo infinito
    function stopInfiniteCycle() {
        isCycling = false;
        clearInterval(autoCycle); // Ferma il ciclo
        d3.select("#stop").style("display", "none"); // Nascondi il bottone STOP
        d3.select("#playPause").style("display", "block"); // Mostra di nuovo il pulsante play/pause
    }

    // Event Listener per il bottone STOP
    d3.select("#stop").on("click", stopInfiniteCycle);

    // Modifica il bottone "Clicker" per avviare il ciclo infinito
    d3.select("#clicker").on("click", () => {
        d3.select("#clicker").style("display", "none"); // Nascondi il pulsante
        startInfiniteCycle(); // Avvia il ciclo infinito
    });*/

    let currentNode = null; // Nodo corrente per il ciclo infinito
    let cycleInterval = null; // Variabile per l'intervallo del ciclo infinito

    // Funzione per avviare il ciclo infinito
    /*function startInfiniteCycle(initialNode) {
        if (cycleInterval) {
            clearInterval(cycleInterval); // Ferma il ciclo precedente
        }

        currentNode = initialNode || currentNode; // Imposta il nodo iniziale
        if (!currentNode) {
            //currentNode=0;
            console.error("Nessun nodo selezionato per avviare il ciclo infinito.");
            return;
        }

        cycleInterval = setInterval(() => {
            if (!currentNode) {
                clearInterval(cycleInterval);
                console.error("Ciclo interrotto: nodo corrente non valido.");
                return;
            }

            // Resetta l'evidenziazione prima di procedere
            resetHighlight();

            // Evidenzia il nodo corrente
            d3.select(currentNode.node)
                .select("circle")
                .attr("fill", "red");

            d3.select(currentNode.node)
                .select("text")
                .attr("fill", "red")
                .style("font-size", "14px");

            d3.selectAll(".link")
                .filter(link => link.target === currentNode)
                .attr("stroke", "red");

            // Passa al nodo successivo (o torna alla radice se alla fine)
            currentNode = getNextNode(currentNode);

        }, 1000); // Intervallo di 1 secondo
    }*/
        function startInfiniteCycle(index) {
            if (autoAdvance) {
                clearInterval(autoAdvance); // Ferma eventuali cicli attivi
            }
            let index1 = index;
            cycleInterval = setInterval(() => {
                if (index1 === dim) {
                    index1 = 0;
                }
                if(index1<dim){
                    if(selectedArcIndexClicked!=index1 && selectedArcIndexClicked!=null){
                        console.log("index:",index1)
                        console.log("selectedrcIndex:", selectedArcIndexClicked)
                        showGeneInfoIndex(selectedArcIndexClicked)
                        sfumaturaARC(selectedArcIndexClicked)
                        index1=selectedArcIndexClicked;
                        selectedArcIndexClicked=null
                        if(index1==dim-1){
                            index=0
                        }
                        //settare il bottone di pausa funzinante in automatico e cambiare icona con play se si vuole far ripartire
                    }
                    showGeneInfoIndex(index1)
                    sfumaturaARC(index1)
                }
                // se clicco advance va avanti due volte?? 
                index1++;
            }, 6000);
        }
    /*function startInfiniteCycle(index){
        //if(genecliccato)_>allora cambia index
        //for n va da 0 a dim-1 e ricomincia 
        let index1=index;
        //let count=0;// da cambiare appena parte la prima volta perchè se no se clicco il primo aspetta sempre 
        autoAdvance = setInterval(() => {
            if (index1==dim){
                index1=0
            }
            if(index1<dim){
                if(selectedArcIndexClicked!=index1 && selectedArcIndexClicked!=null){
                    console.log("index:",index1)
                    console.log("selectedrcIndex:", selectedArcIndexClicked)
                    showGeneInfoIndex(selectedArcIndexClicked)
                    sfumaturaARC(selectedArcIndexClicked)
                    index1=selectedArcIndexClicked;
                    selectedArcIndexClicked=null
                    if(index1==dim-1){
                        index=0
                    }
                    //settare il bottone di pausa funzinante in automatico e cambiare icona con play se si vuole far ripartire
                }
                showGeneInfoIndex(index1)
                sfumaturaARC(index1)
            }
            // se clicco advance va avanti due volte?? 
            index1++;
        }, 6000);
        
    }*/
    

    // Funzione per ottenere il prossimo nodo
    function getNextNode(node) {
        if (node.children && node.children.length > 0) {
            return node.children[0]; // Passa al primo figlio
        } else if (node.parent) {
            return node.parent; // Torna al genitore se è una foglia
        } else {
            return null; // Fine ciclo
        }
    }

    // Funzione per interrompere il ciclo
    function stopInfiniteCycle() {
        if (cycleInterval) {
            clearInterval(cycleInterval);
            cycleInterval = null;
        }
    }

    // Funzione aggiornata evidenziaArc per modificare il nodo corrente
    function evidenziaArc(geneName) {
        const targetNode = d3.selectAll(".node")
            .filter(function (d) {
                return d.data.name === geneName;
            })
            .datum();

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

        // Imposta il nodo selezionato come nodo corrente per il ciclo infinito
        currentNode = targetNode;

        // Riavvia il ciclo infinito dal nuovo nodo
        startInfiniteCycle(currentNode);
    }

}
Promise.all([
    d3.json("../file_json/names.1.json"),
    d3.json("../file_json/matrix.1.json")
]).then(([namesData, matrixData]) => {
    NameGene = namesData.NameGene;
    const matrix = matrixData.matrix;
    initializeChordChart(NameGene, matrix);
}).catch(error => {
    console.error("Errore nel caricamento del file JSON:", error);
});

