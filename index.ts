import express from 'express';
import path from 'path';

import double from './helpers/double';

const PORT = process.env.PORT || 5001;
const server = express();

express()
  .use(express.static(path.join(__dirname, '../public')))
  .set('views', path.join(__dirname, '../views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/:data', (req, res) => {
    const data = double(req.params.data);
    res.render('pages/result', {data});
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
