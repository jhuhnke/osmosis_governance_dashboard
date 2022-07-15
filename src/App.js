import logo from './logo.svg';
import './App.css';

import { Flipside, Query, Row } from "@flipsidecrypto/sdk"; 
import { Button, Form } from 'react-bootstrap'; 
import { setEnvironmentData } from 'worker_threads';

const API_KEY: string = `${process.env.REACT_APP_API_KEY}`; 

const getQuery = () => {
  const query: Query = {
    sql: `
      WITH proposal_voters AS (
        SELECT 
        block_timestamp :: date AS day,
        voter, 
        proposal_id
        FROM osmosis.core.fact_governance_votes
        
        
        qualify(ROW_NUMBER() over(PARTITION BY voter
        ORDER BY
        proposal_id ASC)) = 1
      ) 
    
      SELECT 
        count(DISTINCT voter) as total_new_voters, 
        proposal_id 
      FROM proposal_voters
      GROUP BY proposal_id  
    `, 
    ttlMinutes: 10, 
  }; 
  return(query); 
}

function App() {
  const [ label, setLabel ] = React.useState('');
	const [ fmp, setFmp ] = React.useState('');
	const base: Row[] = []
	const [ data, setData ] = React.useState(base);

  const runSDKApi = async () => {
    const flipside = new Flipside(
      API_KEY, 
      "https://node-api.flipsidecrypto.com"
    ); 

    const query = getQuery(); 
    const start = new Date().getTime(); 
    const result = await flipside.query.run(query); 
    const end = new Date().getTime(); 
    console.log(`Took ${Math.round((end - start) / 1000)} seconds to run the query`); 

    console.log(result.rows); 
    if (result.rows) {
      setEnvironmentData(result.rows); 
    }
  }

  const handler = () => {
    runSDKApi(); 
  }
  const cols = ['DAY', 'VOTER', 'PROPOSAL_ID']

  const rows = data.map(x => {
    return(<tr>
        {x.map( y => {return(<td>{y}</td>)} ) }
    </tr>)
  }); 
  const thead = <thead>
      {cols.map(x => {return(<th>{x}</th>)})}
  </thead>; 
  return (
    <div className="App">
      <header className="App-header">
        <h1>Osmosis Governance Statistics</h1>
        <div>
          <table>
            {thead}
            <tbody>
                {rows}
            </tbody>
          </table>
        </div>
      </header>
    </div>
  );
}

export default App;
