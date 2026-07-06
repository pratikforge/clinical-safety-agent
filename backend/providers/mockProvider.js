async function createMockProvider(response = { alerts: [] }) {
  return {
    async completeJson() {
      return response;
    }
  };
}

module.exports = { createMockProvider };
