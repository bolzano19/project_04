import './styles.css';
document.addEventListener("DOMContentLoaded", async function () {
  const url = 'http://localhost:3000/stations';

  async function getStations() {
    try {
      const response = await fetch(url, {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stations: ${response.status} ${response.statusText}`);
      }

      const stations = await response.json();
      return stations;
    } catch (error) {
      console.error('Error fetching stations:', error);
      throw error;
    }
  }

  async function getMetrics(stationId) {
    try {
      const urlMetrics = `${url}/${stationId}/metrics`;
      const response = await fetch(urlMetrics, {
        method: "GET"
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics for station ${stationId}: ${response.status} ${response.statusText}`);
      }

      const metrics = await response.json();
      return metrics;
    } catch (error) {
      console.error(`Error fetching metrics for station ${stationId}:`, error);
      throw error;
    }
  }

  async function deleteStation(stationId) {
    try {
      const urlId = `${url}/${stationId}`;
      const response = await fetch(urlId, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`Failed to delete station ${stationId}: ${response.status} ${response.statusText}`);
      }

      console.log(`Station ${stationId} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting station ${stationId}:`, error);
      throw error;
    }
  }

  async function addStation(stationData) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(stationData)
      });

      if (!response.ok) {
        throw new Error(`Failed to add station: ${response.status} ${response.statusText}`);
      }

      console.log("Station added successfully.");
    } catch (error) {
      console.error("Error adding station:", error);
      throw error;
    }
  }

  async function metricUpdate(st, nSt, delBut) {
    const intervalId = setInterval(async () => {
      try {
        const metrics = await getMetrics(st.id);
        const metricsString = `Temperature: ${metrics.temperature}, Dose rate: ${metrics.dose_rate}, Humidity: ${metrics.humidity}`;
        nSt.innerText = `${st.id} ${st.address}. ${metricsString}`;
        nSt.appendChild(delBut);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        clearInterval(intervalId);
      }
    }, 1000);
  }

  async function formationMetricsStation(st, stUL) {
    const newStation = document.createElement("li");
    const deleteButton = document.createElement("button");

    deleteButton.innerText = "Delete";
    metricUpdate(st, newStation, deleteButton);

    deleteButton.addEventListener("click", async function () {
      await deleteStation(st.id);
      await refreshStations();
      clearInterval(intervalId);
    });

    stUL.appendChild(newStation);
    console.log(`Station №${st.id} is active`);
  }

  async function refreshStations() {
    try {
      const stations = await getStations();
      const messageP = document.getElementById("empty_message");
      const stationUL = document.getElementById("stations");
      stationUL.innerHTML = "";
      let hasActiveStations = false;
      for (let station of stations) {
        if (station.status) {
          formationMetricsStation(station, stationUL);
          hasActiveStations = true;
        }
      }
      messageP.innerText = hasActiveStations ? "UPDATED" : "NO ACTIVE STATIONS";

    } catch (error) {
      console.error('Error refreshing stations:', error);
    }
  }

  async function handleAddStation() {
    const address = prompt("Enter station address:");
    if (address) {
      try {
        await addStation({ address: address, status: true });
        await refreshStations();
      } catch (error) {
        console.error('Error handling add station:', error);
      }
    }
  }

  document.getElementById("refreshButton").addEventListener("click", refreshStations);
  document.getElementById("add_station_btn").addEventListener("click", handleAddStation);
  window.onload = refreshStations;
});
