const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('node-fetch');
jest.unmock('/src/services/repository');

require('jasmine-expect');

const { Repository, repository } = require('/src/services/repository');
const fetch = require('node-fetch');

describe('service:Repository', () => {
  beforeEach(() => {
    JimpleMock.reset();
    fetch.mockClear();
  });

  it('should be instantiated and have the repository URL', () => {
    // Given
    const info = {
      repository: 'homer0/create-projext',
    };
    let sut = null;
    // When
    sut = new Repository(info, 'localManifest');
    // Then
    expect(sut).toBeInstanceOf(Repository);
    expect(sut.url).toBe(`https://github.com/${info.repository}`);
  });

  describe('getManifest', () => {
    it('should download the manifest from the repository', () => {
      // Given
      const info = {
        repository: 'homer0/create-projext',
      };
      const manifest = 'Hello manifest!';
      const response = {
        json: jest.fn(() => Promise.resolve(manifest)),
      };
      fetch.mockImplementationOnce(() => Promise.resolve(response));
      let sut = null;
      // When
      sut = new Repository(info);
      return sut.getManifest()
      .then((result) => {
        // Then
        expect(result).toBe(manifest);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          `https://raw.githubusercontent.com/${info.repository}/master/manifest.json`
        );
        expect(response.json).toHaveBeenCalledTimes(1);
      });
    });

    it('should return the local manifest', () => {
      // Given
      const info = {
        repository: 'homer0/create-projext',
      };
      const localManifest = 'Hello local manifest!';
      let sut = null;
      // When
      sut = new Repository(info, localManifest);
      return sut.getManifest(true)
      .then((result) => {
        // Then
        expect(result).toBe(localManifest);
        expect(fetch).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('provider', () => {
    it('should include a provider for the DIC', () => {
      // Given
      let sut = null;
      const container = {
        set: jest.fn(),
        get: jest.fn((service) => service),
      };
      let serviceName = null;
      let serviceFn = null;
      const expectedGets = ['info', 'localManifest'];
      // When
      repository(container);
      [[serviceName, serviceFn]] = container.set.mock.calls;
      sut = serviceFn();
      // Then
      expect(serviceName).toBe('repository');
      expect(serviceFn).toBeFunction();
      expect(sut).toBeInstanceOf(Repository);
      expect(container.set).toHaveBeenCalledTimes(1);
      expect(container.set).toHaveBeenCalledWith('repository', expect.any(Function));
      expect(container.get).toHaveBeenCalledTimes(expectedGets.length);
      expectedGets.forEach((service) => {
        expect(container.get).toHaveBeenCalledWith(service);
      });
    });
  });
});
