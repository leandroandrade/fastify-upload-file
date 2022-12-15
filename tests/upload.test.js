const t = require('tap');
const formAutoContent = require('form-auto-content');
const fs = require('fs');
const path = require('path');

const app = require('../src/app');

const {test} = t;

test('should upload a single file', async t => {
    const fastify = app();

    t.teardown(async () => {
        await fastify.close();
    });

    const form = formAutoContent({
        firstname: 'Foo',
        lastname: 'Bar',
        file: fs.createReadStream(path.join(__dirname, 'assets', 'fastify.pdf'))
    });

    const res = await fastify.inject({
        method: 'POST',
        url: '/upload-single',
        ...form
    });

    t.same(res.statusCode, 200);
    t.same(res.json(), {
        message: "File uploaded sucessfully!",
        fieldname: "file",
        filename: "fastify.pdf",
        mimetype: "application/pdf",
        firstname: "Foo",
        lastname: "Bar"
    })
});

test('should upload multiple files', async t => {
    const fastify = app();

    t.teardown(async () => {
        await fastify.close();
    });

    const form = formAutoContent({
        firstname: 'Foo',
        lastname: 'Bar',
        files: [
            fs.createReadStream(path.join(__dirname, 'assets', 'fastify.pdf')),
            fs.createReadStream(path.join(__dirname, 'assets', 'fastify-logo.png')),
        ]
    });

    const res = await fastify.inject({
        method: 'POST',
        url: '/upload-multiple',
        ...form
    });

    t.same(res.statusCode, 200);
    t.same(res.json(), {
        message: "Files uploaded sucessfully!",
        uploaded: [
            'Foo',
            'Bar',
            "fastify.pdf",
            "fastify-logo.png"
        ]
    });
});

test('should return form upload single file', async t => {
    const fastify = app();

    t.teardown(async () => {
        await fastify.close();
    });

    const res = await fastify.inject({
        method: 'GET',
        url: '/upload-single',
    });

    t.same(res.statusCode, 200);
    t.same(res.body, '' +
        '<div style="display: flex; justify-content: center">' +
        '<form action="/upload-single" method="post" enctype="multipart/form-data">' +
        '<input type="text" name="firstname" placeholder="firstname" />' +
        '<input type="text" name="lastname" placeholder="lastname" />' +
        '<input type="file" name="file" />' +
        '<input type="submit" value="Upload" />' +
        '</form>' +
        '</div>');
});

test('should return form upload miltiple file', async t => {
    const fastify = app();

    t.teardown(async () => {
        await fastify.close();
    });

    const res = await fastify.inject({
        method: 'GET',
        url: '/upload-multiple',
    });

    t.same(res.statusCode, 200);
    t.same(res.body, '' +
        '<div style=\"display: flex; justify-content: center\">' +
        '<form action=\"/upload-multiple\" method=\"post\" enctype=\"multipart/form-data\">' +
        '<label for=\"files\">Select files:</label>' +
        '<input type=\"file\" id=\"files\" name=\"files\" multiple><br><br>' +
        '<input type=\"submit\" value=\"Upload\" />' +
        '</form>' +
        '</div>');
});
