import sinon from 'sinon';
import { expect, server, BASE_URL } from './setup';
import models from '../src/data/models';

describe('video store integration tests', function descTest() {
  this.timeout(35000);
  before('beforeAll', async () => {
    await models.sequelize.sync({ force: true });
  });
  afterEach(() => {
    sinon.restore();
  });

  it('should add film to inventory', (done) => {
    server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'matrix',
        type: 'New releases'
      })
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.id).to.be.a('number');
        expect(res.body.beenRented).to.equal(false);
        done();
      });
  });

  it('should fail on duplicate entry', (done) => {
    server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'matrix',
        type: 'New releases'
      })
      .end((err, res) => {
        expect(res.status).to.equal(500);
        expect(res.body.errorCode).to.equal('DB_ERROR');
        done();
      });
  });

  it('addFilm should fail on unknown error', (done) => {
    sinon.stub(models, 'Film').returns(undefined);
    server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'matrix',
        type: 'New releases'
      })
      .end((err, res) => {
        expect(res.status).to.equal(500);
        expect(res.body.errorCode).to.equal('GENERIC_ERROR');
        done();
      });
  });

  it('should fail on invalid type', (done) => {
    server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'matrix',
        type: 'New'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('should fail on short name', (done) => {
    server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'm',
        type: 'New releases'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('should update film type', (done) => {
    server
      .patch(`${BASE_URL}/films/1`)
      .send({
        type: 'Old films'
      })
      .end((err, res) => {
        expect(res.status).to.equal(204);
        done();
      });
  });

  it('should fail for invalid type update', (done) => {
    server
      .patch(`${BASE_URL}/films/1`)
      .send({
        type: 'Old releases'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('should fail for invalid id', (done) => {
    server
      .patch(`${BASE_URL}/films/a`)
      .send({
        type: 'Old films'
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('should fail when id doesnot exist', (done) => {
    server
      .patch(`${BASE_URL}/films/2`)
      .send({
        type: 'Old films'
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
  });

  it('should fail on db failure', (done) => {
    sinon.stub(models.Film, 'update').rejects();
    server
      .patch(`${BASE_URL}/films/2`)
      .send({
        type: 'Old films'
      })
      .end((err, res) => {
        expect(res.status).to.equal(500);
        expect(res.body.errorCode).to.equal('DB_ERROR');
        done();
      });
  });

  it('should fail on unknown error', (done) => {
    sinon.stub(models, 'Film').returns(undefined);
    server
      .patch(`${BASE_URL}/films/2`)
      .send({
        type: 'Old films'
      })
      .end((err, res) => {
        expect(res.status).to.equal(500);
        expect(res.body.errorCode).to.equal('GENERIC_ERROR');
        done();
      });
  });

  it('gets film', (done) => {
    server
      .get(`${BASE_URL}/films/`)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.films[0].beenRented).to.equal(false);
        done();
      });
  });

  it('gets available films', (done) => {
    server
      .get(`${BASE_URL}/films?status=available`)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.films[0].beenRented).to.equal(false);
        done();
      });
  });

  it('getFilms fails for invalid status', (done) => {
    server
      .get(`${BASE_URL}/films?status=avail`)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('getFilms fails for db failure', (done) => {
    sinon.stub(models.Film, 'findAll').rejects();
    server
      .get(`${BASE_URL}/films?status=available`)
      .end((err, res) => {
        expect(res.status).to.equal(500);
        expect(res.body.errorCode).to.equal('DB_ERROR');
        done();
      });
  });

  it('getFilms fails for unknown error', (done) => {
    sinon.stub(models, 'Film').returns(undefined);
    server
      .get(`${BASE_URL}/films?status=available`)
      .end((err, res) => {
        expect(res.status).to.equal(500);
        expect(res.body.errorCode).to.equal('GENERIC_ERROR');
        done();
      });
  });

  it('return price for film of Type New releases', (done) => {
    server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'Matrix II',
        type: 'New releases'
      })
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.id).to.be.a('number');
        server
          .get(`${BASE_URL}/films/${res.body.id}/price?days=5`)
          .end((error, resp) => {
            expect(resp.status).to.equal(200);
            expect(resp.body.price).to.equal(200);
            done();
          });
      });
  });

  it('return price for film of Type Old films', (done) => {
    server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'John Rambo',
        type: 'Old films'
      })
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.id).to.be.a('number');
        server
          .get(`${BASE_URL}/films/${res.body.id}/price?days=5`)
          .end((error, resp) => {
            expect(resp.status).to.equal(200);
            expect(resp.body.price).to.equal(30);
            done();
          });
      });
  });

  it('return price for film of Type Old films', (done) => {
    server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'Rocky',
        type: 'Regular films'
      })
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.id).to.be.a('number');
        server
          .get(`${BASE_URL}/films/${res.body.id}/price?days=5`)
          .end((error, resp) => {
            expect(resp.status).to.equal(200);
            expect(resp.body.price).to.equal(90);
            done();
          });
      });
  });

  it('fails for non existing film id', (done) => {
    server
      .get(`${BASE_URL}/films/303/price?days=5`)
      .end((error, resp) => {
        expect(resp.status).to.equal(404);
        expect(resp.body.errorCode).to.equal('RESOURCE_NOT_FOUND');
        done();
      });
  });

  it('getPrice fails for error in db', (done) => {
    sinon.stub(models.Film, 'findByPk').rejects();
    server
      .get(`${BASE_URL}/films/303/price?days=5`)
      .end((error, resp) => {
        expect(resp.status).to.equal(500);
        expect(resp.body.errorCode).to.equal('DB_ERROR');
        done();
      });
  });

  it('getPrice fails on unknown error', (done) => {
    sinon.stub(models, 'Film').returns(undefined);
    server
      .get(`${BASE_URL}/films/303/price?days=5`)
      .end((error, resp) => {
        expect(resp.status).to.equal(500);
        expect(resp.body.errorCode).to.equal('GENERIC_ERROR');
        done();
      });
  });

  it('removes film from inventory', (done) => {
    server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'Titanic',
        type: 'Regular films'
      })
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.id).to.be.a('number');
        server
          .delete(`${BASE_URL}/films/${res.body.id}`)
          .end((error, resp) => {
            expect(resp.status).to.equal(204);
            server
              .delete(`${BASE_URL}/films/${res.body.id}`)
              .end((secondError, secondResp) => {
                expect(secondResp.status).to.equal(404);
                done();
              });
          });
      });
  });

  it('error on missing id', (done) => {
    server
      .delete(`${BASE_URL}/films/s`)
      .end((secondError, secondResp) => {
        expect(secondResp.status).to.equal(400);
        done();
      });
  });

  it('error on db error', (done) => {
    sinon.stub(models.Film, 'destroy').rejects();
    server
      .delete(`${BASE_URL}/films/1`)
      .end((error, resp) => {
        expect(resp.status).to.equal(500);
        expect(resp.body.errorCode).to.equal('DB_ERROR');
        done();
      });
  });

  it('removeFilm errors on db error', (done) => {
    sinon.stub(models, 'Film').returns(undefined);
    server
      .delete(`${BASE_URL}/films/1`)
      .end((error, resp) => {
        expect(resp.status).to.equal(500);
        expect(resp.body.errorCode).to.equal('GENERIC_ERROR');
        done();
      });
  });

  it('should place order successfully for new film', async () => {
    const addFilmRes = await server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'Spider Man',
        type: 'New releases'
      });
    expect(addFilmRes.status).to.equal(201);
    expect(addFilmRes.body.id).to.be.a('number');
    const orderRes = await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'janedoe',
        filmId: addFilmRes.body.id,
        numOfDays: 4
      });
    expect(orderRes.status).to.equal(200);
    expect(orderRes.body.pointsUsed).to.equal(0);
    expect(orderRes.body.pointsRemaining).to.equal(2);
    expect(orderRes.body.paidAmount).to.equal('160.00');
  });

  it('should place order successfully for old films', async () => {
    const addFilmRes = await server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'Godfather',
        type: 'Old films'
      });
    expect(addFilmRes.status).to.equal(201);
    expect(addFilmRes.body.id).to.be.a('number');
    const orderRes = await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'rosstay',
        filmId: addFilmRes.body.id,
        numOfDays: 6
      });
    expect(orderRes.status).to.equal(200);
    expect(orderRes.body.pointsUsed).to.equal(0);
    expect(orderRes.body.pointsRemaining).to.equal(1);
    expect(orderRes.body.paidAmount).to.equal('60.00');
  });

  it('should place order successfully for regular films', async () => {
    const addFilmRes = await server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'Godfather II',
        type: 'Regular films'
      });
    expect(addFilmRes.status).to.equal(201);
    expect(addFilmRes.body.id).to.be.a('number');
    const orderRes = await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'coppola',
        filmId: addFilmRes.body.id,
        numOfDays: 5
      });
    expect(orderRes.status).to.equal(200);
    expect(orderRes.body.pointsUsed).to.equal(0);
    expect(orderRes.body.pointsRemaining).to.equal(1);
    expect(orderRes.body.paidAmount).to.equal('90.00');
  });

  it('placeOrder should return error on db error', async () => {
    sinon.stub(models.Film, 'findOne').rejects();
    const addFilmRes = await server
      .post(`${BASE_URL}/films/`)
      .send({
        name: 'Godfather III',
        type: 'Regular films'
      });
    expect(addFilmRes.status).to.equal(201);
    expect(addFilmRes.body.id).to.be.a('number');
    const orderRes = await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'coppola',
        filmId: addFilmRes.body.id,
        numOfDays: 5
      });
    expect(orderRes.status).to.equal(500);
    expect(orderRes.body.errorCode).to.equal('DB_ERROR');
  });

  it('placeOrder should return error on unknown error', async () => {
    sinon.stub(models, 'Film').returns(undefined);
    const orderRes = await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'coppola',
        filmId: 2,
        numOfDays: 5
      });
    expect(orderRes.status).to.equal(500);
    expect(orderRes.body.errorCode).to.equal('GENERIC_ERROR');
  });

  it('should return error on film not found', async () => {
    const orderRes = await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: 400,
        numOfDays: 5
      });
    expect(orderRes.status).to.equal(404);
  });

  it('should partially pay by bonus points', async () => {
    const promises = [];
    for (let i = 0; i < 15; i += 1) {
      promises.push(server
        .post(`${BASE_URL}/films/`)
        .send({
          name: `Star wars ${i + 1}`,
          type: 'New releases'
        }));
    }
    const results = await Promise.all(promises);

    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[0].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[1].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[2].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[3].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[4].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[5].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[6].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[7].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[8].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[9].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[10].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[11].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[12].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });

    const finalRes = await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'jamesfranco',
        filmId: results[13].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    expect(finalRes.status).to.equal(200);
    expect(finalRes.body.pointsUsed).to.equal(25);
    expect(finalRes.body.pointsRemaining).to.equal(3);
    expect(finalRes.body.paidAmount).to.equal('80.00');
  });

  it('should fully pay by bonus points', async () => {
    const promises = [];
    for (let i = 0; i < 15; i += 1) {
      promises.push(server
        .post(`${BASE_URL}/films/`)
        .send({
          name: `webseries ${i + 1}`,
          type: 'New releases'
        }));
    }
    const results = await Promise.all(promises);

    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[0].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[1].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[2].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[3].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[4].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[5].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[6].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[7].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[8].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[9].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[10].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[11].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });
    await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[12].body.id,
        numOfDays: 3,
        useBonuspoints: true
      });

    const finalRes = await server
      .post(`${BASE_URL}/orders/`)
      .send({
        username: 'peterpan',
        filmId: results[13].body.id,
        numOfDays: 1,
        useBonuspoints: true
      });
    expect(finalRes.status).to.equal(200);
    expect(finalRes.body.pointsUsed).to.equal(25);
    expect(finalRes.body.pointsRemaining).to.equal(3);
    expect(finalRes.body.paidAmount).to.equal('0.00');
  });

  it('should return bonuspoints for customer', async () => {
    const res = await server
      .get(`${BASE_URL}/customers/coppola`);

    expect(res.status).to.equal(200);
  });

  it('should send 500 status on error', async () => {
    sinon.stub(models, 'Customer').returns(undefined);
    const res = await server
      .get(`${BASE_URL}/customers/coppola`);

    expect(res.status).to.equal(500);
    expect(res.body.errorCode).to.equal('GENERIC_ERROR');
  });

  it('should error when customer not found', async () => {
    const res = await server
      .get(`${BASE_URL}/customers/copooola`);

    expect(res.status).to.equal(404);
  });

  it('/customers should error on db fail', async () => {
    sinon.stub(models.Customer, 'findAll').rejects();
    const res = await server
      .get(`${BASE_URL}/customers/copooola`);

    expect(res.status).to.equal(500);
    expect(res.body.errorCode).to.equal('DB_ERROR');
  });

  it('active films should error on Customer.findOne fail', async () => {
    sinon.stub(models.Customer, 'findOne').rejects();
    const res = await server
      .get(`${BASE_URL}/films/active?username=unknown`);

    expect(res.status).to.equal(500);
    expect(res.body.errorCode).to.equal('GENERIC_ERROR');
  });

  it('active films should error on Film.findAll fail', async () => {
    sinon.stub(models.Film, 'findAll').rejects();
    const res = await server
      .get(`${BASE_URL}/films/active`);

    expect(res.status).to.equal(500);
    expect(res.body.errorCode).to.equal('DB_ERROR');
  });

  it('active films should return empty when user doesnot exist', async () => {
    const res = await server
      .get(`${BASE_URL}/films/active?username=unknown`);

    expect(res.status).to.equal(200);
    expect(res.body.total).to.equal(0);
  });

  it('should return active films for user', async () => {
    const res = await server
      .get(`${BASE_URL}/films/active?username=coppola`);
    console.log(res.body);
    expect(res.status).to.equal(200);
  });

  it('should return all active films', async () => {
    const res = await server
      .get(`${BASE_URL}/films/active`);
    expect(res.status).to.equal(200);
  });
});
