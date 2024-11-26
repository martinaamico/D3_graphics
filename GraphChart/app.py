from flask import Flask, request, jsonify, render_template
import cv2  
import pytesseract
from PIL import Image
import numpy as np
import io
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import ResNet50, decode_predictions, preprocess_input

app = Flask(__name__)

# Configura il percorso di Tesseract OCR
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Carica il modello pre-addestrato ResNet50
model = ResNet50(weights='imagenet')

# Funzione per processare l'immagine
def process_image(image_bytes):
    try:
        # Converti i byte in un'immagine PIL
        img = Image.open(io.BytesIO(image_bytes))
        open_cv_image = np.array(img)

        # Usa Tesseract OCR per estrarre il testo
        extracted_text = pytesseract.image_to_string(open_cv_image)
        
        # Esegui una classificazione dell'immagine per determinare il tipo di grafico
        graph_type = classify_graph_type(open_cv_image)

        return extracted_text, graph_type
    except Exception as e:
        raise RuntimeError(f"Errore nell'elaborazione dell'immagine: {str(e)}")

# Funzione per classificare il tipo di grafico usando ResNet50
def classify_graph_type(image):
    # Preprocessa l'immagine per la classificazione
    img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))  # Assicurati che l'immagine sia della giusta dimensione
    img_array = np.expand_dims(img, axis=0)
    img_array = preprocess_input(img_array)  # Normalizza l'immagine

    # Predici il tipo di grafico
    predictions = model.predict(img_array)
    
    # Decodifica le predizioni per vedere la classificazione
    decoded_predictions = decode_predictions(predictions, top=3)[0]

    # In questo esempio, utilizziamo le prime 3 predizioni
    result = []
    for imagenet_class, class_name, score in decoded_predictions:
        result.append(f"{class_name} ({score:.2f})")
    
    return result

# Funzione per generare il prompt
def generate_prompt_from_text(text, graph_type):
    # Estrai le parole chiave
    keywords = extract_keywords(text)
    
    # Genera il prompt
    prompt = f"TIPO DI GRAFICO = \"{', '.join(graph_type)}\";\n"
    prompt += f"TITOLO = \"{text.splitlines()[0]}\";\n"
    prompt += "PAROLE CHIAVI ESTRATTE:\n"
    for word, count in keywords:
        prompt += f"\"{word}\", \"{count}\";\n"
    
    prompt += "Altre informazioni:\n"
    # Puoi aggiungere altre informazioni per il tipo di grafico
    prompt += "Informazioni aggiuntive per il tipo di grafico: ...\n"
    
    return prompt

# Funzione per estrarre le parole chiave
def extract_keywords(text):
    from collections import Counter
    words = text.split()
    word_count = Counter(words)
    # Estrai le parole con maggiore frequenza come parole chiave
    keywords = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
    return keywords

# Endpoint per la homepage che serve la pagina HTML
@app.route('/')
def index():
    return render_template('front_end.html')

# Endpoint per caricare l'immagine
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "File non trovato"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nome file vuoto"}), 400

    try:
        # Estrazione informazioni dall'immagine
        extracted_text, graph_type = process_image(file.read())
        prompt = generate_prompt_from_text(extracted_text, graph_type)
        return jsonify({"prompt": prompt}), 200
    except Exception as e:
        return jsonify({"error": f"Errore durante l'elaborazione: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
