# Documentación del Proyecto ECharts

## Índice
1. [Introducción](#introducción)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Requisitos del Sistema](#requisitos-del-sistema)
4. [Instalación de Podman y npm](#instalación-de-podman-y-npm)
5. [Contenedores en Podman](#contenedores-en-podman)
   - [Creación del Contenedor para Backend](#creación-del-contenedor-para-backend)
     - [Explicación del código](#explicación-del-código-backend)
     - [Optimización del rendimiento](#optimización-del-rendimiento-backend)
     - [Seguridad](#seguridad-backend)
     - [Pruebas de seguridad](#pruebas-de-seguridad)
   - [Creación del Contenedor para Frontend](#creación-del-contenedor-para-frontend)
     - [Explicación del código](#explicación-del-código-frontend)
     - [Optimización del rendimiento](#optimización-del-rendimiento-frontend)
     - [Seguridad](#seguridad-frontend)
6. [Archivos del Proyecto](#archivos-del-proyecto)
   - [Backend](#backend)
     - [requirements.txt](#requirementstxt)
     - [app.py](#apppy)
     - [apartamentos.json](#apartamentosjson)
   - [Frontend](#frontend)
     - [package.json](#packagejson)
     - [package-lock.json](#package-lockjson)
     - [styless.css](#stylescss)
     - [main.js](#mainjs)
     - [index.html](#indexhtml)
9. [Conclusión](#conclusión)

## Introducción
Este proyecto tiene como objetivo la visualización de datos estadísticos y geoespaciales utilizando **ECharts** desde un contenedor creado en **Podman**. Los contenedores tienen el beneficio de ser escalables y seguros, por lo que, su utilización en este proyecto será viable puesto a que se recibirá un gran volumen de datos. 

## Estructura del Proyecto
El proyecto está dividido en dos carpetas principales:

- **frontend**: Contiene los archivos HTML, CSS y JavaScript (ECharts) necesarios para la visualización de las gráficas.
- **backend**: Contiene la API en Flask que proporciona los datos a la aplicación frontend, así como un archivo JSON para la lectura de los datos.

## Requisitos del Sistema
Para ejecutar este proyecto, son necesarios los siguientes requisitos:

- **Podman**: Para la creación y gestión de contenedores.
- **Node.js** y **npm**: Para gestionar las dependencias del frontend.
- **Python**: Para ejecutar la API de Flask.

## Instalación de Podman y npm

Para instalar podman, se necesitaron varios comandos los cuales se consiguieron en su sitio oficial:

![podman](img/podman.jpeg "Sitio oficial Podman")

y se procedieron a colocar en la terminal, tal y como se muestra a continuación:
![podmand](img/podman2.jpeg "instalación")
Para verificar su correcta instalación se procedió a solicitar la versión de Podman (si no muestra la versión es porque no esta instalado).
![podmant](img/podman3.jpeg "versión podman")

*Instalación de npm*
![npm](img/npm.jpeg "instalación npm")
Al momento de haber finalizado con la instalación del npm, este creará el archivo package-lock.json y la carpeta node_modules.
![package](img/packagelock.jpeg "Archivos nuevos")
## Contenedores en Podman

### Creación del Contenedor para Backend
1. **Archivo Dockerfile.backend**:
   Este archivo define la imagen del contenedor para el backend. Cuenta 
   ```
    FROM python:3.11-alpine AS backend
    RUN addgroup -S appgroup && adduser -S appuser -G appgroup
    WORKDIR /app
    COPY ./backend/requirements.txt /app/
    RUN pip install --no-cache-dir -r requirements.txt
    COPY ./backend /app
    RUN chown -R appuser:appgroup /app
    USER appuser
    EXPOSE 5000
    CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
   ```
   #### Explicación del código backend

    + **FROM python:3.11-alpine AS backend**: se utiliza una imagen base oficial de Python 3.11 sobre Alpine Linux. ALpine es una distribución minimalista y optimizada para contenedores, lo que reduce el tamaño de la imagen y mejora el **rendimiento**.
    + **RUN addgroup -S appgroup && adduser -S appuser -G appgroup**: Se crea un grupo llamado appgroup y un usuario sin privilegios llamado appuser dentro de ese grupo. El uso del indicador -S crea un usuario y grupo de sistema, lo que evita la asignación de privilegios innecesarios.
    + **WORKDIR /app**: establece el directorio de trabajo en */app*, es decir, todas las operaciones siguientes, como la copia de archivos, ocurrirán en este directorio dentro del contenedor.

        **Beneficio**: organiza mejor los archivos y define un punto de referencia claro para la aplicación.
    + **COPY ./backend/requirements.txt /app/**: copia el archivo requirements.txt (donde se definen las dependencias de Python) desde el host al directorio */app/* en el contenedor.
    + **RUN pip install --no-cache-dir -r requirements.txt**: instala las dependencias de Python especificadas en el archivo *requirements.txt* utilizando *pip*, y el argumento *--no-cache-dir* impide que se almacene en caché el contenido de los paquetes instalados.
    + **COPY ./backend /app**: copia todo el contenido del directorio *backend* (donde está la API y los archivos de la aplicación) desde el host al contenedor dentro del directorio */app/*.
    + **RUN chown -R appuser:appgroup /app**: cambia el propietario de todos los archivos y carpetas en el directorio */app* al usuario *appuser* y grupo *appgroup* creados previamente.
    + **USER appuser**: especifica que todas las operaciones restantes se ejecutarán como el usuario *appuser* en lugar de root, lo que refuerza la seguridad.
    + **EXPOSE 5000**: informa a Podman que el contenedor utilizará el puerto 5000, que es el puerto predeterminado en el que Flask ejecuta la aplicación.
    + **CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]**: este es el comando que se ejecuta cuando se inicia el contenedor. inicia el servidor Flask y lo hace accesible a través de la dirección IP 0.0.0.0 (lo que significa que puede recibir tráfico desde cualquier dirección) en el puerto 5000.
  
#### Optimización del rendimiento backend
+ **Minimización de tamaño con Alpine**: la imagen *Alpine* es mucho más ligera que otras distribuciones de Linux, lo que reduce el tamaño del contenedor y mejora los tiempos de descarga e inicio.
+ **No caché en la instalación de dependencias**: La instrucción *pip install --no-cache-dir* evita el almacenamiuento en caché de los paquetes de Python, lo que reduce el tamaño del contenedor y evita que se acumulen archivos innecesarios.
+ **Compresión de datos**: las imágenes de Alpine vienen con bibliotecas que suelen ser más eficaces en términos de almacenamiento, y muchas veces se utiliza una capa comprimida de las imágenes. Esto ayuda a minimizar el uso de espacio en disco.
+ **Capas de construcción optimizadas**: al copiar primero solo el archivo *requirements.txt* y luego instalar las dependencias antes de copiar el resto de la aplicación, se optimiza el caché de las capas de Podman. Esto significa que si solo cambia el código fuente pero no las dependencias, Podman no volverá a instalar todas las dependencias, acelerando la reconstrucción del contenedor.

#### Seguridad backend
+ **Ejecución como usuario sin privilegios**: ejecutar el contenedor como el usuario *appuser* meora la seguridad al evitar que la aplicación tenga acceso a permisos elevados.
+ **Restricción de permisos**: se aseguran los permisos correctos para que solo el usuario designado pueda acceder y ejecutar la aplicación en */app*.

#### Pruebas de seguridad

1. **Verificación de usuario**: con el comando *podman exec -it IṔ-contenedor whoami* se busca verificar que el usuario sea appuser y no root, *podman exec* ejecuta un comando de un contenedor que ya esta en ejecución, *-it* son dos operaciones combinadas '-i' significa interactivo y este permite la entrada estándar del contenedor permanezca abierta y '-t' significa terminal, *IP-contenedor* se reemplaza por la IP del contenedor en ejecución y *whoami* devuelve el nombre del usuario actual que está ejecutando el proceso.

    ![whoami](img/whoami.jpeg "Verificación de usuario")

2. **Verificación de puertos abiertos**: con el comando *nmap -p- 127.0.0.1* se utiliza para escanear los puertos de la dirección IP local (localhost). *nmap* permite descubrir dispositivos en la red y sus servicios. *-p-* argumento para que nmap escanee todos los puertos en busca de servicios que estén escuchando.

    ![nmap](img/nmap.jpeg "Verificación de puertos abuiertos")

    Con esto podemos verificar que el puerto 5000 es el que solo esta abierto para que funcione la api Flask (el 631/tcp es para ipp, no se pudo cerrar).

3. **Construcción del contenedor**: Se deberá ejecutar el siguiente comando en la terminal para construir el contenedor del backend.

    ```
    podman build -t flask-api -f Dockerfile.backend .
    ```
    Para ejecutarlo, se deberá agregar el comando:
    ```
    podman run -p 5000:5000 flask-api
    ```
    Mostrandose de la siguiente manera en la terminal:

    ![flask](img/flask.jpeg "Ejecución de contenedor")

    Para verificar que la API esta ejecutándose en el navegador se deberá acceder a las rutas que muestra en la terminal y se le deberá agregar "/apartamentos", tal y como se muestra en la siguiente imagen: 

    ![api](img/json.jpeg "API")

### Creación del Contenedor para Frontend
1. **Archivo Dockerfile.frontend**:
   Este archivo define la imagen del contenedor para el frontend.
   ```
    FROM node:20-alpine AS frontend
    WORKDIR /app
    COPY ./frontend/package*.json ./
    RUN npm ci --no-optional
    COPY ./frontend /app
    RUN npm run build
    FROM docker.io/library/nginx:alpine AS production
    RUN apk add --no-cache libcap
    RUN adduser -D -g 'nginx' nginxuser
    COPY --from=frontend /app/dist /usr/share/nginx/html
    RUN chown -R nginxuser:nginxuser /usr/share/nginx/html
    RUN setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
   ```
   #### Explicación del código frontend

   + **FROM node:20-alpine AS frontend**: utiliza node:20-alpine, que es una imagen ligera de Node.js basada en Alpine Linux.
   + **WORKDIR /app**: establece */app* como el directorio de trabajo dentro del contenedor.
   + **COPY ./frontend/package*.json ./**: copia *package.json* y package-lock.json* al contenedor. Esto es fundamental para instalar las dependencias específicadas en estos archivos.
   + **RUN npm ci --no-optional**:  utiliza *npm ci* para instalar las dependencias de forma limpia y rápida, asegurando que se instalen exactamente las versiones indicadas en *package-lock.json*. Esto contriuye a la optimización del rendimiento y la estabilidad de la aplicación.
   + **COPY ./frontend /app**: esta acción permite que todo el código fuente del frontend esté disponible en el contenedor.
   + **RUN npm run build**: ejecuta el script *build* definido en package.json, lo cual normalmente compila el código fuente de la aplicación y genera archivos estáticos listos para la producción.
   + **FROM docker.io/library/nginx:alpine AS production**: se selecciona una imagen de Nginx también basada en Alpine para servir los archivos estáticos generados en la etapa anterior.
   + **RUN apk add --no-cache libcap**: instala *libcap* que se utiliza para establecer capacidades específicas en el contenedor, como permitir que Nginx escuche en el puerto 80.
   + **RUN adduser -D -g 'nginx' nginxuser**: crea un usuario que no tiene privilegios, lo que reduce el riesgo de comprometer el contenedor.
   + **COPY --from=frontend /app/dist /usr/share/nginx/html**: copia los archivos generados por el frontend al directorio donde Nginx servirá los archivos.
   + **RUN chown -R nginxuser:nginxuser /usr/share/nginx/html**: cambia la propiedad de los archivos servidos a *nginxuser*, asegurando que solo este usuario tenga acceso a esos archivos.
   + **RUN setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx**: permite que Nginx escuche en el puerto 80 sin ser ejecutado como root, mejorando la seguridad del contenedor.
   + **EXPOSE 80**: indica que el contenedor escucha en el puerto 80, el puerto estándar para HTTP.
   + **CMD ["nginx", "-g", "daemon off;"]**: inicia Nginx en primer plano, lo cual es necesario para que el contenedor permanezca en ejecución.

2. **Archivo nginx.conf**:
   Es la configuración de Nginx, un servidor web. Define cómo debe manejar las solicitudes, especifica la ubicación de los archivos estáticos, establece políticas de compresión y caché, e implementa medidas de seguridad para proteger la aplicación web.
   ```
    worker_processes auto;

    events {
        worker_connections 1024;  # Número máximo de conexiones simultáneas por proceso de trabajo
    }

    http {
        gzip on;
        gzip_types text/plain application/javascript text/css application/json application/xml text/xml image/svg+xml;
        gzip_min_length 256;
        gzip_vary on;
        gzip_proxied any;

        server {
            listen 80;
            server_name localhost; 

            location / {
                root /usr/share/nginx/html;  # Ruta a los archivos estáticos
                index index.html index.htm;
                try_files $uri $uri/ /index.html;  # Soporte para Single Page Application (SPA)
            }

            error_page 404 /404.html;
            location = /404.html {
                internal;
            }

            add_header X-Content-Type-Options nosniff;
            add_header X-Frame-Options SAMEORIGIN;
            add_header X-XSS-Protection "1; mode=block";
            add_header Referrer-Policy no-referrer; 

            client_max_body_size 16M;

            types {
                text/html html;
                text/css css;
                application/javascript js;
                image/svg+xml svg;
                application/json json;
            }

            location ~* \.(js|css|html|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;  # Caché por 1 año
                add_header Cache-Control "public";  # Control de caché
            }
        
    }
   ```
   #### Explicación del código:

   + **worker_processes auto**: ajusta automáticamente el número de procesos de trabajo según la cantidad de núcleos de CPU disponibles, mejorando el rendimiento.
   + **worker_connections 1024**: permite hasta 1024 conexiones simultáneas por proceso, optimizando el manejo de múltiples solicitudes.
   + **Compresión Gzip**: se habilita para tipos de archivoss específicos, reduciendo el tamaño de los datos transferidos y mejorando los tiempos de carga.
   + **Puerto y nombre del servidor**: configura el servidor para escuchar en el puerto 80 y permite el acceso desde localhost.
   + **Ubicación de archivos estáticos**: define la raíz de los archivos estáticos y utiliza try_files para manejar rutas de aplicaciones de una sola página (SPA).
   + **Manejo de errores**: proporciona una página de error 404 personalizada para mejorar la experiencia del usuario.
   + **Cabeceras de seguridad**: implementa cabeceras que protegen contra vulnerabilidades comunes, como inyección de scripts y ataques de "clickjacking".
   + **Límites y MIME Types**: establece un límite en el tamaño de las solicitudes y define los tipos MIME que Nginx debe reconocer y servir.
   + **Configuración de Caché**: establee políticas de caché para archivos estáticos, mejorando el rendimiento al reducir la necesidad de descargar archivos repetidamente.

#### Optimización del rendimiento frontend

+ La elección de node:20-alpine y nginx:alpine asegura un entorno ligero y eficiente, ideal para aplicaciones web modernas que utilizan herramientas de análisis y visualización de datos.
+ La etapa de construcción del frontend genera archivos estáticos optimizados para producción. La habilitación de la compresion Gzip reduce el tamaño de las respuestas HTTP, mejorando los tiempos de carga. Además, la configuración de caché permite que los archivos estáticos se almacenen en el navegador del usuario, disminuyendo la carga en el servidor y acelerando la aplicación.

#### Seguridad frontend

+ El contenedor se ejecuta con un usuario no privilegiado y permite que Nginx escuche en el puerto 80 sin usar permisos de root lo que mejora la seguridad. Las cabeceras de seguridad implementadas protegen contra varias vulnerabilidades comunes en aplicaciones web, y el límite de tamaño de solicitudes protege el servidor de ataques de denegación de servicio (DoS).


3. **Construcción del contenedor**: similar al backend, el siguiente comando construye el contenedor del frontend:
    ```
    podman build -t frontend-echarts -f Dockerfile.frontend .
    ```
    ![echarts](img/frontend.jpeg "Contenedor front")
    Para ejecutarlo, se deberá agregar el comando:
    ```
    podman run -p 8080:80 frontend-echarts
    ```
    ![echarts2](img/frontend2.jpeg "Contenedor front")

    Al acceder desde el navegador al contenedor por el puerto 8080 se podrán visualizar las gráficas 

    ![echarts3](img/frontend3.jpeg "Contenedor front")

## Archivos del Proyecto

### Backend
Omitiendo el archivo py donde se genera la API y el archivo json (los cuales se explicaron en la documentación anterior), se explicarán los archivos nuevos para el contenedor.
#### requirements.txt
Contiene las dependencias necesarias para el backend.

```
    Flask==2.2.3
    Flask-Cors==3.0.10
    Flask-Compress==1.13
    Werkzeug==2.3.2
```
#### app.py
Contiene la configuración de una API ustilizando *Flask* con algunas mejoras para manejar la compresión de respuestas y el control de origen cruzado (CORS).

```
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
```
1. ***Importaciones***:

    + **Flask** para crear la API.
    + **CORS** para permitir solicitudes desde otros dominios.
    Flask-Compress para habilitar la compresión de las respuestas usando gzip, mejorando el rendimientos al reducir el tamaño de los datos enviados.
    + **JSON** para manejar archivos de datos en formato JSON.

2. ***Configuración del servidor***:

    + Se establece un limite de tamaño máximo para los datos recibidos (16MB).
    + Se configura el nivel de compresión para equilibrar velocidad y tamaño.
    + Se habilita CORS, permitiendo que el frontend haga solicitudes a la API.

3. ***Ruta de la API***:
    + La ruta */apartamentos* devuelve los datos del archivo *apartamentos.json* en formato JSON.
    + SI el archivo no existe, o si el formato JSON es incorrecto, se devuelven errores apropiados.

4. ***Ejecución***:
    + EL servidor Flask se ejecuta 0.0.0.0 en el puesto 5000, lo que permite conexiones desde cualquier dirección IP, y se desactiva el modo de depuración.

#### apartamentos.json
Archivo JSON con todos los datos de los apartamentos.

### Frontend
Omitiendo los archivos HTML, JS y CSS (los cuales se explicaron en la anterior documentación), se explicarán el nuevo archivo para el contenedor

#### package.json
Archivo que gestiona las dependencias y scripts del frontend:

```
{
    "name": "mi-proyecto-echarts",
    "version": "1.0.1",
    "description": "Proyecto para visualizar datos estadísticos y geoespaciales utilizando ECharts optimizado para rendimiento y seguridad.",
    "main": "main.js",
    "scripts": {
        "start": "http-server .",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "Vanessa García Lara",
    "license": "MIT",
    "dependencies": {
        "echarts": "^5.4.0",
        "http-server": "^0.12.3"
    },
    "devDependencies": {
        "eslint": "^7.32.0"
    }
}
```
#### package-lock.json
Ayuda a controlar las versiones de dependencias y garantiza que los entornos sean consistentes.

#### styles.css
Ayuda a darle estilo al index.html.

```
body {
    background-color: #f8f9fa; /* Color de fondo suave */
    font-family: 'Arial', sans-serif; /* Fuente moderna */
}

h1 {
    color: #343a40; /* Color del título */
}

.container {
    background-color: #ffffff; /* Fondo blanco para el contenedor */
    border-radius: 8px; /* Bordes redondeados */
    box-shadow: 0 8px 8px rgba(0, 0, 0, 0.1); /* Sombra sutil */
    padding: 20px; /* Espaciado interno */
}

.chart {
    width: 100%; /* Ancho completo para gráficos */
    min-height: 400px; /* Altura mínima para gráficos */
    border: 1px solid #dee2e6; /* Borde suave */
    border-radius: 8px; /* Bordes redondeados para gráficos */
   
}

.form-select {
    border: 1px solid #ced4da; /* Borde del select */
    border-radius: 4px; /* Bordes redondeados para el select */
}

.form-label {
    font-weight: bold; /* Hacer la etiqueta más prominente */
}
```
#### main.js
Este código contiene funciones para generar y controlar múltiples gráficos de ECharts con datos de apartamentos. Utiliza datos de una API en Flask (/apartamentos) para crear diferentes visualizaciones.

```
const fetchData = async () => {
  const response = await fetch('http://localhost:5000/apartamentos');
  return await response.json();
};

// Función para contar apartamentos según el 
const countApartmentsBySelection = (data, selection) => {
  const options = [...new Set(data.map(item => item[selection]))];
  const countOptions = {};
  options.forEach(option => {
    countOptions[option] = 0;
  });
  data.forEach(item => {
    countOptions[item[selection]]++;
  });

  return {
    options,
    info: options.map(option => countOptions[option]),
  };
};

//Chart 2
const hideChart2 = () => {
  chart2 = document.getElementById('chart2');
  chart2.style.display = 'none';
};

const showChart2 = () => {
  const chart2 = document.getElementById('chart2');
  chart2.style.display = 'block';
};

//Chart 3
const hideChart3 = () => {
  chart3 = document.getElementById('chart3');
  chart3.style.display = 'none';
};

const showChart3 = () => {
  const chart3 = document.getElementById('chart3');
  chart3.style.display = 'block';
};

//Chart 4
const hideChart4 = () => {
  chart4 = document.getElementById('chart4');
  chart4.style.display = 'none';
};

const showChart4 = () => {
  const chart4 = document.getElementById('chart4');
  chart4.style.display = 'block';
};

//Chart 5
const hideChart5 = () => {
  chart5 = document.getElementById('chart5');
  chart5.style.display = 'none';
};

const showChart5 = () => {
  const chart5 = document.getElementById('chart5');
  chart5.style.display = 'block';
};


// Gráfico de barras por selection
const getOptionChart = (options, info) => {
  return {
    title: {text: 'Cantidad de apartamentos por ubicación' },
    tooltip: {trigger: 'item'},
    xAxis: {name: 'Ubicaciones', type: 'category', data: options},
    yAxis: {name: 'N° de apartamentos', type: 'value'},
    series: [{
      type: 'bar',
      data: info
    }]
  };
};


// Gráfico de pastel por selection
const getOptionChart2 = (options, info) => {
  return {
    title: {text: 'Distribución de apartamentos por ubicación', left: 'center'},
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', top: 'bottom' },
    series: [
      {
        name: 'Apartamentos',
        type: 'pie',
        radius: '50%',
        data: options.map((option, index) => ({
          name: option,
          value: info[index]
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
};

const getOptionScatterByLocation = (data) => {
  const seriesData = {};
  
  data.forEach(item => {
    if (!seriesData[item.ubicacion]) {
      seriesData[item.ubicacion] = [];
    }
    seriesData[item.ubicacion].push([item.precio, item.mt2]);
  });

  return {
    title: { text: 'Relación precio vs metros cuadrados por ubicación' },
    xAxis: { type: 'value', name: 'Precio en millones' },
    yAxis: { type: 'value', name: 'Metros Cuadrados' },
    series: Object.keys(seriesData).map(ubicacion => ({
      name: location,
      type: 'scatter',
      data: seriesData[ubicacion],
      label: {
        emphasis: {
          show: true,
          formatter: location
        }
      }
    }))
  };
};

const getOptionBoxPlotByLocation = (data) => {
  const locations = [...new Set(data.map(item => item.ubicacion))];
  const pricesByLocation = locations.map(ubicacion => 
    data.filter(item => item.ubicacion === ubicacion).map(item => item.precio).sort((a, b) => a - b)
  );

  return {
    title: { text: 'Distribución de precios por ubicación' },
    tooltip: { trigger: 'item' },
    xAxis: { type: 'category', data: locations },
    yAxis: { type: 'value', name: 'Precio en millones' },
    series: [{
      type: 'boxplot',
      data: pricesByLocation.map(precio => [
        Math.min(...precio), 
        precio[Math.floor(precio.length * 0.25)], 
        precio[Math.floor(precio.length * 0.5)], 
        precio[Math.floor(precio.length * 0.75)], 
        Math.max(...precio) 
      ])
    }]
  };
};

const getOptionDonutByLocation = (options, info) => {
  return {
    title: { text: 'Distribución de apartamentos por ubicación', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: options.map((option, index) => ({
        name: option,
        value: info[index]
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
};

// Gráfico de líneas para precio promedio por estrato
const getOptionChartByStratum = (stratum, prices) => {
  return {
    title: { text: 'Precio promedio por estrato' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: stratum, name:'Estrato' },
    yAxis: { type: 'value', name: 'Precio en millones' },
    series: [{
      type: 'line',
      data: prices
    }]
  };
};

// Gráfico de pastel por número de alcobas
const getOptionChartByBedrooms = (bedrooms, info) => {
  return {
    title: { text: 'Distribución de apartamentos por número de alcobas' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', top: 'bottom' },
    series: [{
      type: 'pie',
      radius: '50%',
      data: bedrooms.map((alcoba, index) => ({
        name: `${alcoba} Alcobas`,
        value: info[index]
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
};

const getOptionStackedHorizontalBar = (data) => {
  // Obtener todas las ubicaciones únicas
  const locations = [...new Set(data.map(item => item.ubicacion))];

  // Filtrar las características por cada ubicación
  const bedroomsByLocation = locations.map(ubicacion => 
    data.filter(item => item.ubicacion === ubicacion).reduce((sum, item) => sum + item.alcobas, 0)
  );
  
  const bathroomByLocation = locations.map(ubicacion => 
    data.filter(item => item.ubicacion === ubicacion).reduce((sum, item) => sum + item.banos, 0)
  );
  
  const parkingLotsByLocation = locations.map(ubicacion => 
    data.filter(item => item.ubicacion === ubicacion && item.parqueadero === 'si').length
  );
  
  const balconiesByLocation = locations.map(ubicacion => 
    data.filter(item => item.ubicacion === ubicacion && item.balcon === 'si').length
  );

  return {
    title: { text: 'Características por ubicación' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top:'10%', orient: 'vertical', left: 'right', data: ['Alcobas', 'Baños', 'Parqueaderos', 'Balcones'] },
    grid: { left: '6%', right: '%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },  // Eje X será numérico para las características
    yAxis: { type: 'category', data: locations },  // Eje Y con las ubicaciones
    series: [
      {
        name: 'Alcobas',
        type: 'bar',
        stack: 'total',  // Apilar las series
        label: { show: true },
        data: bedroomsByLocation
      },
      {
        name: 'Baños',
        type: 'bar',
        stack: 'total',
        label: { show: true },
        data: bathroomByLocation
      },
      {
        name: 'Parqueaderos',
        type: 'bar',
        stack: 'total',
        label: { show: true },
        data: parkingLotsByLocation
      },
      {
        name: 'Balcones',
        type: 'bar',
        stack: 'total',
        label: { show: true },
        data: balconiesByLocation
      }
    ]
  };
};

const getOptionBarLabelRotation = (data) => {
  // Obtener todas las ubicaciones únicas
  const locations = [...new Set(data.map(item => item.ubicacion))];

  // Filtrar las características por cada ubicación
  const bedroomsByLocation = locations.map(ubicacion => 
    data.filter(item => item.ubicacion === ubicacion).reduce((sum, item) => sum + item.alcobas, 0)
  );
  
  const bathroomByLocation = locations.map(ubicacion => 
    data.filter(item => item.ubicacion === ubicacion).reduce((sum, item) => sum + item.banos, 0)
  );
  
  const parkingLotsByLocation = locations.map(ubicacion => 
    data.filter(item => item.ubicacion === ubicacion && item.parqueadero === 'si').length
  );
  
  const balconiesByLocation = locations.map(ubicacion => 
    data.filter(item => item.ubicacion === ubicacion && item.balcon === 'si').length
  );

  return {
    title: { text: 'Características por Ubicación' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { orient: 'horizontal', top: 'bottom', data: ['Alcobas', 'Baños', 'Parqueaderos', 'Balcones'] },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: locations,
      axisLabel: {
        rotate: 45,  // Rotar las etiquetas del eje X
        interval: 0  // Mostrar todas las etiquetas
      }
    },
    yAxis: { type: 'value' },  // Eje Y será numérico para las características
    series: [
      {
        name: 'Alcobas',
        type: 'bar',
        label: { show: true },
        data: bedroomsByLocation
      },
      {
        name: 'Baños',
        type: 'bar',
        label: { show: true },
        data: bathroomByLocation
      },
      {
        name: 'Parqueaderos',
        type: 'bar',
        label: { show: true },
        data: parkingLotsByLocation
      },
      {
        name: 'Balcones',
        type: 'bar',
        label: { show: true },
        data: balconiesByLocation
      }
    ]
  };
};


// Gráfico de barras apiladas por baños
const getOptionChartByBathrooms = (bathroom, info) => {
  return {
    title: { text: 'Distribución de apartamentos por número de baños'},
    tooltip: {trigger: 'item'},
    legend: {top: '15%', orient: 'vertical', left: 'left'},
    series: [
      {
        type: 'pie',
        radius: '50%',
        avoidLabelOverlap: false,
        padAngle: 5,
        itemStyle: {
          borderRadius: 10
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: bathroom.map((banos,index) => ({
          name: `${banos} Baños`,
          value: info[index]
        })),
      }
    ]
  };
};

// Muestra gráficos según el selection seleccionado
const initChart = async () => {
  const data = await fetchData();

  const selection = document.getElementById("data-select").value;

  const chart1 = echarts.init(document.getElementById("chart1"));
  const chart2 = echarts.init(document.getElementById("chart2"));
  const chart3 = echarts.init(document.getElementById("chart3"));
  const chart4 = echarts.init(document.getElementById("chart4"));
  const chart5 = echarts.init(document.getElementById("chart5"));

  showChart2();
  showChart3();
  showChart4();
  showChart5();

  if (selection === 'ubicacion') {
    const { options, info } = countApartmentsBySelection(data, 'ubicacion');
    chart1.setOption(getOptionChart(options, info));
    chart2.setOption(getOptionChart2(options, info));
    chart3.setOption(getOptionScatterByLocation(data));
    chart4.setOption(getOptionBoxPlotByLocation(data));
    chart5.setOption(getOptionDonutByLocation(options,info));

  } else if (selection === 'estrato') {
    const strata = [...new Set(data.map(item => item.estrato))];
    const averagePrices = strata.map(estrato => {
      const prices = data.filter(item => item.estrato === estrato).map(item => item.precio);
      return prices.reduce((a, b) => a + b, 0) / prices.length;
    });
    chart1.setOption(getOptionChartByStratum(strata, averagePrices));
    hideChart2();
    hideChart3();
    hideChart4();
    hideChart5();
    
  } else if (selection === 'precio') {
    chart1.setOption(getOptionScatterByLocation(data));
    chart2.setOption(getOptionBoxPlotByLocation(data));
    hideChart3();
    hideChart4();
    hideChart5();

  } else if (selection === 'abpb') {
    const { options, info } = countApartmentsBySelection(data, 'alcobas');
    chart1.setOption(getOptionChartByBedrooms(options, info));
    chart2.setOption(getOptionStackedHorizontalBar(data));
    chart3.setOption(getOptionBarLabelRotation(data));
    chart4.setOption(getOptionChartByBathrooms(options, info));
    hideChart5();

  }
};

// Evento cuando se cambia la selección en el select
document.getElementById("data-select").addEventListener("change", initChart);

// Inicializar las gráficas al cargar la página
window.addEventListener("load", () => {
  initChart();
});
```
#### index.html
```
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
        <link rel="stylesheet" href="styles.css"/>
        <title>ECharts</title>
    </head>
    <body>
        <div id="app" class="container my-4">
            <div class="row mb-3">
                <div class="col-sm-12">
                    <label for="data-select" class="form-label">Seleccione el dato a visualizar:</label>
                    <select id="data-select" class="form-select">
                        <option value="ubicacion">Ubicación</option>
                        <option value="estrato">Estrato</option>
                        <option value="precio">Precios</option>
                        <option value="abpb">Alcobas, baños, parqueadero y balcón</option>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div id="chart1" class="chart"></div>
                </div>
                <div class="col-md-6 mb-4">
                    <div id="chart2" class="chart"></div>
                </div>
                <div class="col-md-6 mb-4">
                    <div id="chart3" class="chart"></div>
                </div>
                <div class="col-md-6 mb-4">
                    <div id="chart4" class="chart"></div>
                </div>
                <div class="col-md-6 mb-4">
                    <div id="chart5" class="chart"></div>
                </div>
            </div>
        </div>
        <!-- Bootstrap -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        <!-- Apache ECharts -->
        <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
        <!-- JS -->
        <script src="main.js"></script>
    </body>
</html>

```

## Conclusión
Considero que crear un contenedor y ejecutarlo es una tarea sencilla, lo importante en esto es saber como estructurarlo correctamente para que trabaje de una manera óptima.