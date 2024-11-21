let selectedData = []; // Datos cargados del archivo
let availableFields = []; // Campos disponibles para graficar

// Modificación de la función para analizar datos y combinar campos
const analyzeDataForGraphing = (data) => {
  const fields = Object.keys(data[0] || {});
  const fieldsToGraph = fields.filter((field) => {
    const uniqueValues = new Set(data.map(item => item[field]));
    const uniqueCount = uniqueValues.size;

    if (uniqueCount === data.length) {
      return false;
    }

    if (uniqueCount < Math.min(data.length / 2, 20)) {
      return true;
    }

    if (typeof data[0][field] === 'number') {
      return true;
    }

    return false;
  });

  return fieldsToGraph;
};


// Manejo de selección de archivo
const handleFileSelect = async (event) => {
  const file = event.target.files[0];

  if (!file) {
    alert('No se ha seleccionado ningún archivo.');
    return;
  }

  const fileExtension = file.name.split('.').pop().toLowerCase();

  if (fileExtension === 'json' || fileExtension === 'parquet') {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        selectedData = data;

        // Analizar y depurar los campos
        availableFields = analyzeDataForGraphing(data);
        updateSelectOptions();
      } else {
        throw new Error('Error al cargar el archivo.');
      }
    } catch (error) {
      console.error('Error al procesar los datos:', error);
      alert('Hubo un problema al cargar el archivo.');
    }
  } else {
    alert('Solo se permiten archivos JSON o Parquet.');
  }
};

// Actualizar las opciones del select con campos gráficables
const updateSelectOptions = () => {
  const xFieldSelect = document.getElementById('x-field-select');
  const yFieldSelect = document.getElementById('y-field-select');
  xFieldSelect.innerHTML = '';
  yFieldSelect.innerHTML = '';

  availableFields.forEach(field => {
    const optionX = document.createElement('option');
    optionX.value = field;
    optionX.textContent = field;
    xFieldSelect.appendChild(optionX);

    const optionY = document.createElement('option');
    optionY.value = field;
    optionY.textContent = field;
    yFieldSelect.appendChild(optionY);
  });

  xFieldSelect.disabled = false;
  yFieldSelect.disabled = false;
};

// Actualizar las opciones del tipo de gráfica
const enableChartTypeSelect = () => {
  const chartTypeSelect = document.getElementById('chart-type-select');
  chartTypeSelect.disabled = false;
};

// Manejo de cambio en el campo seleccionado
document.getElementById('x-field-select').addEventListener('change', (event) => {
  const selectedXField = event.target.value;
  console.log('Campo X seleccionado:', selectedXField);  // Verifica el valor
  if (selectedXField && selectedYField) {
    enableChartTypeSelect();
    renderChart(selectedXField, selectedYField); // Llama a la función de renderizado
  }
});

document.getElementById('y-field-select').addEventListener('change', (event) => {
  const selectedYField = event.target.value;
  console.log('Campo Y seleccionado:', selectedYField);  // Verifica el valor
  if (selectedXField && selectedYField) {
    enableChartTypeSelect();
    renderChart(selectedXField, selectedYField); // Llama a la función de renderizado
  }
});

function renderChart(xField, yField) {
  // Obtén los datos para las gráficas basados en xField y yField
  const data = fetchData(xField, yField); // Esta función debe obtener los datos filtrados

  const chartDom = document.getElementById('chart'); // El ID de tu contenedor de la gráfica
  const myChart = echarts.init(chartDom);

  const option = {
    xAxis: {
      type: 'category',
      data: data.map(item => item[xField]) // Asume que data es un arreglo de objetos
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.map(item => item[yField]),
      type: 'line' // O el tipo de gráfico que desees
    }]
  };

  myChart.setOption(option);
}


// Manejo de cambio en el tipo de gráfica seleccionado
document.getElementById('chart-type-select').addEventListener('change', (event) => {
  const selectedChartType = event.target.value;
  const selectedField = document.getElementById('data-select').value;

  if (selectedField && selectedChartType) {
    updateCharts(selectedField, selectedChartType);
  }
});

// Actualizar las gráficas según el campo y tipo seleccionados
document.getElementById('x-field-select').addEventListener('change', () => {
  updateCharts();
});

document.getElementById('y-field-select').addEventListener('change', () => {
  updateCharts();
});

const updateCharts = () => {
  const xField = document.getElementById('x-field-select').value;
  const yField = document.getElementById('y-field-select').value;
  const selectedChartType = document.getElementById('chart-type-select').value;

  if (xField && yField && selectedChartType) {
    const chartFunctions = {
      scatter: getOptionScatter,
      line: getOptionChart2,
      bar: getOptionChart,
      stackedBar: getOptionStackedBarChart,
      stackedLine: getOptionStackedLineChart
    };

    const chartOptionFunction = chartFunctions[selectedChartType];
    
    if (chartOptionFunction) {
      // Verifica si 'chart1' está disponible en el HTML
      const chartContainer = document.getElementById('chart1');
      if (chartContainer) {
        const chart1 = echarts.init(chartContainer);
        chart1.setOption(chartOptionFunction(selectedData, xField, yField));
      } else {
        console.error('El contenedor de gráfico con ID "chart1" no existe');
      }
    } else {
      console.error('No se ha encontrado una función de gráfico válida para el tipo seleccionado');
    }
  } else {
    console.log('Faltan campos seleccionados: asegúrate de elegir los campos X, Y y tipo de gráfico');
  }
};


// Funciones auxiliares para determinar el tipo de campo
const isCategorical = (data, field) => {
  const uniqueValues = new Set(data.map(item => item[field]));
  return uniqueValues.size < Math.min(data.length / 2, 20); // Máximo 20 valores únicos.
};

const isNumerical = (data, field) => {
  return typeof data[0][field] === "number";
};

const generateGraphs = (data, graphableCombinations) => {
  const container = document.getElementById("graph-container");
  container.innerHTML = ""; // Limpiar contenedor de gráficos previos.

  graphableCombinations.forEach((graph, index) => {
    const chartDiv = document.createElement("div");
    chartDiv.id = `chart-${index}`;
    chartDiv.style.width = "600px";
    chartDiv.style.height = "400px";
    container.appendChild(chartDiv);

    const chart = echarts.init(chartDiv);

    const option = createChartOption(graph, data);
    chart.setOption(option);
  });
};

const createChartOption = (graph, data) => {
  const { type, xField, yField, description } = graph;

  const xData = data.map(item => item[xField]);
  const yData = data.map(item => item[yField]);

  return {
    title: {
      text: description,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: type === "scatter" ? "value" : "category",
      data: type !== "scatter" ? xData : undefined,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: description,
        type: type,
        data: type === "scatter" ? data.map(item => [item[xField], item[yField]]) : yData,
      },
    ],
  };
};

// Funciones para las opciones de gráficos
const getOptionChart = (data, field) => {
  const options = [...new Set(data.map(item => item[field]))];
  const info = options.map(option => data.filter(item => item[field] === option).length);

  return {
    title: { text: `Gráfico de Barras: ${field}` },
    tooltip: {},
    xAxis: { type: 'category', data: options },
    yAxis: { type: 'value' },
    series: [{ data: info, type: 'bar' }]
  };
};

const getOptionChart2 = (data, field) => {
  const options = [...new Set(data.map(item => item[field]))];
  const info = options.map(option => data.filter(item => item[field] === option).length);

  return {
    title: { text: `Gráfico de Líneas: ${field}` },
    tooltip: {},
    xAxis: { type: 'category', data: options },
    yAxis: { type: 'value' },
    series: [{ data: info, type: 'line' }]
  };
};


const getOptionBoxPlot = (data) => {
  const xField = availableFields[0];
  const yField = availableFields[1];

  const xData = data.map(item => item[xField]);
  const yData = data.map(item => item[yField]);

  return {
    title: { text: 'Gráfico de Caja' },
    tooltip: {},
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value' },
    series: [{ data: yData, type: 'boxplot' }]
  };
};

const getOptionDonut = (data, field) => {
  const options = [...new Set(data.map(item => item[field]))];
  const info = options.map(option => data.filter(item => item[field] === option).length);

  return {
    title: { text: `Gráfico de Dona: ${field}` },
    tooltip: {},
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: options.map((option, index) => ({
        name: option,
        value: info[index]
      }))
    }]
  };
};

// Gráfico de dispersión con X e Y seleccionados
const getOptionScatter = (data, xField, yField) => {
  const xData = data.map(item => item[xField]);
  const yData = data.map(item => item[yField]);

  return {
    title: { text: 'Gráfico de Dispersión' },
    tooltip: {},
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value' },
    series: [{
      data: xData.map((x, idx) => [x, yData[idx]]),
      type: 'scatter'
    }]
  };
};

// Gráfico de barras apiladas
const getOptionStackedBarChart = (data, xField, yField) => {
  const categories = [...new Set(data.map(item => item[xField]))];
  const seriesData = categories.map(category => {
    return data.filter(item => item[xField] === category).map(item => item[yField]);
  });

  return {
    title: { text: 'Gráfico de Barras Apiladas' },
    tooltip: {},
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: seriesData.map((data, idx) => ({
      name: categories[idx],
      type: 'bar',
      stack: 'total',
      data: data
    }))
  };
};


// Función para gráfico de radar
const getOptionRadarChart = (data) => {
  const fields = availableFields.slice(0, 6); 
  const values = fields.map(field => data.map(item => item[field]));

  return {
    title: { text: 'Gráfico de Radar' },
    tooltip: {},
    radar: {
      indicator: fields.map(field => ({ name: field, max: Math.max(...values.flat()) }))
    },
    series: [{
      type: 'radar',
      data: [{
        value: values.map(value => Math.mean(value)),
        name: 'Promedio'
      }]
    }]
  };
};


// Función para gráfico de mapa (ejemplo básico)
const getOptionGeoMap = (data) => {
  const locations = [...new Set(data.map(item => item['Ubicación']))];
  const values = locations.map(location => data.filter(item => item['Ubicación'] === location).length);

  return {
    title: { text: 'Distribución Geoespacial' },
    tooltip: {},
    geo: {
      map: 'world', // Mapa global por defecto, puede ajustarse según los datos
      roam: true
    },
    series: [{
      name: 'Ubicación',
      type: 'map',
      mapType: 'world',
      label: { show: true },
      data: locations.map((location, index) => ({
        name: location,
        value: values[index]
      }))
    }]
  };
};



document.getElementById('file-input').addEventListener('change', handleFileSelect);
