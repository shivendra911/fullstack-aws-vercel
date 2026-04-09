import { useState } from 'react'

function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  // Replace this with your actual AWS EC2 Public IPv4 address
  // const BACKEND_URL = "http://13.61.10.244/api/data";
  const BACKEND_URL = "/api/data";
  const fetchData = async () => {
    try {
      setError(null);
      
      const response = await fetch(BACKEND_URL);
      
      // Handle the Nginx 429 Too Many Requests rate limit
      if (response.status === 429) {
        throw new Error("Rate limit exceeded! (429 Too Many Requests)");
      }
      
      // If backend is down or unreachable
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>AWS Load Balancer + Vercel UI</h1>
      <button 
        onClick={fetchData} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Fetch Data from AWS
      </button>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', display: 'inline-block', minWidth: '300px' }}>
        {error && <h3 style={{ color: 'red' }}>{error}</h3>}
        
        {data && !error && (
          <>
            <h3 style={{ color: 'green' }}>{data.message}</h3>
            <p><strong>Responding Server:</strong> {data.server}</p>
            <p><strong>Timestamp:</strong> {data.timestamp}</p>
          </>
        )}
        
        {!data && !error && <p>Click the button to test the connection.</p>}
      </div>
    </div>
  )
}

export default App