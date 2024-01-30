import express from 'express';

const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send('welcome to TraverseBE');
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}...`);
});

export default app;
