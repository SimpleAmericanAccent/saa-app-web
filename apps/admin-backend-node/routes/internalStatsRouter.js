// tbd
import express from "express";
import https from "https";

const cache = {
  data: [],
  lastFetched: null,
};

function isDataInCache(startDate, endDate) {
  return (
    cache.data.length > 0 &&
    new Date(cache.lastFetched) > new Date() - 1000 * 60 * 5 && // Check if the data was fetched in the last 5 minutes
    cache.data.some((record) => {
      // Check if the requested range is already in the cache
      const recordDate = record.fields.Date; // Assuming the date field is named 'Date' in Airtable
      return recordDate >= startDate && recordDate <= endDate; // Check if the record date is within the requested range
    })
  );
}

const internalStatsRouter = express.Router();

internalStatsRouter.get("/loadrange", async (req, res) => {
  const airtableOps = req.app.locals.airtableOps;
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).send("Start and end dates are required.");
  }

  // Check if requested range is already in the cache
  if (isDataInCache(start, end)) {
    console.log("Serving from cache");
    const filteredData = cache.data.filter((record) => {
      const recordDate = record.fields.Date;
      return recordDate >= start && recordDate <= end;
    });
    return res.json(filteredData);
  }

  console.log("Fetching from Airtable");

  try {
    let allRecords = await airtableOps.fetchAirtableRecords("Days"); // Fetch all records from Airtable and store them in allRecords array

    // Filter records by date range
    const filteredData = allRecords.filter((record) => {
      const recordDate = record.fields.Date;
      return recordDate >= start && recordDate <= end;
    });

    // Update cache
    cache.data = allRecords; // Store all records in cache
    cache.lastFetched = new Date().toISOString(); // Update the last fetched time

    res.json(filteredData); // Send the filtered data to the client
  } catch (e) {
    console.error(`Error fetching data: ${e.message}`);
    res.status(500).send("Error fetching data from Airtable");
  }
});

export default internalStatsRouter;
