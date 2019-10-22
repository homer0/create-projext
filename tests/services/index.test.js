const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services');

require('jasmine-expect');

const services = require('/src/services');
const { cli } = require('/src/services/cli');
const { generator } = require('/src/services/generator');
const { questions } = require('/src/services/questions');
const { repository } = require('/src/services/repository');
const { utils } = require('/src/services/utils');

describe('services', () => {
  beforeEach(() => {
    JimpleMock.reset();
  });

  it('should register all the services', () => {
    // Given
    const container = {
      register: jest.fn(),
    };
    const expectedRegisterCalls = [
      cli,
      generator,
      questions,
      repository,
      utils,
    ];
    // When
    services(container);
    // Then
    expect(container.register).toHaveBeenCalledTimes(expectedRegisterCalls.length);
    expectedRegisterCalls.forEach((call) => {
      expect(container.register).toHaveBeenCalledWith(call);
    });
  });
});
