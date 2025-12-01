# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Database migrations and server-side protections

I added a SQL migration to enforce portfolio cash constraints server-side and provide a safe RPC to upsert portfolios.

- File: `db/migrations/2025-10-28_portfolio_clamp_and_safe_upsert.sql`

This migration does two things:

1. Adds a trigger function (`clamp_portfolio_cash`) that prevents any inserted or updated `cash` value
	from being greater than the existing saved cash for that user+mode, or greater than the configured
	STARTING_CASH (75000) when creating a new portfolio. This protects persisted data from client-side tampering.

2. Adds an RPC function `rpc_safe_upsert_portfolio(user_uuid, mode, cash, positions)` which performs
	an upsert while ensuring cash cannot increase. This is the recommended method for clients to update portfolios.

Applying the migration

If you use the Supabase CLI (recommended):

```powershell
# Log into supabase (if needed)
supabase login
# Navigate to your project (or set SUPABASE_URL/SUPABASE_KEY env vars)
supabase db reset --file db/migrations/2025-10-28_portfolio_clamp_and_safe_upsert.sql
```

Or apply the SQL directly using psql:

```powershell
# Replace values with your DB connection string
psql "postgresql://<user>:<pass>@<host>:<port>/<db>" -f db/migrations/2025-10-28_portfolio_clamp_and_safe_upsert.sql
```

After applying, clients can call the RPC via Supabase client like:

```js
// Example client-side using supabase-js
const { data, error } = await supabase.rpc('rpc_safe_upsert_portfolio', {
  p_user: user.id,
  p_mode: 'default',
  p_cash: newCash,
  p_positions: newPositions,
});

if (error) console.error('RPC error', error);
```

Notes:
- Triggers run inside the database and are stronger than client-side checks. Still consider RLS policies to control who can call RPCs.
- The migration assumes a `user_portfolios` table with columns `(id, user_id uuid, mode text, cash numeric, positions jsonb)`.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
