const mocks = {
  spawn: jest.fn(),
  once: jest.fn(),
  kill: jest.fn(),
};

class SpawnMock {
  static mock(name, mock) {
    mocks[name] = mock;
  }

  static reset() {
    Object.keys(mocks).forEach((name) => {
      mocks[name].mockReset();
    });
  }

  static spawn(...args) {
    mocks.spawn(...args);
    return mocks;
  }

  static get mocks() {
    return mocks;
  }
}

module.exports = SpawnMock;
