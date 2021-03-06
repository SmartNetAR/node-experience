import {InversifyExpressServer} from 'inversify-express-utils';
import supertest from 'supertest';
import initTestServer from '../../initTestServer';
import {ICreateConnection} from '@digichanges/shared-experience';
import {ILoginResponse} from '../../Shared/InterfaceAdapters/Tests/ILogin';
import {IItemResponse, IListItemsResponse} from './types';

describe('Start Item Test', () =>
{
    let server: InversifyExpressServer;
    let request: supertest.SuperTest<supertest.Test>;
    let dbConnection: ICreateConnection;
    let token: string = null;
    let itemId = '';
    let deleteResponse: any = null;

    beforeAll(async(done) =>
    {
        const configServer = await initTestServer();

        server = configServer.server;
        request = configServer.request;
        dbConnection = configServer.dbConnection;

        done();
    });

    afterAll((async(done) =>
    {
        await dbConnection.drop();
        await dbConnection.close();

        done();
    }));

    describe('Item Success', () =>
    {
        beforeAll(async(done) =>
        {
            const payload = {
                email: 'user@node.com',
                password: '12345678'
            };

            const response: ILoginResponse = await request
                .post('/api/auth/login?provider=local')
                .set('Accept', 'application/json')
                .send(payload);

            const {body: {data}} = response;

            token = data.token;

            done();
        });

        test('Add Item /items', async done =>
        {
            const payload = {
                name: 'Item 1',
                type: 10
            };

            const response: IItemResponse = await request
                .post('/api/items')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            const {body: {status, statusCode, data}} = response;

            expect(response.statusCode).toStrictEqual(201);
            expect(status).toStrictEqual('success');
            expect(statusCode).toStrictEqual('HTTP_CREATED');

            expect(data.name).toStrictEqual(payload.name);
            expect(data.type).toStrictEqual(payload.type);
            itemId = data.id;

            done();
        });

        test('Get Item /items/:id', async done =>
        {

            const payload = {
                name: 'Item 1',
                type: 10
            };

            const response: IItemResponse = await request
                .get(`/api/items/${itemId}`)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            const {body: {status, statusCode, data}} = response;

            expect(response.statusCode).toStrictEqual(200);
            expect(status).toStrictEqual('success');
            expect(statusCode).toStrictEqual('HTTP_OK');

            expect(data.name).toStrictEqual(payload.name);
            expect(data.type).toStrictEqual(payload.type);

            done();
        });

        test('Update Item /items/:id', async done =>
        {
            const payload = {
                name: 'Item 1 update',
                type: 11
            };

            const response: IItemResponse = await request
                .put(`/api/items/${itemId}`)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            const {body: {status, statusCode, data}} = response;

            expect(response.statusCode).toStrictEqual(201);
            expect(status).toStrictEqual('success');
            expect(statusCode).toStrictEqual('HTTP_CREATED');

            expect(data.name).toStrictEqual(payload.name);
            expect(data.type).toStrictEqual(payload.type);

            done();
        });

        test('Delete Item /items/:id', async done =>
        {
            const payload = {
                name: 'Item 13 for delete',
                type: 13
            };

            const createResponse: IItemResponse = await request
                .post('/api/items')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            deleteResponse = await request
                .delete(`/api/items/${createResponse.body.data.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${createResponse.body.metadata.refreshToken}`)
                .send();

            const {body: {status, statusCode, data}} = deleteResponse;

            expect(deleteResponse.statusCode).toStrictEqual(200);
            expect(status).toStrictEqual('success');
            expect(statusCode).toStrictEqual('HTTP_OK');

            expect(data.name).toStrictEqual(payload.name);
            expect(data.type).toStrictEqual(payload.type);

            done();
        });

        test('Get Items /items', async done =>
        {

            const response: IListItemsResponse = await request
                .get('/api/items?pagination[limit]=5&pagination[offset]=0')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            const {body: {status, statusCode, data, pagination}} = response;

            expect(response.statusCode).toStrictEqual(200);
            expect(status).toStrictEqual('success');
            expect(statusCode).toStrictEqual('HTTP_OK');

            expect(data.length).toStrictEqual(5);
            expect(pagination.total).toStrictEqual(5);
            expect(pagination.currentUrl).toContain('/api/items?pagination[limit]=5&pagination[offset]=0');
            expect(pagination.nextUrl).toContain('/api/items?pagination[limit]=5&pagination[offset]=5');

            done();
        });

        test('Get Items /items without pagination', async done =>
        {

            const response: IListItemsResponse = await request
                .get('/api/items')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            const {body: {status, statusCode, data, pagination}} = response;

            expect(response.statusCode).toStrictEqual(200);
            expect(status).toStrictEqual('success');
            expect(statusCode).toStrictEqual('HTTP_OK');

            expect(data.length).toStrictEqual(11);
            expect(pagination).not.toBeDefined();

            done();
        });

        test('Get Items /items with Filter Type', async done =>
        {

            const response: IListItemsResponse = await request
                .get('/api/items?pagination[limit]=20&pagination[offset]=0&filter[type]=11')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            const {body: {status, statusCode, data, pagination}} = response;

            expect(response.statusCode).toStrictEqual(200);
            expect(status).toStrictEqual('success');
            expect(statusCode).toStrictEqual('HTTP_OK');

            expect(data.length).toStrictEqual(1);
            expect(pagination.total).toStrictEqual(1);

            expect(data[0].type).toStrictEqual(11);

            done();
        });

        test('Get Items /items with Sort Desc Type', async done =>
        {

            const response: IListItemsResponse = await request
                .get('/api/items?pagination[limit]=20&pagination[offset]=0&sort[type]=desc')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            const {body: {status, statusCode, data: [item1, item2]}} = response;

            expect(response.statusCode).toStrictEqual(200);
            expect(status).toStrictEqual('success');
            expect(statusCode).toStrictEqual('HTTP_OK');

            expect(item1.type).toBeGreaterThanOrEqual(item2.type);

            done();
        });
    });

    describe('Item Fails', () =>
    {
        beforeAll(async(done) =>
        {
            const payload = {
                email: 'user@node.com',
                password: '12345678'
            };

            const response: ILoginResponse = await request
                .post('/api/auth/login?provider=local')
                .set('Accept', 'application/json')
                .send(payload);

            const {body: {data}} = response;

            token = data.token;

            done();
        });

        test('Add Item /items', async done =>
        {
            const payload = {
                name: 'Item 2',
                type: 'Item 1'
            };

            const response: IItemResponse = await request
                .post('/api/items')
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            const {body: {status, statusCode, message, errors: [error]}} = response;

            expect(response.statusCode).toStrictEqual(422);
            expect(status).toStrictEqual('error');
            expect(statusCode).toStrictEqual('HTTP_UNPROCESSABLE_ENTITY');
            expect(message).toStrictEqual('Failed Request.');

            expect(error.property).toStrictEqual('type');
            expect(error.constraints.isInt).toStrictEqual('type must be an integer number');

            done();
        });

        test('Get Item /items/:id', async done =>
        {

            const response: IItemResponse = await request
                .get(`/api/items/${itemId}dasdasda123`)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            const {body: {status, statusCode, message, errors: [error]}} = response;

            expect(response.statusCode).toStrictEqual(422);
            expect(status).toStrictEqual('error');
            expect(statusCode).toStrictEqual('HTTP_UNPROCESSABLE_ENTITY');
            expect(message).toStrictEqual('Failed Request.');

            expect(error.property).toStrictEqual('id');
            expect(error.constraints.isUuid).toBeDefined();
            expect(error.constraints.isUuid).toStrictEqual('id must be a UUID');

            done();
        });

        test('Update Item /items/:id', async done =>
        {
            const payload = {
                name: 11,
                type: 'asdasd'
            };

            const response: IItemResponse = await request
                .put(`/api/items/${itemId}`)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            const {body: {status, statusCode, message, errors: [errorName, errorType]}} = response;

            expect(response.statusCode).toStrictEqual(422);
            expect(status).toStrictEqual('error');
            expect(statusCode).toStrictEqual('HTTP_UNPROCESSABLE_ENTITY');
            expect(message).toStrictEqual('Failed Request.');

            expect(errorName.property).toStrictEqual('name');
            expect(errorName.constraints.isString).toBeDefined();
            expect(errorName.constraints.isString).toStrictEqual('name must be a string');

            expect(errorType.property).toStrictEqual('type');
            expect(errorType.constraints.isInt).toBeDefined();
            expect(errorType.constraints.isInt).toStrictEqual('type must be an integer number');

            done();
        });

        test('Delete Item error /items/:id', async done =>
        {

            const deleteErrorResponse: IItemResponse = await request
                .delete(`/api/items/${deleteResponse.body.data.id}`)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send();

            const {body: {status, statusCode, message}} = deleteErrorResponse;

            expect(deleteErrorResponse.statusCode).toStrictEqual(400);
            expect(status).toStrictEqual('error');
            expect(statusCode).toStrictEqual('HTTP_BAD_REQUEST');
            expect(message).toStrictEqual('Item not found.');

            done();
        });
    });
});

