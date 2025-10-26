import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const PaperTrader = () => {
  const { user } = useAuth();
  const FINNHUB_KEY = 'd3qp9opr01quv7kbsve0d3qp9opr01quv7kbsveg';

  const [mode, setMode] = useState('easy');
  const [cash, setCash] = useState(50000);
  const [positions, setPositions] = useState({});
  const [selected, setSelected] = useState('AAPL');
  const [price, setPrice] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timePeriod, setTimePeriod] = useState('1Min');
  const [apiWarning, setApiWarning] = useState('');
  const tickers = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];

  const cacheRef = useRef({});
  const CACHE_TTL = 60 * 1000;

  useEffect(() => {
    if (user) {
      loadPortfolioFromDB();
    } else {
      const budgets = { easy: 50000, medium: 20000, hard: 5000 };
      setCash(budgets[mode]);
      setPositions({});
    }
  }, [mode, user]);

  const loadPortfolioFromDB = async () => {
    if (!user) return;

    const { data: portfolio } = await supabase
      .from('user_portfolios')
      .select('*')
      .eq('user_id', user.id)
      .eq('mode', mode)
      .maybeSingle();

    if (portfolio) {
      setCash(parseFloat(portfolio.cash.toString()));
      setPositions(portfolio.positions || {});
    } else {
      const budgets = { easy: 50000, medium: 20000, hard: 5000 };
      setCash(budgets[mode]);
      setPositions({});
    }
  };

  const savePortfolioToDB = async (newCash, newPositions) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_portfolios')
      .select('id')
      .eq('user_id', user.id)
      .eq('mode', mode)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_portfolios')
        .update({ cash: newCash, positions: newPositions })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_portfolios').insert({
        user_id: user.id,
        mode,
        cash: newCash,
        positions: newPositions,
      });
    }
  };

  useEffect(() => {
    let aborted = false;
    setLoading(true);
    setError('');
    setApiWarning('');

    const fetchData = async () => {
      try {
        try {
          const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${selected}&token=${FINNHUB_KEY}`);
          const quoteData = await quoteRes.json();
          if (quoteData && typeof quoteData.c === 'number') {
            if (!aborted) setPrice(quoteData.c);
          }
        } catch (qErr) {
          console.warn('Finnhub quote error:', qErr);
        }

        const cacheKey = `${selected}_${timePeriod}`;
        const cached = cacheRef.current[cacheKey];

        if (cached && Date.now() - cached._ts < CACHE_TTL) {
          setChartData(cached.data);
          setLoading(false);
          return;
        }

        const now = new Date();
        const dayOfWeek = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isMarketHours = hours >= 9 && (hours < 16 || (hours === 16 && minutes === 0));

        let timeframe = timePeriod;
        let limit = 60;
        const isIntradayTimeframe = ['1Min', '5Min', '15Min', '30Min', '1Hour'].includes(timePeriod);

        if (timePeriod === '1Min') {
          limit = 390;
        } else if (timePeriod === '5Min') {
          limit = 78;
        } else if (timePeriod === '15Min') {
          limit = 26;
        } else if (timePeriod === '30Min') {
          limit = 13;
        } else if (timePeriod === '1Hour') {
          limit = 6;
        } else if (timePeriod === '1Day') {
          limit = 60;
        } else if (timePeriod === '1Week') {
          limit = 52;
        } else if (timePeriod === '1Month') {
          limit = 24;
        } else if (timePeriod === '1Year') {
          limit = 5;
        }

        let formatted = [];

        if (isIntradayTimeframe && !isWeekend && isMarketHours) {
          const url = 'http://localhost:5000/api/alpaca-bars';

          const barsRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol: selected, timeframe, limit }),
          });

          if (barsRes.ok) {
            const barsData = await barsRes.json();
            if (barsData.bars && barsData.bars.length > 0) {
              formatted = barsData.bars.reverse().map((bar) => ({
                time: new Date(bar.t).toLocaleString(),
                price: parseFloat(bar.c),
              }));
              if (!aborted) {
                setChartData(formatted);
                setError('');
              }
              const toCache = { _ts: Date.now(), data: formatted };
              cacheRef.current[cacheKey] = toCache;
              setLoading(false);
              return;
            }
          }
        }

        const tiingoUrl = 'http://localhost:5000/api/tiingo-bars';

        const historicalRes = await fetch(tiingoUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: selected, timeframe, limit }),
        });

        if (!historicalRes.ok) {
          const errorData = await historicalRes.json();
          setError(`Error: ${errorData.error || 'Could not fetch data'}`);
          setChartData([]);
          setLoading(false);
          return;
        }

        const historicalData = await historicalRes.json();

        if (!historicalData.bars || historicalData.bars.length === 0) {
          setError('No data available for this symbol.');
          setChartData([]);
          setLoading(false);
          return;
        }

        formatted = historicalData.bars.reverse().map((bar) => ({
          time: new Date(bar.t).toLocaleString(),
          price: parseFloat(bar.c),
        }));

        const toCache = { _ts: Date.now(), data: formatted };
        cacheRef.current[cacheKey] = toCache;

        if (!aborted) {
          setChartData(formatted);
          setError('');
          if (isWeekend && isIntradayTimeframe) {
            setApiWarning('Market is closed. Showing historical intraday data.');
          }
        }
      } catch (err) {
        console.error('fetchData error:', err);
        if (!aborted) {
          setError(`Error fetching data: ${err.message}`);
          setChartData([]);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    const delay = setTimeout(fetchData, 200);
    return () => {
      aborted = true;
      clearTimeout(delay);
    };
  }, [selected, timePeriod]);

  const buy = async () => {
    const qty = parseInt(quantity, 10);
    if (!price || !qty || qty <= 0) return alert('Enter valid quantity and wait for price.');
    const cost = price * qty;
    if (cost > cash) return alert('Not enough cash.');

    const newCash = cash - cost;
    const newPositions = { ...positions, [selected]: (positions[selected] || 0) + qty };

    setCash(newCash);
    setPositions(newPositions);
    setQuantity('');

    if (user) {
      await savePortfolioToDB(newCash, newPositions);
    }
  };

  const sell = async () => {
    const qty = parseInt(quantity, 10);
    if (!price || !qty || qty <= 0) return alert('Enter valid quantity and wait for price.');
    const holding = positions[selected] || 0;
    if (qty > holding) return alert('Not enough shares.');

    const proceeds = price * qty;
    const newCash = cash + proceeds;
    const newPositions = { ...positions };
    newPositions[selected] = holding - qty;
    if (newPositions[selected] === 0) delete newPositions[selected];

    setCash(newCash);
    setPositions(newPositions);
    setQuantity('');

    if (user) {
      await savePortfolioToDB(newCash, newPositions);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <h2 className="text-3xl font-bold text-gray-900">Paper Trading Simulator</h2>
        <p className="text-gray-600 mt-1">Practice trading with virtual money</p>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy ($50k)</option>
                <option value="medium">Medium ($20k)</option>
                <option value="hard">Hard ($5k)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ticker</label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tickers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Time Period</label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1Min">1 Minute</option>
                <option value="5Min">5 Minutes</option>
                <option value="15Min">15 Minutes</option>
                <option value="30Min">30 Minutes</option>
                <option value="1Hour">1 Hour</option>
                <option value="1Day">Day</option>
                <option value="1Week">Week</option>
                <option value="1Month">Month</option>
                <option value="1Year">Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={buy}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                Buy
              </button>
              <button
                onClick={sell}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
              >
                Sell
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 font-semibold">Cash: ${cash.toLocaleString()}</p>
            <p className="text-gray-700 font-semibold">
              Holding {selected}: {positions[selected] || 0} shares
            </p>
            <p className="text-gray-700 font-semibold">
              Price (via Finnhub): {price ? `${price.toFixed(2)}` : 'Loading...'}
            </p>
          </div>

          {apiWarning && (
            <div className="mb-4 p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 font-medium">
              {apiWarning}
            </div>
          )}
          {error && !apiWarning && (
            <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-800 font-medium">{error}</div>
          )}

          <div>
            {loading ? (
              <p className="text-gray-500">Loading chart from backend...</p>
            ) : chartData.length === 0 ? (
              <p className="text-gray-500">No chart data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">Your Portfolio</h3>
          {Object.keys(positions).length === 0 ? (
            <p className="text-gray-500">No holdings yet.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 font-semibold text-gray-700">Ticker</th>
                  <th className="py-2 font-semibold text-gray-700">Shares</th>
                  <th className="py-2 font-semibold text-gray-700">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(positions).map(([ticker, qty]) => (
                  <tr key={ticker} className="border-b border-gray-100">
                    <td className="py-2">{ticker}</td>
                    <td className="py-2">{qty}</td>
                    <td className="py-2">${(qty * (price || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};