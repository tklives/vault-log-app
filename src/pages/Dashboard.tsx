import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';
import { Meet } from '../types/sync'; // if Meet is typed there

export default function Dashboard() {
  const [upcomingMeets, setUpcomingMeets] = useState<Meet[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeets = async () => {
      const allMeets = await db.meets.orderBy('date').toArray();
      const today = new Date().toISOString().split('T')[0];

      const nextMeets = allMeets
        .filter(meet => meet.date >= today)
        .slice(0, 3);

      setUpcomingMeets(nextMeets);
    };

    fetchMeets();
  }, []);


    return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div>
        <h2 className="text-xl font-semibold">Next 3ish Meets</h2>
        {upcomingMeets.length === 0 ? (
          <p className="text-zinc-500">No upcoming meets scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {upcomingMeets.map(meet => (
              <li
                key={meet.id}
                onClick={() => navigate(`/meet/${meet.id}`)}
                className="cursor-pointer p-2 border rounded hover:bg-zinc-100"
              >
                <div className="font-medium">{meet.name}</div>
                <div className="text-sm text-zinc-500">
                  {new Date(meet.date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
