# -*- coding: utf-8 -*-
"""
Creado el 24 de septiembre de 2024

@author: Vanessa
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import parquet
import io

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No se encontró el archivo'}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400

    file_extension = file.filename.split('.')[-1].lower()

    if file_extension == 'json':
        return handle_json(file)
    elif file_extension == 'parquet':
        return handle_parquet(file)
    else:
        return jsonify({'error': 'Tipo de archivo no soportado'}), 400

def handle_json(file):
    try:
        data = json.load(file)
        return jsonify(data)
    except json.JSONDecodeError:
        return jsonify({'error': 'Error al leer el archivo JSON'}), 400

def handle_parquet(file):
    try:
        # pyarrow para procesar el archivo Parquet
        import pyarrow.parquet as pq
        table = pq.read_table(io.BytesIO(file.read()))
        data = table.to_pandas().to_dict(orient='records')
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
