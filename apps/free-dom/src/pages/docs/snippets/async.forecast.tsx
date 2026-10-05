import { Await, signal } from '@reely/dommy';

interface Forecast {
  city: string;
  celsius: number;
}

const loadForecast = (city: string): Promise<Forecast> =>
  fetch(`/api/forecast?city=${encodeURIComponent(city)}`).then((response) =>
    response.json()
  );

const city = signal('Lisbon');

// A resource: the getter reads `city`, so a new city loads again, and a late answer for the old one is dropped.
export const Weather = (): Node => (
  <section>
    <select onChange={(event) => city.set(event.currentTarget.value)}>
      <option>Lisbon</option>
      <option>Oslo</option>
      <option>Nairobi</option>
    </select>
    <Await
      promise={() => loadForecast(city.value)}
      fallback={() => <p>Loading {city}…</p>}
      catch={(error) => (
        <p>
          {city} did not load: {error.message}
        </p>
      )}
    >
      {(forecast) => (
        <p>
          {forecast.city}: {forecast.celsius} °C
        </p>
      )}
    </Await>
  </section>
);
