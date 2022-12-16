import express from 'express';

const app = express();
app.get('/thinas', (request, response) => {
  return response.json([
    { name: 'Thinas', age: 18 },
    { name: 'Tais', age: 18 },
    { name: 'Mel', age: 14 },
    { name: 'Tapioca', age: 5 },
  ]);
});

app.listen(3000);
