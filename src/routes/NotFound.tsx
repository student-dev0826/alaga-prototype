import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
export default function NotFound() { return <div className="page"><PageTitle>Page not found</PageTitle><p className="mb-6">This page does not exist. You can return home to continue.</p><Link to="/" className="button">Return home</Link></div>; }
