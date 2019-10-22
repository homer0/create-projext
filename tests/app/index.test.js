const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/app/index');

require('jasmine-expect');

const CreateProjext = require('/src/app');
const packageInfo = require('../../package.json');
const localManifest = require('../../manifest.json');

describe('app:CreateProjext', () => {
  beforeEach(() => {
    JimpleMock.reset();
  });

  it('should add the error handler when instantiated', () => {
    // Given
    let sut = null;
    const listenErrors = jest.fn();
    const get = jest.fn(() => ({
      listen: listenErrors,
    }));
    JimpleMock.mock('get', get);
    // When
    sut = new CreateProjext();
    // Then
    expect(sut).toBeInstanceOf(CreateProjext);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('errorHandler');
    expect(listenErrors).toHaveBeenCalledTimes(1);
  });

  it('should register the package.json as \'info\' when instantiated', () => {
    // Given
    let sut = null;
    let infoServiceName = null;
    let infoServiceFn = null;
    const listenErrors = jest.fn();
    const get = jest.fn(() => ({
      listen: listenErrors,
    }));
    JimpleMock.mock('get', get);
    const set = jest.fn();
    JimpleMock.mock('set', set);
    // When
    sut = new CreateProjext();
    [[infoServiceName, infoServiceFn]] = set.mock.calls;
    // Then
    expect(sut).toBeInstanceOf(CreateProjext);
    expect(listenErrors).toHaveBeenCalledTimes(1);
    expect(infoServiceName).toBe('info');
    expect(infoServiceFn()).toEqual(packageInfo);
  });

  it('should register the manifest.json as \'localManifest\' when instantiated', () => {
    // Given
    let sut = null;
    let infoServiceName = null;
    let infoServiceFn = null;
    const listenErrors = jest.fn();
    const get = jest.fn(() => ({
      listen: listenErrors,
    }));
    JimpleMock.mock('get', get);
    const set = jest.fn();
    JimpleMock.mock('set', set);
    // When
    sut = new CreateProjext();
    [, [infoServiceName, infoServiceFn]] = set.mock.calls;
    // Then
    expect(sut).toBeInstanceOf(CreateProjext);
    expect(listenErrors).toHaveBeenCalledTimes(1);
    expect(infoServiceName).toBe('localManifest');
    expect(infoServiceFn()).toEqual(localManifest);
  });

  it('should start the CLI the interface', () => {
    // Given
    let sut = null;
    const listenErrors = jest.fn();
    const runCLI = jest.fn();
    const get = jest.fn(() => ({
      listen: listenErrors,
      run: runCLI,
    }));
    JimpleMock.mock('get', get);
    // When
    sut = new CreateProjext();
    sut.start();
    // Then
    expect(sut).toBeInstanceOf(CreateProjext);
    expect(listenErrors).toHaveBeenCalledTimes(1);
    expect(runCLI).toHaveBeenCalledTimes(1);
  });
});
