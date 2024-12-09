# -*- coding: utf-8 -*-
"""
Created on Tue Sep 24 11:35:28 2024

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

# Variable global para almacenar los datos cargados
uploaded_data = None

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    global uploaded_data  # Usamos la variable global para acceder a los datos

    if request.method == 'GET':
        if uploaded_data is None:
            return jsonify({"message": "No file uploaded yet. Please upload a file using POST."}), 400
        return jsonify(uploaded_data)  # Devuelve los datos leídos del archivo

    if request.method == 'POST':
        # Si es una solicitud POST, procesamos el archivo cargado
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        file_extension = file.filename.split('.')[-1].lower()

        if file_extension == 'json':
            uploaded_data = handle_json(file)  # Guardamos los datos procesados
            return jsonify(uploaded_data)
        elif file_extension == 'parquet':
            uploaded_data = handle_parquet(file)  # Guardamos los datos procesados
            return jsonify(uploaded_data)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400

def handle_json(file):
    try:
        data = json.load(file)
        return data  # Devolvemos los datos para almacenarlos globalmente
    except json.JSONDecodeError:
        return {'error': 'Error reading JSON'}

def handle_parquet(file):
    try:
        # pyarrow para procesar el archivo Parquet
        import pyarrow.parquet as pq
        table = pq.read_table(io.BytesIO(file.read()))
        data = table.to_pandas().to_dict(orient='records')
        return data  # Devolvemos los datos para almacenarlos globalmente
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    app.run(debug=True)
