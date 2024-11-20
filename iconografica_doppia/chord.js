const colors = ["#C4C4C4", "#69B40F", "#EC1D25", "#C8125C", "#008FC8", "#10218B", "#134B24", "#737373"];
        const fill = d3.scaleOrdinal().range(colors);
        const margin = { top: 20, right: 15, bottom: 10, left: 15 };
        const width = 400 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        const innerRadius = Math.min(width, height) * 0.39;
        const outerRadius = innerRadius * 1.30;

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
            .on("mouseover", (event, d) => {
                const geneName = NameGene[d.index];
                const rootNode = d3.hierarchy(data);
                const treeNode = findNodeByName(geneName, rootNode);
                if (treeNode) highlightPath(null, treeNode);
            })
            .on("mouseout", resetHighlight)
            .transition().duration(1000)
            .style("opacity", 0.4);

        
            /* Initiate Names */
		
		g.append("svg:text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("class", "titles")
            //.style("size-font", "12x")
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (innerRadius + 20) + ")"
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
            d3.select("#playPause").style("display", "none");
            d3.select("#advance").style("display", "none");
            d3.select("#back").style("display", "none");
        }

        // Skip button
        d3.select("#skip")
            .on("click", finalChord);

        let isPlaying = true;
        let counter = 1;
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
                if (counter === 2) {
                    d3.select("#back").style("visibility", "visible"); // Mostra "BACK" dopo il primo avanzamento
                }
                if (counter <= 8) drawStep(counter - 1);
                else if (counter >= 9 && counter <= 16) drawChords(counter - 8);
                if (counter === 17) {
                    finalChord();
                    clearInterval(autoAdvance);
                    d3.select("#back").style("visibility", "hidden"); // Nasconde "BACK" alla fine della sequenza
                }
                counter++;
            }, 7000);
        }


		// Funzione per mettere in pausa e riprendere
        d3.select("#playPause").on("click", () => {
            if (isPlaying) {
                clearInterval(autoAdvance);
                d3.select("#playPause").text("PLAY");
            } else {
                startAutoAdvance();
                d3.select("#playPause").text("PAUSE");
            }
            isPlaying = !isPlaying;
        });

        // Advance button
        d3.select("#advance").on("click", function () {
            if (counter <8) {
                drawStep(counter - 1);
            } else if (counter >= 8 && counter <= 15) {
                drawChords(counter - 7);
            }
            counter++; // Incrementa il contatore per andare al passaggio successivo
        });

        function drawStep(index) {
            const geneName = NameGene[index];
            
            // Evidenzia chord
            showChord(index);

            // Trova il nodo corrispondente nell'albero
            const rootNode = d3.hierarchy(data); // Radice dell'albero
            const treeNode = findNodeByName(geneName, rootNode);

            if (treeNode) {
                highlightPath(null, treeNode); // Evidenzia percorso nell'albero
            }
            
            // Aggiorna i testi sopra e sotto
            changeTopText(`Spiegazione del gene ${geneName}`, 3 / 2, 0, 1);
            changeBottomText("", 2 / 2, 0, 1);
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

		function showChord(sourceIndex) {
            d3.selectAll(".chord") // Seleziona tutti i path dei chords
                .transition().duration(1500)
                .attr("opacity", function(d) {
                    return d.source.index === sourceIndex ? 1 : 0;
                });
        }

        function showChord(sourceIndex) {
            d3.selectAll(".chord")
                .data(chords_inside)  // Associa i dati di `chords` alla selezione
                .transition().duration(1500)
                .attr("opacity", function(d) {
                    if (d.source.index === sourceIndex) {
                        return 1;
                    }
                    return 0;
                });
        }

        function finalChord() {
            counter=30; // blocca avanzamento autoplay 
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
            d3.selectAll(".group")
                .on("mouseover", fade(.02))
                .on("mouseout", fade(.80));


            // Mostra tutte le chords
            svg.selectAll("path.chord")  // Assicurati che le "chords" siano selezionate correttamente
                .transition().duration(1000)
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
		return function(d, i) {
			svg.selectAll("path.chord")
				.filter(function(d) { return d.source.index != i && d.target.index != i; })
				.transition()
				.style("stroke-opacity", opacity)
				.style("fill-opacity", opacity);
		};
		};/*fade*/

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
		function stopClicker() {
			d3.select("#clicker")
				.style("pointer-events", "none")
				.transition().duration(400)
				.style("border-color", "#D3D3D3")
				.style("color", "#D3D3D3");
		};/*stopClicker*/
