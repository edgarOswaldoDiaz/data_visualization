

let selectedData = []; // Variable para almacenar los datos del archivo seleccionado
let availableFields = []; // Almacenar los campos disponibles del archivo cargado

const handleFileSelect = async (event) => {
  const file = event.target.files[0]; // Obtener el primer archivo seleccionado

  if (!file) {
    alert('No se ha seleccionado ningún archivo');
    return;
  }

  const fileExtension = file.name.split('.').pop().toLowerCase();

  if (fileExtension === 'json' || fileExtension === 'parquet') {
    const formData = new FormData();
    formData.append('file', file); // Agregar el archivo al FormData

    try {
      // Realizar el fetch al backend para cargar el archivo
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json(); // Obtener los datos en formato JSON
        selectedData = data; // Almacenar los datos
        availableFields = Object.keys(data[0] || {}); // Obtener las claves de los datos como opciones
        updateSelectOptions();
      } else {
        throw new Error('Error al cargar el archivo');
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      alert('Hubo un problema al cargar el archivo.');
    }
  } else {
    alert('Solo se permiten archivos JSON o Parquet');
  }
};
document.getElementById('file-input').addEventListener('change', handleFileSelect);

const updateSelectOptions = () => {
  const selectElement = document.getElementById('data-select');
  selectElement.innerHTML = ''; // Limpiar las opciones existentes

  // Añadir las nuevas opciones basadas en los campos del archivo
  availableFields.forEach(field => {
    const option = document.createElement('option');
    option.value = field;
    option.textContent = field;
    selectElement.appendChild(option);
  });

  // Activar el select ahora que hay opciones disponibles
  selectElement.disabled = false;
};

document.getElementById('data-select').addEventListener('change', (event) => {
  const selectedField = event.target.value; // Obtener el campo seleccionado por el usuario
  updateCharts(selectedField); // Actualizar las gráficas con el campo seleccionado
});

const updateCharts = (selectedField) => {
  const { options, info } = countApartmentsBySelection(selectedData, selectedField);
  
  // Llamar a las funciones para actualizar los gráficos con los nuevos datos
  if (options.length && info.length) {
    const chart1 = echarts.init(document.getElementById('chart1'));
    chart1.setOption(getOptionChart(options, info));

    const chart2 = echarts.init(document.getElementById('chart2'));
    chart2.setOption(getOptionChart2(options, info));

    const chart3 = echarts.init(document.getElementById('chart3'));
    chart3.setOption(getOptionScatterByLocation(selectedData));

    const chart4 = echarts.init(document.getElementById('chart4'));
    chart4.setOption(getOptionBoxPlotByLocation(selectedData));

    const chart5 = echarts.init(document.getElementById('chart5'));
    chart5.setOption(getOptionDonutByLocation(options, info));
  } else {
    alert('No hay datos válidos para mostrar en los gráficos.');
  }
};

// Función para contar apartamentos según el campo seleccionado
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

// Funciones para las opciones de gráficos (ya definidas anteriormente)
const getOptionChart = (options, info) => {
  return {
    title: { text: 'Gráfico 1: Relación de Datos' },
    tooltip: {},
    xAxis: { type: 'category', data: options },
    yAxis: { type: 'value' },
    series: [{ data: info, type: 'bar' }]
  };
};

const getOptionChart2 = (options, info) => {
  return {
    title: { text: 'Gráfico 2: Distribución de Datos' },
    tooltip: {},
    xAxis: { type: 'category', data: options },
    yAxis: { type: 'value' },
    series: [{ data: info, type: 'line' }]
  };
};

const getOptionScatterByLocation = (data) => {
  const locations = [...new Set(data.map(item => item.ubicacion))];
  const prices = locations.map(location => data.filter(item => item.ubicacion === location).map(item => item.precio));

  return {
    title: { text: 'Gráfico de Dispersión por Ubicación' },
    tooltip: {},
    xAxis: { type: 'category', data: locations },
    yAxis: { type: 'value' },
    series: [{ data: prices.flat(), type: 'scatter' }] // Usamos flat() para que los precios sean un array plano
  };
};

const getOptionBoxPlotByLocation = (data) => {
  const locations = [...new Set(data.map(item => item.ubicacion))];
  const prices = locations.map(location => data.filter(item => item.ubicacion === location).map(item => item.precio));

  return {
    title: { text: 'Gráfico de Caja por Ubicación' },
    tooltip: {},
    xAxis: { type: 'category', data: locations },
    yAxis: { type: 'value' },
    series: [{ data: prices, type: 'boxplot' }]
  };
};

const getOptionDonutByLocation = (options, info) => {
  return {
    title: { text: 'Gráfico de Dona por Ubicación' },
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
