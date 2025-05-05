export function createAirtableClient({ baseId, readKey, writeKey }) {
  /**
   * Fetches records from Airtable with support for pagination, filtering, and single record lookup
   * @param {string} tableName - Name of the table to fetch from
   * @param {Object} [options]
   * @param {string} [options.recordId] - Optional record ID for single record lookup
   * @param {string} [options.filterByFormula] - Optional Airtable formula for filtering records
   * @returns {Promise<Array|Object>} Returns array of records or single record object
   */
  async function fetchAirtableRecords(
    tableName,
    { recordId = null, filterByFormula = null } = {}
  ) {
    try {
      // Handle single record fetch
      if (recordId) {
        const path = `/v0/${baseId}/${tableName}/${recordId}`;
        const response = await fetch(`https://api.airtable.com${path}`, {
          headers: { Authorization: `Bearer ${readKey}` },
        });

        if (!response.ok) {
          throw new Error(`Airtable API request failed: ${response.status}`);
        }

        return await response.json();
      }

      // Handle paginated fetch
      let allRecords = [];
      let offset = null;
      do {
        // Build query parameters
        const params = new URLSearchParams();
        if (offset) {
          params.append("offset", offset);
        }

        if (filterByFormula) {
          params.append("filterByFormula", filterByFormula);
        }

        const queryString = params.toString();
        let path = `/v0/${baseId}/${tableName}${
          queryString ? "?" + queryString : ""
        }`;

        const response = await fetch(`https://api.airtable.com${path}`, {
          headers: { Authorization: `Bearer ${readKey}` },
        });

        if (!response.ok) {
          throw new Error(`Airtable API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.records) {
          throw new Error("Invalid response from Airtable");
        }

        allRecords.push(...data.records);
        offset = data.offset;
      } while (offset);

      return allRecords;
    } catch (error) {
      console.error("Airtable fetch error:", error);
      throw error;
    }
  }

  // Helper function to execute Airtable operations
  /**
   * Executes an Airtable operation with the specified method, path, and data
   * @param {Object} options - Options object containing method, path, and data
   * @param {string} options.method - HTTP method to use (e.g., 'GET', 'POST', 'PATCH')
   * @param {string} options.path - Airtable API path (e.g., 'Words%20(instance)', 'Words%20(instance)/123')
   * @param {Object} [options.data] - Data to include in the request body
   */
  async function executeAirtableOperation({ method, path, data = null }) {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${path}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${writeKey}`,
          "Content-Type": "application/json",
        },
        ...(data && { body: JSON.stringify(data) }),
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable request failed: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  }

  return {
    fetchAirtableRecords,
    executeAirtableOperation,
  };
}
