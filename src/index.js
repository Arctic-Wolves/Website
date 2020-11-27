const server = require('./server');
const khloe = require('./worker');

const port = process.env.PORT || 7777;

server.listen(port, () => console.log(`Listening on port: ${port}`));
khloe.run();
