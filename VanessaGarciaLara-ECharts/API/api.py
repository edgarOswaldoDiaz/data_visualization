# -*- coding: utf-8 -*-
"""
Created on Tue Sep 24 11:35:28 2024

@author: Vanessa
"""

from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
#Todas las rutas
CORS(app)  

# API utilizando FLASK
@app.route('/apartamentos', methods=['GET'])
def get_data():
    try:
        with open('API/apartamentos.json') as json_file:
            data = json.load(json_file) 
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": "Archivo no encontrado"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Error al decodificar el JSON"}), 500

if __name__ == '__main__':
    app.run(debug=True)
    