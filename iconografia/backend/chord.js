let selectedArcIndex = null; 
let selectedArcIndexClicked = null;

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
function sfumaturaARC(geneIndex) {
    if(final==true){
        if (selectedArcIndex === geneIndex) {
        selectedArcIndex = null;
        svg.selectAll("path.chord")
            .transition()
            .style("stroke-opacity", 0.8)
            .style("fill-opacity", 0.8);
            //startInfiniteCycle(index1);
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

function initializeChordChart(NameGene, matrix) {
    let isCycleStarted = false; // Variabile per verificare se il ciclo è stato avviato
    let cycleSpeed = 6000; // Velocità di default in millisecondi
    const speedSelect = document.getElementById('speedSelect');

    let progressBar = d3.select("#progressBar");
    let progressBarContainer = d3.select("#progressBarContainer");

    // Funzione per aggiornare la barra di progresso
    function updateProgressBar(counter, dim) {
        const maxProgress = dim * 2; // Il massimo valore è dim * 2
        progressBar.attr("max", maxProgress).attr("value", counter);
    }

    // Mostra o nascondi la barra
    function toggleProgressBar(show) {
        progressBarContainer.style("display", show ? "block" : "none");
    }


    // Listener per cambiare la velocità dal menù a tendina
    speedSelect.addEventListener('change', function () {
        const speedMultiplier = parseFloat(speedSelect.value);
        cycleSpeed = 6000 / speedMultiplier; // Calcola il nuovo intervallo
        console.log(`Velocità aggiornata: ${speedMultiplier}x (Durata: ${cycleSpeed} ms)`);

        // Aggiungi qui il codice per aggiornare i cicli attivi
        if (autoAdvance) {
            clearInterval(autoAdvance);
            autoAdvance = null;
            startAutoAdvance();
            console.log("Aggiornamento velocità ciclo 1");
        }
        if (cycleInterval) {
            clearInterval(cycleInterval);
            cycleInterval = null;
            startInfiniteCycle(index1);
            console.log("Aggiornamento velocità ciclo 2");
        }
    });

    const dim=NameGene.length;
    const rainbowScale = d3.scaleSequential(d3.interpolateRainbow)
        .domain([0, dim - 1]); 
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
        .attr("class", "arc1")
        .style("stroke", function(d) { return fill(d.index); })
        .style("fill", function(d) { return fill(d.index); })
        .attr("d", arc)
        .style("opacity", 0)
        .transition().duration(1000)
        .style("opacity", 0.4);
    
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
        .text("Premi PLAY per viasualizzare lo story telling")
        .call(wrap, 350);
    
    /*Starting text middle bottom*/
   var middleTextBottom = textCenter.append("text")
        .attr("class", "explanation")
        .attr("text-anchor", "middle")
        .attr("x", 0 + "px")
        .attr("y", 24*3/2 + "px")
        .attr("dy", "1em")
        .attr('opacity', 1)
        .text("premi SALTA INTRO per saltare la costruzione del grafico e interagire subito con esso")
        .call(wrap, 350);

    /* Storyboarding Steps */

    // Reset button
    d3.select("#reset")
        .on("click", reset);

    function reset() {
        stopInfiniteCycle();
        location.reload();
        selectedArcIndexClicked=null;
    }

    // Skip button
    d3.select("#skip")
        .on("click", finalChord);

    let isPlaying = false;
    let counter = 0;
    let isCycling = true;
    let autoAdvance; // Variabile per gestire il setInterval
    const button= d3.select("#playPause")
   let gia=false;
    /*d3.select("#playPause").on("click", () => {
        if (!final) {
            // Ciclo automatico
            isPlaying = !isPlaying;
           // isCycleStarted = isPlaying; // Avvia o ferma il ciclo
            if (isPlaying) {
                // Avvia il ciclo automatico
                startAutoAdvance();
                button.text("PAUSE");
                console.log("Ripresa ciclo automatico");
            } else {
                // Ferma il ciclo automatico
                clearInterval(autoAdvance);
                autoAdvance = null;
                button.text("PLAY");
                console.log("Pausa ciclo automatico");
            }
        } else {
            // Ciclo infinito
            isCycling = !isCycling;
            isCycleStarted = isCycling; // Imposta isCycleStarted a true
    
            if (isCycling) {
                // Avvia il ciclo infinito
                startInfiniteCycle(index1);
                button.text("PAUSE");
                console.log("Ripresa ciclo infinito");
            } else {
                // Ferma il ciclo infinito
                clearInterval(cycleInterval);
                cycleInterval = null;
                button.text("PLAY");
                console.log("Pausa ciclo infinito");
            }
        }
    });*/
    d3.select("#playPause").on("click", (gia) => {
        if(gia==true)return;
        isPlaying = !isPlaying;
        playPausePressed = true; // Imposta a true quando Play/Pausa viene premuto
        //updateInfoVisibility();
        if (isPlaying) {
            // Riprende il ciclo automatico o infinito
            if (!final) {
                startAutoAdvance()// Ciclo automatico
            } else {
                startInfiniteCycle(index1); // Ciclo infinito
            }
            button.text("PAUSE").html("&#x23F8;"); // Icona di pausa
            console.log("Ripresa ciclo");
        } else {
            // Ferma il ciclo
            interruptCycle();
            button.text("PLAY").html("&#x25B6;"); // Icona di play
            console.log("Ciclo interrotto");
            if(counttrigger!=0) counttrigger=0;
        }
    });
    // Funzione per avviare l'avanzamento automatico
    function startAutoAdvance() {
        toggleProgressBar(true);
        changeTopText("", 0, 0, 1);
        changeBottomText("", 0, 0, 1);
        if (autoAdvance) return;
        isCycleStarted = true; // Imposta il ciclo come avviato
        autoAdvance = setInterval(() => {
            const previousCounter = counter;
            if (counter <=dim-1) {
                drawStep(counter);
                console.log("counter:",counter);
            }
            else if (counter >= dim-1 && counter <= dim*2-1) {
                showChord(counter - (dim));
                console.log("counter:",counter);
            }
            if (counter === dim*2) {
                finalChord();
                clearInterval(autoAdvance);
                autoAdvance = null;
                console.log("counter:",counter);
            }
            counter++;

            if (counter > previousCounter + 1) {
                counter = previousCounter + 1;
            }
            updateProgressBar(counter, dim); 
        }, cycleSpeed);
    }
    function showChord(sourceIndex, manual = false) {
        d3.selectAll("path.chord")
            .transition().duration(manual ? 200 : 1500) // Usa il valore di `manual` per la durata
            .attr("opacity", function(d) {
                return d.source.index === sourceIndex ? 1 : 0;
            });
        const geneName = NameGene[sourceIndex];
        console.log("Mostrando chord per indice:", sourceIndex);
        highlightPathbyName(geneName);
        showNodeInfo({ data: { name: geneName } });
    }
    function hidechord(sourceIndex) {
        d3.selectAll("path.chord")
            .transition().duration(100) // Usa il valore di `manual` per la durata
            .attr("opacity", function(d) {
                return d.source.index === (sourceIndex+1) ? 0 : 0;
            });
        const geneName = NameGene[sourceIndex];
        console.log("Mostrando chord per indice:", sourceIndex);
        showNodeInfo({ data: { name: geneName } });
        highlightPathbyName(geneName);
    }
    d3.select("#advance").on("click", function () {
        if (!isCycleStarted) return;
        //interruptCycle(); // Interrompe cicli o azioni automatiche
        //const previousCounter = counter;
        if (!final) {
            if (counter <= dim - 1) {
                drawStep(counter, true);
                updateCounter(1); // Incrementa il counter
            } else if (counter > dim - 1 && counter <= dim * 2 - 1) {
                showChord(counter - dim, true);
                updateCounter(1); // Incrementa il counter
            } else if (counter == dim * 2) {
                finalChord();
            }
            updateProgressBar(counter, dim);
        } else {
            console.log("indice avanti",index1)
            //nowait = true;
            //interruptCycle();
            //startInfiniteCycle(index1);
            clearInterval(cycleInterval);
            stopInfiniteCycle();
            cycleInterval=null;
            showGeneInfoIndex(index1);
            sfumaturaARC(index1);
            startInfiniteCycle(index1);
            console.log("skip avanti")
            
            index1++;
            if(index1>dim-1||index1<0)index1=0;
        }
        /*if (counter > previousCounter + 1) {
            counter = previousCounter + 1;
        }*/
        if (autoAdvance === null) {
            startAutoAdvance(); // Riavvia il ciclo automatico se fermo
        }
    });
    
    /*d3.select("#back").on("click", function () {
        if (!isCycleStarted || counter <= 0) return;  
        //interruptCycle(); // Interrompe cicli o azioni automatiche
        //const previousCounter = counter;
        updateCounter(-1); // Decrementa il counter
        if (!final) {
            if (counter < dim) {
                removebackelement(counter);// Rimuove arco e testo
                //createArc(index);
                const geneName = NameGene[counter-1];  
                showNodeInfo({ data: { name: geneName } })
                if(counter== dim-1){
                    removebackelement(counter+1);
                    console.log("entrato in dim-1")
                }
                highlightPathbyName(geneName)
            } else if (counter >= dim - 1) {
                showChord(counter - dim, true); // Mostra il chord precedente
            }
        } 
        else {
            console.log("indietro");
            index1 = (index1 - 1 + dim) % dim; // Gestione ciclica dell'indice
            nowait = true;
            startInfiniteCycle(index1);
        }
        /*if (counter < previousCounter - 1) {
            counter = previousCounter - 1;
        }
    });*/
    d3.select("#back").on("click", function () {
       
        if (!isCycleStarted || (cycleInterval && index1<1) || counter <= 0) return;  
        interruptCycle(); 
        console.log("indietro")
        if (final) {
            //index1 = (index1 - 1 + dim) % dim; // Muoviti ciclicamente indietro
            index1=index1-2;//è in quello di ora +1
            if(index1==(-1)){
                index1=dim-1;
                console.log("ora ci si sposta a l'ultimo")
            }
            clearInterval(cycleInterval);
            stopInfiniteCycle();
            cycleInterval=null;
            showGeneInfoIndex(index1);
            sfumaturaARC(index1);
            startInfiniteCycle(index1);
            console.log("skip indietro")
            index1++;
    
        } else {
            updateCounter(-1); // Decrementa il contatore
            if(counter<=0){
                    removebackelement(0)

            }
            else if (counter < dim) {
                removebackelement(counter);
                const geneName = NameGene[counter - 1];  
                highlightPathbyName(geneName);
                showNodeInfo({ data: { name: geneName } });
                console.log("indice", counter -1)

            } else if (counter >= dim) {
                hidechord(counter - dim); // Nasconde l'attuale
                showChord(counter - dim - 1, true); // Mostra il precedente
                console.log("indice >dim", counter)
            }

            updateProgressBar(counter, dim);
        }
    });
    function removebackelement(index) {
        if (index < dim-1) {
            // Rimuovi arco e testo per l'elemento corrente
            console.log("Rimuovo arco e testo per indice:", index);
            g.filter(d => d.index === index).select("path.arc")
                .style("opacity", 0);  // Nasconde l'arco
            g.filter(d => d.index === index).select("text.titles").remove();  // Rimuove il testo
    
    
        } else if(index==dim){
            g.filter(d => d.index === index).select("text.titles").remove();  // Rimuove il testo
        }else{
            // Se index è maggiore o uguale a dim, gestisci i "chord"
            // Nascondi tutti i "chord" e mostra solo quelli relativi al nodo precedente
            d3.selectAll("path.chord").attr("opacity", 0);
            const sourceIndex = index - dim -1;
            d3.selectAll("path.chord")
                .filter(d => d.source.index === sourceIndex)
                .attr("opacity", 1);  // Mostra il chord per il nodo precedente
            console.log("Chord aggiornati per indice:", sourceIndex);
        }
    }
    
    function updateCounter(value) {
        counter = Math.max(0, Math.min(counter + value, dim * 2 )); // Mantieni counter tra 0 e dim*2-1
        console.log("Counter aggiornato:", counter);
    }
    
    function drawStep(index) {
        createArc(index);
        const geneName = NameGene[index];  
        showNodeInfo({ data: { name: geneName } })
        highlightPathbyName(geneName)
    }
    function createArc(index, manual = false) {
        const providerName = NameGene[index];
        console.log("nome :",providerName)
        g.filter(d => d.index === index)
            .append("path")
            .attr("class", "arc")
            .style("stroke", d => fill(d.index))
            .style("fill", d => fill(d.index))
            .attr("d", arc)
            .style("opacity", 0)
            .transition().duration(manual ? 100 : 200) 
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
                    .transition().duration(manual ? 50 : 1000)
                    .attr("opacity", 1)
                    .text(providerName);
            });
    }
    function finalChord() {
        if(final) return;  // Se final è già true, esci dalla funzione
        toggleProgressBar(false);
        //button.text("PLAY").html("&#x25B6;"); // Icona di play
        //button.text("PAUSE").html("&#x23F8;"); // Icona di pausa
        //changeTopText("Per cambiare il flusso premi gli archi esterni del grafico o le foglie dell'albero a destra ", 0, 0, 1);
        changeBottomText("", 0, 0, 1);
        changeTopText("", 0, 0, 1);
        final= true; 
        //d3.select("#skip").style("visibility", "hidden");
        console.log("al final chord il counter vale : ",counter)
        
        if(counter<dim){
            while(counter<dim){
                createArc(counter);
                counter++;
            }
        }

        d3.selectAll("path.arc")
            .on("mouseover", fade(.02))
            .on("mouseout", fade(.80))
            .on("click", function(event, d) {
                showGeneInfo(d);
                // Esegui l'effetto di sfumatura sull'arco
                const geneIndex = d.index;
                selectedArcIndexClicked=geneIndex;
                sfumaturaARC(geneIndex);
                triggerPause();
            });

        chords_inside.transition().duration(900)
            .style("opacity", 0.6);

        if(counter>0){}
        if(counter<= dim-1){
            svg.selectAll("g.group")
            .transition().duration(50)
            .selectAll(".titles").style("opacity", 0)
            .selectAll(".titles").style("opacity", 1);
        }
        //counter=dim*2+dim; // blocca avanzamento autoplay = dim +1 generalizzato 
        counter=dim;
        /*if (isCycling) {
            button.text("PAUSE");
            startInfiniteCycle(0);
            console.log("Ripresa ciclo infinito");
        }*/
        startInfiniteCycle(0);
    }
    let cycleInterval = null; // Variabile per l'intervallo del ciclo infinito
    //let nowait = false; // Variabile per controllare l'attesa del ciclo infinito
    let index1=0;

    function startInfiniteCycle(index) {
        changeTopText("", 0, 0, 1);
        if (cycleInterval) return; // Evita duplicati
        isCycleStarted = true;
        index1 = index;
        let previousIndex1 = index1;
        cycleInterval = setInterval(() => {
            if (index1 === dim) {
                index1 = 0;
            }
            if (index1 < dim) {
                if (selectedArcIndexClicked != index1 && selectedArcIndexClicked != null) {
                    console.log("index:", index1);
                    console.log("selectedrcIndex:", selectedArcIndexClicked);
                    showGeneInfoIndex(selectedArcIndexClicked);
                    sfumaturaARC(selectedArcIndexClicked);
                    index1 = selectedArcIndexClicked;
                    console.log("nuovo indice: ", index1)
                    console.log("nuovo selected: ", selectedArcIndexClicked)
                    selectedArcIndexClicked = null;
                }
                showGeneInfoIndex(index1);
                sfumaturaARC(index1);
            }
            index1++;
            console.log("indice finale",index1)
            // Impedisce salti ma rompe il fatto di cliccare in giro come faccio a mantenere quello e anche il tasto avanti e indietro? 
            /*if (index1 > previousIndex1 + 1) {
                index1 = previousIndex1 + 1;
            }*/
            previousIndex1 = index1;
        }, cycleSpeed); // Durata del ciclo o istantaneo
        //nowait = false; // Intervallo di 6 secondi, o istantaneo se nowait è true
    }
    
    
    // Funzione per interrompere il ciclo
    function stopInfiniteCycle() {
        if (cycleInterval) {
            clearInterval(cycleInterval);
            cycleInterval = null;
            console.log("stoppato ciclo infinito")
        }
    }
    function interruptCycle() {
        if (autoAdvance) {
            clearInterval(autoAdvance); // Interrompe il ciclo automatico
            autoAdvance = null;
            console.log("Ciclo automatico interrotto");
        }
    
        if (cycleInterval) {
            clearInterval(cycleInterval); // Interrompe il ciclo infinito
            cycleInterval = null;
            console.log("Ciclo infinito interrotto");
        }
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
    function showGeneInfoIndex(geneIndex) { 
        if (geneIndex >= 0 && geneIndex < NameGene.length) {
            const geneName = NameGene[geneIndex]; 
            showNodeInfo({ data: { name: geneName } });
            highlightPathbyName(geneName);  
        } else {
            console.error("Indice non valido:", geneIndex);
            const infoContainer = document.getElementById("extra-info");
            infoContainer.innerHTML = "<p>Informazioni non disponibili per il gene.</p>";
        }
    }

    /*EXTRA FUNCTIONS */
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
    };

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
    ;}


    //let currentNode = null; // Nodo corrente per il ciclo infinito
    

    // Funzione per ottenere il prossimo nodo
    /*function getNextNode(node) {
        if (node.children && node.children.length > 0) {
            return node.children[0]; // Passa al primo figlio
        } else if (node.parent) {
            return node.parent; // Torna al genitore se è una foglia
        } else {
            return null; // Fine ciclo
        }
    }*/

    // Funzione aggiornata evidenziaArc per modificare il nodo corrente
    /*function evidenziaArc(geneName) {
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
    }*/

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

