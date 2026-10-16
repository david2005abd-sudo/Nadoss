const fs = require('fs');
const path = require('path');

const REF = 'bxcgscnfnegleffvphgo';
const TOKEN = process.env.SUPA_TOKEN;
const API = `https://api.supabase.com/v1/projects/${REF}/database/query`;

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

async function runQuery(query) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

(async () => {
  for (const file of files) {
    process.stdout.write(`Applying ${file} ... `);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      const { status, body } = await runQuery(sql);
      if (status === 200 || status === 201) {
        console.log(`OK (${status})`);
      } else {
        console.log(`FAILED (${status})`);
        console.log(body.slice(0, 500));
        process.exitCode = 1;
      }
    } catch (err) {
      console.log('NETWORK ERROR');
      console.error(err.message);
      process.exitCode = 1;
    }
  }
  console.log('\nVerifying tables...');
  const { status, body } = await runQuery(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
  );
  if (status === 200) {
    const tables = JSON.parse(body).map((r) => r.tablename);
    console.log(`Tables (${tables.length}):`, tables.join(', '));
  } else {
    console.log('Verify failed:', body.slice(0, 300));
  }
})();
