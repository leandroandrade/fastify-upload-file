const server = require('./app')();

server.listen({port: 3000})
    .then(() => console.log('Server running at 3000'))
    .catch(console.error);
