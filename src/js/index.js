const express = require('express'),
      app = express();

app.use(express.static('/dist'));

app.get('/', (req, res) => {
 res.send('Working');
})

app.listen(3000, () => console.log(`Listening on port 3000`));