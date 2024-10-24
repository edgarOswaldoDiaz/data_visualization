fetch('http://localhost:5000/apartamentos', {
    method: 'GET',
    mode: 'cors'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('CORS Error:', error));
  