function initializeChordChart(NameGene,matrix) {
    const pastelColors = [
        "#F8B7D4", "#F1A7D1", "#E68FBC", "#D87FAD", "#D07E8D", "#D45F6C", "#E26262", "#F25F59", 
        "#F56B48", "#FF8B33", "#FFBB00", "#D9E100", "#A1E801", "#4FBF56", "#24C29F", "#1A94B2", "#5182CC"
    ];

    // Crea una scala ordinal con i colori pastello definiti sopra
    const fill = d3.scaleOrdinal()
        .domain(d3.range(17))  // Associa 17 colori agli archi
        .range(pastelColors);
    const margin = { top: 40, right: 15, bottom: 10, left: 15 };
    const width = 500 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const innerRadius = Math.min(width, height) * 0.39;
    const outerRadius = innerRadius * 1.10;

    // SVG e posizione
    const svg = d3.select("#chord")
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
        .style("stroke", function (d) { return fill(d.index); })
        .style("fill", function (d) { return fill(d.index); })
        .attr("d", arc)
        .style("opacity", 0)
        .on("click", showGeneInfo )
        .transition().duration(1000)
        .style("opacity", 0.4);
    
    // Funzione showGeneInfo che riceve l'arco cliccato
    function showGeneInfo(d) {
        console.log("Dati dell'oggetto d:", d.srcElement.__data__.index);  // Debug per verificare cosa contiene `d`
    
        const geneIndex = d.srcElement.__data__.index;
        if (geneIndex >= 0 && geneIndex < NameGene.length) {
            const geneName = NameGene[geneIndex];  // Ottieni il nome del gene
            // Passa il nome del gene alla funzione showNodeInfo
            showNodeInfo({ data: { name: geneName } });
            highlightPathbyName(geneName)
    
        } else {
            console.error("Indice non valido:", geneIndex);
            // Aggiungi un messaggio di errore
            const infoContainer = document.getElementById("extra-info");
            infoContainer.innerHTML = "<p>Informazioni non disponibili per il gene.</p>";
        }
    }
    
    
    
    /* Initiate Names */
    
    g.append("svg:text")
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
        .text(function(d,i) { return NameGene[i]; });  
    
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
        .text("The graph that you are gonna see is about the proteic relationship between different genes")
        .call(wrap, 350);
    
    /*Starting text middle bottom*/
    var middleTextBottom = textCenter.append("text")
        .attr("class", "explanation")
        .attr("text-anchor", "middle")
        .attr("x", 0 + "px")
        .attr("y", 24*3/2 + "px")
        .attr("dy", "1em")
        .attr('opacity', 1)
        .text("Il grafico è di tipo relazionale e all' esterno sono posizinati i geni e le linee interne sono le relazioni che uniscono un gene ad un altro")
        .call(wrap, 350);

    

    /* Storyboarding Steps */

    // Reset button
    d3.select("#reset")
        .on("click", reset);

    function reset() {
        location.reload();
        d3.select("#clicker").style("display", "block");
    }

    // Skip button
    d3.select("#skip")
        .on("click", finalChord);

    let isPlaying = true;
    let counter = 0;
    let autoAdvance; // Variabile per gestire il setInterval

    // Clicker button
    d3.select("#clicker").on("click", () => {
        d3.select("#clicker").style("display", "none");
        d3.select("#playPause").style("display", "block");
        d3.select("#advance").style("display", "block");
        d3.select("#back").style("display", "block");

        // Mostra gli archi per un breve periodo
        d3.selectAll(".arc")
            .transition().delay(9 * 500).duration(200)
            .style("opacity", 0)
            .on("end", function () {
                d3.select(this).remove();
                if (d3.selectAll(".arc").empty()) {
                    changeTopText("", 3 / 2, 0, 1);
                    changeBottomText("", 2 / 2, 0, 1);

                    startAutoAdvance(); // Avvia la sequenza automatica
                }
            });
    });


    // Funzione per avviare l'avanzamento automatico
    function startAutoAdvance() {
        autoAdvance = setInterval(() => {
            /*if (counter === 1) {
                d3.select("#back").style("display", "block"); // Mostra "BACK" dopo il primo avanzamento
            }*/

            if (counter <=16) drawStep(counter);
            //mettere che prende la lunghezza del vettore di nomi e scorrre fino alla metà 
            else if (counter >= 16 && counter <= 32) showChord(counter - 16);
            if (counter === 33) {
                finalChord();
                clearInterval(autoAdvance);
                d3.select("#back").style("visibility", "hidden");
                d3.select("#playPause").style("visibility", "hidden"); 
                d3.select("#advance").style("visibility", "hidden");  // Nasconde "BACK" alla fine della sequenza
            }
            // se clicco advance va avanti due volte?? 
            counter++;
        }, 7000);
    }
    function showChord(sourceIndex) {
        if(counter==8){// Rimuove i testi
            changeTopText("", 0, 0, 1);
            changeBottomText("", 0, 0, 1);
    }
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
        highlightPathbyName(geneName)
    };

    // Funzione per mettere in pausa e riprendere
    d3.select("#playPause").on("click", () => {
        console.log("Bottone cliccato");
        console.log("Stato isPlaying prima del toggle:", isPlaying);
        const button = d3.select("#playPause");
        isPlaying = !isPlaying;
    
        if (isPlaying) {
            console.log("Avvio auto-advance");
            startAutoAdvance();
            button.text("PAUSE");
            button.classed("playing", false);
        } else {
            console.log("Pausa auto-advance");
            clearInterval(autoAdvance);
            button.text("PLAY");
            button.classed("playing", true);
        }
        console.log("Stato isPlaying dopo il toggle:", isPlaying);
    });
    

    // Advance button
    d3.select("#advance").on("click", function () {
        if (counter <=7) {
            drawStep(counter);
        } 
        else if (counter == 33){
            finalChord();
        }
        else if (counter >= 16 && counter <= 32) {
            showChord(counter - 16);
        }
        counter++;
        if(counter==16){// Rimuove i testi
            changeTopText("", 0, 0, 1);
            changeBottomText("", 0, 0, 1);
    } // Incrementa il contatore per andare al passaggio successivo
    });
    function drawStep(index) {
        createArc(index);
        changeTopText(``, 3 / 2, 0, 1);
        changeBottomText("", 2 / 2, 0, 1);
        const geneName = NameGene[index];  // Ottieni il nome del gene
        // Passa il nome del gene alla funzione showNodeInfo
        showNodeInfo({ data: { name: geneName } })
        highlightPathbyName(geneName)
    }
    function createArc(index) {
        const providerName = NameGene[index];
        g.filter(d => d.index === index)
            .append("svg:path")
            .style("stroke", d => fill(d.index))
            .style("fill", d => fill(d.index))
            .attr("d", arc)
            .style("opacity", 0)
            .transition().duration(300)
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
                    .transition().duration(100)
                    .attr("opacity", 1)
                    .text(providerName);
            });
    }

    function finalChord() {
        counter=30; // blocca avanzamento autoplay = dim +1 generalizzato 
        // Rimuove i pulsanti
        d3.select("#clicker").style("visibility", "hidden");
        d3.select("#skip").style("visibility", "hidden");
        d3.select("#reset").style("display", "block");
        d3.select("#playPause").style("display", "none");
        d3.select("#advance").style("display", "none");
        d3.select("#back").style("display", "none");

        // Rimuove i testi
        changeTopText("", 0, 0, 1);
        changeBottomText("", 0, 0, 1);
        /*changeTopText(newText = "",
				loc = 0, delayDisappear = 0, delayAppear = 1);
			changeBottomText(newText = "",
				loc = 0, delayDisappear = 0, delayAppear = 1); */

        // Crea o mostra gli archi
        if (counter <= 8) {
            g.append("svg:path")
                .style("stroke", d => fill(d.index))
                .style("fill", d => fill(d.index))
                .attr("d", arc)
                .style("opacity", 0)
                .transition().duration(1000)
                .style("opacity", 1);
        } else {
            svg.selectAll("g.group").select("path")
                .transition().duration(1000)
                .style("opacity", 1);
        }

        // Rende visibili le interazioni mouseover e mouseout
        d3.selectAll("path")
            .on("mouseover", fade(.02))
            .on("mouseout", fade(.80));


        // Mostra tutte le chords
        // Assicurati che le "chords" siano selezionate correttamente
        chords_inside.transition().duration(1000)
            .style("opacity", 0.6);


        // Mostra i testi e le linee degli archi
        /*d3.selectAll("g.group").selectAll("line")
            .transition().duration(100)
            .style("stroke", "#000");*/

        svg.selectAll("g.group")
            .transition().duration(100)
            .selectAll(".titles").style("opacity", 1);
    }


    /*Returns an event handler for fading a given chord group*/
   function fade(opacity) {
    return function(event, i) {
        svg.selectAll("path.chord")
            .filter(function(d) {
                return d.source.index !== i.index && d.target.index !== i.index;
            })
            .transition()
            .style("stroke-opacity", opacity)
            .style("fill-opacity", opacity);
    };
}


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
}

Promise.all([
    d3.json("names.json"),
    d3.json("matrix.json")
]).then(([namesData, matrixData]) => {
    const NameGene = namesData.NameGene;
    const matrix = matrixData.matrix;
    initializeChordChart(NameGene, matrix);
}).catch(error => {
    console.error("Errore nel caricamento del file JSON:", error);
});
