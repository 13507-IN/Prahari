import 'dotenv/config';
import { getDb, initDatabase } from '../src/db/index.js';
import { sql } from 'drizzle-orm';

async function main() {
  await initDatabase();
  const db = getDb();
  
  console.log("Updating reports latitude and longitude from location geometry...");
  
  await db.execute(sql`
    UPDATE reports 
    SET 
      longitude = ST_X(location::geometry),
      latitude = ST_Y(location::geometry)
    WHERE location IS NOT NULL AND (latitude IS NULL OR longitude IS NULL);
  `);

  console.log("Done updating coordinates!");
  process.exit(0);
}

main().catch(console.error);
