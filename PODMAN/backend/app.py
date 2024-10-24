# -*- coding: utf-8 -*-
"""
Created on Tue Sep 24 11:35:28 2024

@author: Vanessa
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_compress import Compress
import json

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Límite (16MB)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['COMPRESS_ALGORITHM'] = 'gzip'
app.config['COMPRESS_LEVEL'] = 6  # Nivel de compresión obteniendo buen equilibrio entre velocidad y tamaño.

compress = Compress(app)
cors = CORS(app, origins=['http://localhost:8080'])

# API utilizando FLASK
@app.route('/apartamentos', methods=['GET'])
def get_data():
    try:
        with open('apartamentos.json', 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)

        # Asegúrate de que esto sea un array
        if not isinstance(data, list):
            return jsonify({"error": "El archivo JSON debe contener una lista de apartamentos"}), 500

        return jsonify(data)
    
    except FileNotFoundError:
        return jsonify({"error": "Archivo no encontrado"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Error al decodificar el JSON"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
