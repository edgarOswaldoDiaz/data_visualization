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