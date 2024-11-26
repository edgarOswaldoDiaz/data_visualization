let selectedData = []; // Datos cargados del archivo
let availableFields = []; // Campos disponibles para graficar
let selectedFields = []; // Campos seleccionados para graficar

const analyzeDataForGraphing = (data) => {
  const fields = Object.keys(data[0] || {});
  return fields.filter((field) => {
    const uniqueValues = new Set(data.map(item => item[field]));
    const uniqueCount = uniqueValues.size;

    if (uniqueCount === data.length) return false; 
    if (typeof data[0][field] === 'number') return true; 
    if (uniqueCount < Math.min(data.length / 2, 20)) return true;
    return false;
  });
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert('No se ha seleccionado ningún archivo.');
    return;
  }

  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (fileExtension !== 'json' && fileExtension !== 'parquet') {
    alert('Solo se permiten archivos JSON o Parquet.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://127.0.0.1:5000/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Error al cargar el archivo.');
    const data = await response.json();
    selectedData = data;
    availableFields = analyzeDataForGraphing(data);
    updateFieldChecklist();
    document.getElementById('chart-type-select').disabled = false;
  } catch (error) {
    console.error('Error al procesar los datos:', error);
    alert('Hubo un problema al cargar el archivo.');
  }
};

// Manejar el cambio de opción en el menú de edición
document.getElementById("edit-options").addEventListener("change", (event) => {
  const selectedOption = event.target.value;

  if (selectedOption === "title") {
    document.getElementById("title-edit").style.display = "block";
    document.getElementById("color-edit").style.display = "none";
  } else if (selectedOption === "color") {
    document.getElementById("title-edit").style.display = "none";
    document.getElementById("color-edit").style.display = "block";
  }
});

function showEditForm(chartId) {
  const chart = echarts.getInstanceByDom(document.getElementById(chartId)); // Obtener instancia del gráfico
  const currentTitle = chart.getOption().title[0].text || ''; // Obtener título actual (manejar si está vacío)

  document.getElementById("chart-container").style.display = "block";

  document.getElementById("new-title").value = currentTitle;

  document.getElementById("edit-options").value = "title";
  document.getElementById("title-edit").style.display = "block";
  document.getElementById("color-edit").style.display = "none";

  window.currentChartId = chartId;
}

function saveChanges() {
  const selectedOption = document.getElementById("edit-options").value;
  const chart = echarts.getInstanceByDom(document.getElementById(window.currentChartId));

  if (selectedOption === "title") {
    const newTitle = document.getElementById("new-title").value; 
    chart.setOption({
      title: { text: newTitle }
    });
  } else if (selectedOption === "color") {
    const newColor = document.getElementById("new-color").value;
    const pointIndex = document.getElementById("point-select").value; 

    const series = chart.getOption().series;
    if (series && series[window.selectedSeriesIndex]) {
      const selectedPoint = series[window.selectedSeriesIndex].data[pointIndex];
      selectedPoint.itemStyle = selectedPoint.itemStyle || {};
      selectedPoint.itemStyle.color = newColor;
      chart.setOption({ series });
    }
  }
  closeEditForm();
}

function closeEditForm() {
  document.getElementById("chart-container").style.display = "none";
}



// Actualizar las opciones del checklist con campos gráficables
const updateFieldChecklist = () => {
  const fieldChecklist = document.getElementById('field-checklist');
  fieldChecklist.innerHTML = '';

  availableFields.forEach(field => {
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'form-check';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input';
    checkbox.id = `field-${field}`;
    checkbox.value = field;
    checkbox.addEventListener('change', handleFieldSelection);

    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.htmlFor = `field-${field}`;
    label.textContent = field;

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(label);
    fieldChecklist.appendChild(checkboxWrapper);
  });
};

const handleFieldSelection = (event) => {
  const field = event.target.value;
  if (event.target.checked) {
    selectedFields.push(field);
  } else {
    selectedFields = selectedFields.filter(f => f !== field);
  }
};

document.getElementById('chart-type-select').addEventListener('change', () => {
  const chartType = document.getElementById('chart-type-select').value;
  renderChart(chartType);
});


const renderChart = (chartType, fields = selectedFields) => {
  if (fields.length === 0 || selectedData.length === 0) {
    alert('Selecciona campos y un archivo antes de graficar.');
    return;
  }

  const chartDom = document.getElementById('chart1');
  const myChart = echarts.init(chartDom);

  let option;
  switch (chartType) {
    case 'bar':
      option = getOptionChart(selectedData, fields[0]);
      break;
    case 'line':
      option = getOptionChart2(selectedData, fields[0]);
      break;
    case 'scatter':
      option = getOptionScatter(selectedData, fields[0], fields[1]);
      break;
    case 'donut':
      option = getOptionDonut(selectedData, fields[0]);
      break;
    case 'boxplot':
      option = getOptionBoxPlot(selectedData);
      break;
    case 'stackedBar':
      option = getOptionStackedBarChart(selectedData, fields[0], fields[1]);
      break;
    case 'radar':
      option = getOptionRadarChart(selectedData);
      break;
    default:
      alert('Selecciona un tipo de gráfica válido.');
      return;
  }

  option.toolbox = {
    feature: {
      restore: {},
      saveAsImage: {},
      dataView: {}
    }
  };
  option.selectedMode = 'single'; 

  myChart.on('select', (params) => {
    const selectedOption = document.getElementById("edit-options").value;
  
    if (selectedOption !== "color") {
      console.log('La edición de color no está activa. Ignorando la selección de punto.');
      return;
    }
  
    console.log('Evento de selección detectado');
    console.log('Parámetros recibidos:', params);
  
    const seriesIndex = params.seriesIndex;
    const dataIndexInside = params.dataIndexInside;
  
    if (seriesIndex !== undefined && dataIndexInside !== undefined) {
      const selectedItem = myChart.getOption().series[seriesIndex].data[dataIndexInside];
  
      if (selectedItem) {
        console.log('Punto seleccionado:', selectedItem);
        const currentColor = selectedItem.itemStyle && selectedItem.itemStyle.color ? selectedItem.itemStyle.color : "#FF5733";
        console.log('Color actual del punto:', currentColor);
        document.getElementById("new-color").value = currentColor;
        document.getElementById("color-edit").style.display = "block";
        const dropdown = document.getElementById("point-select");
        dropdown.innerHTML = '';
        myChart.getOption().series[seriesIndex].data.forEach((item, index) => {
          const option = document.createElement("option");
          option.value = index;
          option.textContent = `Punto ${index + 1} (X: ${item.value[0]}, Y: ${item.value[1]})`;
          dropdown.appendChild(option);
        });
        window.selectedSeriesIndex = seriesIndex;
        window.selectedDataIndex = dataIndexInside;
        dropdown.value = dataIndexInside;
      } else {
        console.log('No se pudo encontrar el punto seleccionado.');
      }
    } else {
      console.log('Índice de serie o datos no válidos.');
    }
  });
 

  myChart.setOption(option);

  const editIconWrapper = document.createElement('div');
  editIconWrapper.style.position = 'absolute';
  editIconWrapper.style.top = '30px';
  editIconWrapper.style.right = '5px';
  editIconWrapper.style.cursor = 'pointer';
  
  const editIcon = document.createElement('i');
  editIcon.className = 'fas fa-edit';
  
  // Crear etiqueta flotante
  const tooltip = document.createElement('span');
  tooltip.textContent = 'Editar';
  tooltip.style.position = 'absolute';
  tooltip.style.color = 'blue';
  tooltip.style.padding = '5px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '12px';
  tooltip.style.whiteSpace = 'nowrap';
  tooltip.style.top = '15px';
  tooltip.style.right = '0';
  tooltip.style.visibility = 'hidden'; // Oculta inicialmente
  tooltip.style.opacity = '0';
  tooltip.style.transition = 'visibility 0s, opacity 0.3s';
  
  editIconWrapper.addEventListener('mouseenter', () => {
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
  });
  editIconWrapper.addEventListener('mouseleave', () => {
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
  });
  
  editIconWrapper.appendChild(editIcon);
  editIconWrapper.appendChild(tooltip);
  editIcon.addEventListener('click', () => {
    showEditForm(chartDom.id);
  });
  
  chartDom.appendChild(editIconWrapper);
  
};

const getOptionScatter = (data, xField, yField) => {
  const colorPalette = ['#5470C6', '#91CC75', '#EE6666', '#FAC858', '#73C0DE'];

  return {
    xAxis: { 
      type: 'value', 
      name: xField 
    },
    yAxis: { 
      type: 'value', 
      name: yField 
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const xVal = params.data[0];
        const yVal = params.data[1];
        return `${xField}: ${xVal}, ${yField}: ${yVal}`;
      }
    },
    series: [{
      type: 'scatter',
      data: data.map((item, index) => ({
        value: [item[xField], item[yField]], 
        itemStyle: { color: colorPalette[index % colorPalette.length] }
      })),
      encode: {
        x: 0, 
        y: 1, 
        tooltip: [0, 1],
      },
    }],
  };
};

const getOptionChart = (data, field) => {
  const options = [...new Set(data.map(item => item[field]))];
  const info = options.map(option => data.filter(item => item[field] === option).length);

  return {
    title: { text: `Gráfico de Barras: ${field}` },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params) {
        const category = params[0].name;
        const value = params[0].value;
        return `${category}: ${value} elementos`;
      }
    },
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
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      formatter: function (params) {
        const category = params[0].name;
        const value = params[0].value;
        return `${category}: ${value}`;
      }
    },
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
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const name = params.name;
        const value = params.value;
        return `${name}: ${value} elementos`;
      }
    },
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

// Gráfico de barras apiladas
const getOptionStackedBarChart = (data, xField, yField) => {
  const categories = [...new Set(data.map(item => item[xField]))];
  const seriesData = [...new Set(data.map(item => item[yField]))].map(y => {
    return {
      name: y,
      type: 'bar',
      stack: 'total',
      data: categories.map(c => data.filter(item => item[xField] === c && item[yField] === y).length),
    };
  });

  return {
    title: { text: `Gráfico de Barras Apiladas: ${xField}` },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params) {
        const category = params[0].name;
        const value = params.reduce((acc, item) => acc + item.value, 0);
        return `${category}: ${value}`;
      }
    },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: seriesData,
  };
};

const getOptionRadarChart = (data) => {
  const categories = Object.keys(data[0]);
  const values = categories.map(c => data.map(d => d[c]));

  return {
    title: { text: 'Gráfico Radar' },
    tooltip: {},
    radar: {
      indicator: categories.map(c => ({ name: c, max: 100 })),
    },
    series: [{
      type: 'radar',
      data: values.map(value => ({ value })),
    }],
  };
};

const getOptionGeoMap = (data) => {
  const locations = [...new Set(data.map(item => item['Ubicación']))];
  const values = locations.map(location => data.filter(item => item['Ubicación'] === location).length);

  return {
    title: { text: 'Distribución Geoespacial' },
    tooltip: {},
    geo: {
      map: 'world',
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
