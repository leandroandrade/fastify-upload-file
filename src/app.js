const fastify = require('fastify');
const multipart = require('@fastify/multipart');
const fs = require('fs');
const path = require('path');
const {pipeline} = require('stream/promises');

const pathUploadDir = path.join(__dirname, '..', 'uploads');

function buildApp() {
    const app = fastify({
        logger: true
    });
    app.register(multipart);

    app.get('/upload-single', async function (request, reply) {
        reply.type('text/html');
        return reply.send(
            '<div style="display: flex; justify-content: center">'
            + '<form action="/upload-single" method="post" enctype="multipart/form-data">'
            + '<input type="text" name="firstname" placeholder="firstname" />'
            + '<input type="text" name="lastname" placeholder="lastname" />'
            + '<input type="file" name="file" />'
            + '<input type="submit" value="Upload" />'
            + '</form></div>',
        );
    });

    app.post('/upload-single', async function (request, reply) {
        const data = await request.file();

        const {fieldname, filename, mimetype, file, fields} = data;
        const {firstname, lastname} = fields;

        const uploadDir = fs.createWriteStream(`${pathUploadDir}/${filename}`);
        await pipeline(file, uploadDir);
        return reply.send({
            message: 'File uploaded sucessfully!',
            fieldname,
            filename,
            mimetype,
            firstname: firstname.value,
            lastname: lastname.value
        })
    });

    app.get('/upload-multiple', async function (request, reply) {
        reply.type('text/html');
        return reply.send(
            '<div style="display: flex; justify-content: center">'
            + '<form action="/upload-multiple" method="post" enctype="multipart/form-data">'
            + '<label for="files">Select files:</label>'
            + '<input type="file" id="files" name="files" multiple><br><br>'
            + '<input type="submit" value="Upload" />'
            + '</form></div>',
        );
    });

    app.post('/upload-multiple', async function (request, reply) {
        const parts = await request.parts();

        const uploaded = [];
        for await (const data of parts) {
            if (!data.file) {
                uploaded.push(data.value);
            } else {
                const {filename, file} = data;
                const uploadDir = fs.createWriteStream(`${pathUploadDir}/${filename}`);
                await pipeline(file, uploadDir);

                uploaded.push(filename);
            }
        }
        return reply.send({
            message: 'Files uploaded sucessfully!',
            uploaded
        })
    });
    return app;
}

module.exports = buildApp;
