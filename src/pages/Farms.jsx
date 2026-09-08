import Layout from '../components/Layout';
import FarmCard from '../components/FarmCard';
import farms from '../data/farms';
import { countProductsByFarm } from '../data/products';
import './Farms.css';

const Farms = () => {
  return (
    <Layout role="buyer">
      <div className="farms-head">
        <h1>Registered farms</h1>
        <p>{farms.length} farms accepting orders right now. Pick one to shop its harvest.</p>
      </div>

      <div className="farms-grid">
        {farms.map((farm) => (
          <FarmCard key={farm.id} farm={farm} itemCount={countProductsByFarm(farm.id)} />
        ))}
      </div>
    </Layout>
  );
};

export default Farms;
