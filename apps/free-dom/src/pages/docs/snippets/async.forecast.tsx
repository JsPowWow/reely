import { Await, signal } from '@reely/dommy';

interface LapResult {
  lap: number;
  leader: string;
}

const loadLap = (lap: number): Promise<LapResult> => fetch(`/api/laps/${lap}`).then((response) => response.json());

const lap = signal(1);

// A resource: the getter reads `lap`, so a new lap loads again, and a late answer for an old lap is dropped.
export const LapLeader = (): Node => (
  <section>
    <button onClick={() => (lap.value += 1)}>Next lap</button>
    <Await
      promise={() => loadLap(lap.value)}
      fallback={() => <p>Loading lap {lap}…</p>}
      catch={(error) => <p>Lap {lap} did not load: {error.message}</p>}
    >
      {(result) => (
        <p>
          Lap {result.lap}: {result.leader} leads
        </p>
      )}
    </Await>
  </section>
);
