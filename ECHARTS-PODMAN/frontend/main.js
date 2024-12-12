let selectedData = [];
let availableFields = [];
let selectedFields = [];
let selectEjeX = [];
let selectEjeY = [];
let graphMode = 'select';

const analyzeDataForGraphing = (data) => {
  if (!data) {
    console.error('Los datos no están definidos.');
    return [];
  }

  if (!Array.isArray(data) && typeof data !== 'object') {
    console.error('Los datos no son un arreglo ni un objeto.');
    return [];
  }
  const dataArray = Array.isArray(data) ? data : [data];

  const hasNodesAndLinks = dataArray.some(item => item.hasOwnProperty('nodes') || item.hasOwnProperty('links'));

  if (hasNodesAndLinks) {
    const nodes = dataArray.flatMap(item => Array.isArray(item.nodes) ? item.nodes : []);
    const links = dataArray.flatMap(item => Array.isArray(item.links) ? item.links : []);

    if (!nodes.length && !links.length) {
      console.error("No se encontraron 'nodes' ni 'links' válidos.");
      return [];
    }

    console.log("Datos de nodes:", nodes);
    console.log("Datos de links:", links);

    const extractNestedFields = (obj, prefix = '') => {
      const fields = [];
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          fields.push(...extractNestedFields(obj[key], `${prefix}${key}.`));
        } else {
          fields.push(`${prefix}${key}`);
        }
      }
      return fields;
    };

    const otherFields = dataArray.flatMap(item => extractNestedFields(item));

    return [...new Set([...otherFields, ...nodes, ...links])];
  } else {
    const extractNestedFields = (obj, prefix = '') => {
      const fields = [];
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            fields.push(...extractNestedFields(obj[key], `${prefix}${key}.`));
          } else {
            fields.push(`${prefix}${key}`);
          }
        }
      }
      return fields;
    };

    // Extraemos campos anidados sin 'nodes' ni 'links'
    const otherFields = dataArray.flatMap(item => extractNestedFields(item));
    const uniqueFields = [...new Set(otherFields)];
    return uniqueFields;
  }
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert('No se ha seleccionado ningún archivo.');
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

    console.log("Datos cargados:", data); // Ver los datos que llegan del backend

    // Inspeccionar los datos completos para ver cómo están estructurados
    if (data) {
      console.log("Estructura completa de los datos:", data);

      // Verificar si 'links' y 'nodes' existen en los datos
      const hasLinks = Array.isArray(data.links);
      const hasNodes = Array.isArray(data.nodes);

      if (hasLinks || hasNodes) {
        console.log("Se encontraron 'links' y/o 'nodes' en los datos.");
      } else {
        console.warn("No se encontraron 'links' ni 'nodes'. Procesando otros datos...");
      }

      selectedData = data;
      availableFields = analyzeDataForGraphing(data);
      updateFieldChecklist();
      document.getElementById('chart-type-select').disabled = false;
    } else {
      console.error("Los datos recibidos están vacíos o son nulos.");
      alert('Los datos no se recibieron correctamente.');
    }
  } catch (error) {
    console.error('Error al procesar los datos:', error);
    alert('Hubo un problema al cargar el archivo.');
  }
};

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

  console.log("Campos seleccionados:", selectedFields); // Agrega esta línea para depurar
  renderChart(document.getElementById('chart-type-select').value); // Actualizar gráfica
};

const renderChart = (chartType) => {
  // Validación de campos seleccionados y datos cargados
  console.log("Modo de gráfico:", graphMode);
  if (graphMode === 'select' && selectedFields.length === 0) {
    alert('Selecciona campos antes de graficar.');
    return;
  }

  if (selectedData.length === 0) {
    alert('Carga un archivo antes de graficar.');
    return;
  }

  const fields = graphMode === 'select' ? selectedFields : availableFields;
  if (fields.length === 0) {
    alert('No hay campos disponibles para graficar.');
    return;
  }
  // Inicialización del gráfico
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
    case 'radar':
      option = getOptionRadarChart(selectedData);
      break;
    case 'graph':
      renderGraph();
      return; // Salir después de renderizar Les Misérables
    default:
      alert('Selecciona un tipo de gráfica válido.');
      return;
  }

  // Personalización de opciones comunes
  option.toolbox = {
    feature: {
      restore: { title: 'Restaurar' },
      saveAsImage: { title: 'Guardar como imagen', type: 'png' },
      dataView: { title: 'Visualizar datos', lang: ['Vista de Datos', 'Cerrar', 'Actualizar'], readOnly: true },
    },
  };
  option.selectedMode = 'single';

  // Manejo de eventos de selección
  myChart.on('select', (params) => {
    const selectedOption = document.getElementById('edit-options').value;

    if (selectedOption !== 'color') {
      console.log('La edición de color no está activa. Ignorando la selección de punto.');
      return;
    }

    console.log('Evento de selección detectado', params);
    const { seriesIndex, dataIndexInside } = params;

    if (seriesIndex !== undefined && dataIndexInside !== undefined) {
      const selectedItem = myChart.getOption().series[seriesIndex].data[dataIndexInside];
      if (selectedItem) {
        const currentColor = selectedItem.itemStyle?.color || '#FF5733';
        document.getElementById('new-color').value = currentColor;
        document.getElementById('color-edit').style.display = 'block';
        const dropdown = document.getElementById('point-select');
        dropdown.innerHTML = '';
        myChart.getOption().series[seriesIndex].data.forEach((item, index) => {
          const option = document.createElement('option');
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

  // Agregar ícono de edición
  const editIconWrapper = document.createElement('div');
  editIconWrapper.style.position = 'absolute';
  editIconWrapper.style.top = '30px';
  editIconWrapper.style.right = '5px';
  editIconWrapper.style.cursor = 'pointer';

  const editIcon = document.createElement('i');
  editIcon.className = 'fas fa-edit';
  editIcon.style.color = 'gray';

  const tooltip = document.createElement('span');
  tooltip.textContent = 'Editar';
  tooltip.style.position = 'absolute';
  tooltip.style.color = '#61e4e6';
  tooltip.style.backgroundColor = 'white';
  tooltip.style.padding = '5px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '12px';
  tooltip.style.whiteSpace = 'nowrap';
  tooltip.style.top = '15px';
  tooltip.style.right = '0';
  tooltip.style.visibility = 'hidden';
  tooltip.style.opacity = '0';
  tooltip.style.transition = 'visibility 0s, opacity 0.3s ease-in-out';

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


document.getElementById('chart-type-select').addEventListener('change', () => {
  const chartType = document.getElementById('chart-type-select').value;
  renderChart(chartType);
});

// Cambio entre los modos de graficar
document.getElementById('graph-mode').addEventListener('change', (event) => {
  graphMode = event.target.value;
  if (graphMode === 'all') {
    document.getElementById('field-checklist-container').style.display = 'none';
  } else {
    document.getElementById('field-checklist-container').style.display = 'block';
  }
  renderChart(document.getElementById('chart-type-select').value); // Refrescar gráfica con el nuevo modo
});



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

document.getElementById('chart-type-select').addEventListener('change', () => {
  const chartType = document.getElementById('chart-type-select').value;
  renderChart(chartType);
});

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

const renderGraph = () => {
  // Verifica los datos cargados
  console.log('Datos seleccionados:', selectedData);

  if (!selectedData || !selectedData.nodes || !selectedData.links) {
    alert('El archivo JSON debe contener los campos "nodes" y "links" para crear el grafo.');
    return;
  }

  const chartDom = document.getElementById('chart1');
  const myChart = echarts.init(chartDom);

  const option = {
    title: {
      text: 'Grafo',
      subtext: 'Ejemplo de red en ECharts',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        if (params.dataType === 'node') {
          return `${params.data.name}<br>Valor: ${params.data.value}`;
        } else if (params.dataType === 'edge') {
          return `Conexión<br>Valor: ${params.data.value}`;
        }
        return '';
      }
    },
    legend: [{
      data: ['Nodos'],
      left: 'left'
    }],
    series: [{
      type: 'graph',
      layout: 'force',
      force: {
        edgeLength: 50,
        repulsion: 100,
        gravity: 0.1
      },
      data: selectedData.nodes.map(node => ({
        id: node.id,
        name: node.name,
        value: node.value,
        symbolSize: Math.sqrt(node.value) * 5,
        itemStyle: {
          color: node.color || '#5470C6'
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{b}'
        },
        emphasis: {
          itemStyle: {
            color: '#ff6347',  // Color al hacer hover sobre el nodo
            borderWidth: 2,
            borderColor: '#ff6347'
          },
          label: {
            show: true,
            color: '#ff6347'  // Color de la etiqueta cuando se hace hover sobre el nodo
          }
        }
      })),
      links: selectedData.links.map(link => ({
        source: link.source,
        target: link.target,
        value: link.value,
        lineStyle: {
          color: 'source',
          curveness: 0.3
        },
        emphasis: {
          lineStyle: {
            color: '#ff6347',  // Resalta la línea en rojo cuando se pasa el cursor
            width: 5
          }
        }
      })),
      roam: true
    }]
  };

  myChart.setOption(option);
};



document.getElementById('file-input').addEventListener('change', handleFileSelect);