import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { withLoadingAndErrorHandling } from './withLoadingAndErrorHandling.js';

chai.use(sinonChai);
const { expect } = chai;

class Dummy extends withLoadingAndErrorHandling() {}

describe('withLoading', () => {
  describe('#requestSingle()', () => {
    let dummy;

    beforeEach(() => {
      dummy = new Dummy();
      dummy.startLoading = sinon.spy();
      dummy.dispatchEventAndMethod = sinon.spy();
      dummy.finishLoading = sinon.spy();
    });

    afterEach(() => {
      dummy.startLoading = null;
      dummy.dispatchEventAndMethod = null;
      dummy.finishLoading = null;
      dummy = null;
    });

    it('Should call this.startLoading.', () => {
      dummy.requestSingle(Promise.resolve());
      expect(dummy.startLoading).to.have.been.calledOnce;
    });

    it('Should react to request success.', async () => {
      const responseData = 'myData';
      const response = await dummy.requestSingle(Promise.resolve(responseData));

      expect(response).to.equal(responseData);

      expect(dummy.dispatchEventAndMethod)
        .to.have.been.calledWith('requestsuccess');

      expect(dummy.dispatchEventAndMethod)
        .to.have.been.calledBefore(dummy.finishLoading);
    });

    it('Should react to request error.', async () => {
      const reponseError = 'myError';

      try {
        await dummy.requestSingle(Promise.reject(reponseError));

        expect(dummy.dispatchEventAndMethod)
          .to.have.been.calledWith('requesterror', {
            unhandledError: reponseError,
          });

        expect(dummy.dispatchEventAndMethod)
          .to.have.been.calledBefore(dummy.finishLoading);

        expect(dummy.requestErrors).to.deep.equal([reponseError]);
      } catch (err) {
        expect(err).to.equal(reponseError);
      }
    });
  });

  describe('#startLoading()', () => {
    let dummy;

    beforeEach(() => {
      dummy = new Dummy();
      dummy.dispatchEventAndMethod = sinon.spy();
    });

    afterEach(() => {
      dummy.dispatchEventAndMethod = null;
      dummy = null;
    });

    it('Should dispatch event if this.loading is zero.', () => {
      dummy.loading = 0;
      dummy.startLoading();

      expect(dummy.dispatchEventAndMethod)
        .to.have.been.calledWith('startloading');
    });

    it('Should not dispatch event if this.loading is more than zero.', () => {
      dummy.loading = 5;
      dummy.startLoading();
      expect(dummy.dispatchEventAndMethod).not.to.have.been.called;
    });

    it('Should increment this.loading.', () => {
      dummy.loading = 0;
      dummy.startLoading();
      expect(dummy.loading).to.equal(1);
    });

    it('Should update this.isLoading.', () => {
      dummy.isLoading = false;
      dummy.loading = 0;
      dummy.startLoading();
      expect(dummy.isLoading).to.be.true;
    });
  });

  describe('#finishLoading()', () => {
    let dummy;

    beforeEach(() => {
      dummy = new Dummy();
      dummy.dispatchEventAndMethod = sinon.spy();
    });

    afterEach(() => {
      dummy.dispatchEventAndMethod = null;
      dummy = null;
    });

    it('Should decrement this.loading.', () => {
      dummy.loading = 1;
      dummy.finishLoading();
      expect(dummy.loading).to.equal(0);
    });

    it('Should update this.isLoading.', () => {
      dummy.isLoading = true;
      dummy.loading = 1;
      dummy.finishLoading();
      expect(dummy.isLoading).to.be.false;
    });

    it('Should dispatch event if this.loading is zero.', () => {
      dummy.loading = 1;
      dummy.finishLoading();
      expect(dummy.loading).to.equal(0);

      expect(dummy.dispatchEventAndMethod)
        .to.have.been.calledWith('finishloading');
    });

    it('Should not dispatch event if this.loading is more than zero.', () => {
      dummy.loading = 5;
      dummy.finishLoading();
      expect(dummy.loading).to.equal(4);
      expect(dummy.dispatchEventAndMethod).not.to.have.been.called;
    });
  });

  describe('#request()', () => {
    let dummy;

    beforeEach(() => {
      dummy = new Dummy();
      dummy.requestSingle = sinon.spy();
    });

    afterEach(() => {
      dummy.requestSingle = null;
      dummy = null;
    });

    it('Should handle a single request.', () => {
      const singleRequest = Promise.resolve();
      dummy.request(singleRequest);

      expect(dummy.requestSingle).to.have.been.calledOnce;
      expect(dummy.requestSingle).to.always.have.been.calledWith(singleRequest);
    });

    it('Should handle many requests.', () => {
      const singleRequest = Promise.resolve();
      const manyRequests = [singleRequest, singleRequest, singleRequest];
      dummy.request(manyRequests);

      expect(dummy.requestSingle).to.have.been.calledThrice;
      expect(dummy.requestSingle).to.always.have.been.calledWith(singleRequest);
    });

    it('Should correctly bind this.', () => {
      dummy.requestSingle = function named() {
        return this;
      };

      expect(dummy.request()).to.equal(dummy);
    });
  });
});
